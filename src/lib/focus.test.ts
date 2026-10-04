import assert from "node:assert/strict";
import test from "node:test";

import {
  createActiveFocus,
  creditFocus,
  elapsedMs,
  EMPTY_FOCUS,
  focusedTodayMs,
  formatClock,
  formatFocused,
  pauseFocus,
  remainingMs,
  resumeFocus,
  sanitizeFocusState,
} from "./focus.ts";

const todo = { id: "task-1", title: "Write the PRD" };
const start = 1_700_000_000_000;

test("a new block runs for the full length", () => {
  const active = createActiveFocus(todo, 25, "2026-10-04", start, "block-1");
  assert.equal(remainingMs(active, start), 25 * 60_000);
  assert.equal(formatClock(remainingMs(active, start)), "25:00");
  assert.equal(elapsedMs(active, start + 60_000), 60_000);
  assert.equal(formatClock(remainingMs(active, start + 1000)), "24:59");
});

test("pause freezes the clock and resume continues it", () => {
  const active = createActiveFocus(todo, 25, "2026-10-04", start, "block-1");
  const paused = pauseFocus(active, start + 90_000);
  assert.equal(paused.endsAt, null);
  assert.equal(remainingMs(paused, start + 500_000), 25 * 60_000 - 90_000);

  const resumed = resumeFocus(paused, start + 500_000);
  assert.equal(resumed.endsAt, start + 500_000 + paused.remainingMs);
  assert.equal(elapsedMs(resumed, start + 500_000), 90_000);
});

test("finishing credits the full block and an early stop does not", () => {
  const active = createActiveFocus(todo, 50, "2026-10-04", start, "block-1");
  const doneAt = start + 50 * 60_000;
  const finished = creditFocus(EMPTY_FOCUS, active, doneAt, true);
  assert.equal(finished.active, null);
  assert.equal(finished.focusedMsByDay["2026-10-04"], 50 * 60_000);
  assert.equal(finished.sessionsByDay["2026-10-04"], 1);

  const stopped = creditFocus(EMPTY_FOCUS, active, start + 8 * 60_000, false);
  assert.equal(stopped.focusedMsByDay["2026-10-04"], 8 * 60_000);
  assert.equal(stopped.sessionsByDay["2026-10-04"], undefined);
});

test("today's total includes the block that is still running", () => {
  const active = createActiveFocus(todo, 25, "2026-10-04", start, "block-1");
  const state = {
    ...EMPTY_FOCUS,
    active,
    focusedMsByDay: { "2026-10-04": 10 * 60_000 },
  };
  assert.equal(focusedTodayMs(state, "2026-10-04", start + 5 * 60_000), 15 * 60_000);
  assert.equal(focusedTodayMs(state, "2026-10-03", start), 0);
});

test("formatFocused uses hours once a block crosses sixty minutes", () => {
  assert.equal(formatFocused(0), "0 min");
  assert.equal(formatFocused(30_000), "under a minute");
  assert.equal(formatFocused(12 * 60_000), "12 min");
  assert.equal(formatFocused(90 * 60_000), "1h 30m");
});

test("corrupt saves fall back and a valid save round-trips", () => {
  assert.deepEqual(sanitizeFocusState(null), EMPTY_FOCUS);
  assert.deepEqual(sanitizeFocusState({ active: { id: "x" } }), EMPTY_FOCUS);

  const active = createActiveFocus(todo, 25, "2026-10-04", start, "block-1");
  const saved = {
    active,
    focusedMsByDay: { "2026-10-04": 120000, bad: -1, "nope": 5 },
    sessionsByDay: { "2026-10-04": 2 },
  };
  const loaded = sanitizeFocusState(saved);
  assert.deepEqual(loaded.active, active);
  assert.deepEqual(loaded.focusedMsByDay, { "2026-10-04": 120000 });
  assert.deepEqual(loaded.sessionsByDay, { "2026-10-04": 2 });
});
