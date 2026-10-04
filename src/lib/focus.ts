import type { ActiveFocus, FocusLength, FocusState, Todo } from "@/lib/types";

export const EMPTY_FOCUS: FocusState = {
  active: null,
  focusedMsByDay: {},
  sessionsByDay: {},
};

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isFocusLength(value: unknown): value is FocusLength {
  return value === 25 || value === 50;
}

export function lengthMs(minutes: FocusLength): number {
  return minutes * 60_000;
}

export function remainingMs(active: ActiveFocus, now: number): number {
  if (active.endsAt == null) return Math.max(0, active.remainingMs);
  return Math.max(0, active.endsAt - now);
}

export function elapsedMs(active: ActiveFocus, now: number): number {
  const total = lengthMs(active.lengthMinutes);
  return Math.min(total, Math.max(0, total - remainingMs(active, now)));
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatFocused(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (ms > 0 && minutes < 1) return "under a minute";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function createActiveFocus(
  todo: Pick<Todo, "id" | "title">,
  minutes: FocusLength,
  dateKey: string,
  now: number,
  id: string
): ActiveFocus {
  const total = lengthMs(minutes);
  return {
    id,
    todoId: todo.id,
    title: todo.title,
    dateKey,
    lengthMinutes: minutes,
    endsAt: now + total,
    remainingMs: total,
    startedAt: now,
  };
}

export function pauseFocus(active: ActiveFocus, now: number): ActiveFocus {
  return {
    ...active,
    endsAt: null,
    remainingMs: remainingMs(active, now),
  };
}

export function resumeFocus(active: ActiveFocus, now: number): ActiveFocus {
  const left = Math.max(0, active.remainingMs);
  return {
    ...active,
    remainingMs: left,
    endsAt: now + left,
  };
}

export function focusedTodayMs(
  state: FocusState,
  dateKey: string,
  now: number
): number {
  const saved = state.focusedMsByDay[dateKey] ?? 0;
  if (!state.active || state.active.dateKey !== dateKey) return saved;
  return saved + elapsedMs(state.active, now);
}

function trimDayMap(
  map: Record<string, number>,
  keep = 60
): Record<string, number> {
  const keys = Object.keys(map).sort();
  if (keys.length <= keep) return map;
  const drop = new Set(keys.slice(0, keys.length - keep));
  return Object.fromEntries(
    Object.entries(map).filter(([key]) => !drop.has(key))
  );
}

export function creditFocus(
  state: FocusState,
  active: ActiveFocus,
  now: number,
  countSession: boolean
): FocusState {
  const gained = elapsedMs(active, now);
  const day = active.dateKey;
  const focusedMsByDay = trimDayMap({
    ...state.focusedMsByDay,
    [day]: (state.focusedMsByDay[day] ?? 0) + gained,
  });
  const sessionsByDay = countSession
    ? trimDayMap({
        ...state.sessionsByDay,
        [day]: (state.sessionsByDay[day] ?? 0) + 1,
      })
    : state.sessionsByDay;
  return { active: null, focusedMsByDay, sessionsByDay };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberMap(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const next: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!DATE_KEY.test(key) || typeof entry !== "number" || !Number.isFinite(entry)) {
      continue;
    }
    if (entry < 0) continue;
    next[key] = entry;
  }
  return trimDayMap(next);
}

function sanitizeActive(value: unknown): ActiveFocus | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id) return null;
  if (typeof value.todoId !== "string" || !value.todoId) return null;
  if (typeof value.title !== "string" || !value.title.trim()) return null;
  if (typeof value.dateKey !== "string" || !DATE_KEY.test(value.dateKey)) return null;
  if (!isFocusLength(value.lengthMinutes)) return null;
  if (typeof value.remainingMs !== "number" || value.remainingMs < 0) return null;
  if (typeof value.startedAt !== "number" || !Number.isFinite(value.startedAt)) {
    return null;
  }
  const endsAt =
    value.endsAt === null
      ? null
      : typeof value.endsAt === "number" && Number.isFinite(value.endsAt)
        ? value.endsAt
        : undefined;
  if (endsAt === undefined) return null;
  return {
    id: value.id,
    todoId: value.todoId,
    title: value.title,
    dateKey: value.dateKey,
    lengthMinutes: value.lengthMinutes,
    endsAt,
    remainingMs: value.remainingMs,
    startedAt: value.startedAt,
  };
}

export function sanitizeFocusState(raw: unknown): FocusState {
  if (!isRecord(raw)) return EMPTY_FOCUS;
  return {
    active: sanitizeActive(raw.active),
    focusedMsByDay: numberMap(raw.focusedMsByDay),
    sessionsByDay: numberMap(raw.sessionsByDay),
  };
}
