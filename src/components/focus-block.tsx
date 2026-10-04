"use client";

import { Pause, Play, Timer } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  elapsedMs,
  formatClock,
  formatFocused,
  lengthMs,
  remainingMs,
} from "@/lib/focus";
import type { ActiveFocus, FocusLength, Todo } from "@/lib/types";
import { FOCUS_LENGTHS } from "@/lib/types";

type Props = {
  openTodos: Todo[];
  active: ActiveFocus | null;
  now: number;
  todayMs: number;
  todaySessions: number;
  onStart: (todo: Todo, minutes: FocusLength) => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

export function FocusBlock({
  openTodos,
  active,
  now,
  todayMs,
  todaySessions,
  onStart,
  onPause,
  onResume,
  onEnd,
}: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const selected =
    openTodos.find((todo) => todo.id === picked) ?? openTodos[0] ?? null;
  const liveTitle = active
    ? (openTodos.find((todo) => todo.id === active.todoId)?.title ??
      active.title)
    : null;

  const visibleMs = todayMs < 1000 ? 0 : todayMs;
  const summary =
    todaySessions > 0
      ? `${formatFocused(visibleMs)} focused today · ${todaySessions} block${todaySessions === 1 ? "" : "s"} finished`
      : visibleMs > 0
        ? `${formatFocused(visibleMs)} focused today`
        : "No focus time yet today";

  return (
    <section
      aria-labelledby="focus-heading"
      className="rounded-2xl border border-border/70 bg-white/75 p-4 shadow-sm backdrop-blur-sm sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="focus-heading"
            className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
          >
            <Timer className="size-4" />
            Focus block
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One task, a set stretch. Your buddy speaks when it starts and when it ends.
          </p>
        </div>
        <p className="max-w-[11rem] text-right text-xs font-medium text-foreground">
          {summary}
        </p>
      </div>

      {active && liveTitle ? (
        <ActiveBlock
          active={active}
          title={liveTitle}
          now={now}
          onPause={onPause}
          onResume={onResume}
          onEnd={onEnd}
        />
      ) : openTodos.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-white/40 px-4 py-6 text-center text-sm text-muted-foreground">
          Add a task, then start a 25- or 50-minute block on it.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="focus-task">Work on</Label>
            <Select
              value={selected?.id}
              items={Object.fromEntries(
                openTodos.map((todo) => [todo.id, todo.title])
              )}
              onValueChange={(value) => {
                if (value) setPicked(value);
              }}
            >
              <SelectTrigger id="focus-task" className="w-full min-w-0 bg-white/80">
                <SelectValue placeholder="Choose a task" />
              </SelectTrigger>
              <SelectContent>
                {openTodos.map((todo) => (
                  <SelectItem key={todo.id} value={todo.id}>
                    {todo.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {FOCUS_LENGTHS.map((minutes) => (
              <Button
                key={minutes}
                type="button"
                onClick={() => {
                  if (selected) onStart(selected, minutes);
                }}
                disabled={!selected}
              >
                <Play data-icon="inline-start" />
                {minutes} min
              </Button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ActiveBlock({
  active,
  title,
  now,
  onPause,
  onResume,
  onEnd,
}: {
  active: ActiveFocus;
  title: string;
  now: number;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}) {
  const left = remainingMs(active, now);
  const total = lengthMs(active.lengthMinutes);
  const done = elapsedMs(active, now);
  const paused = active.endsAt == null;
  const pct = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100));

  return (
    <div className="mt-4 rounded-xl bg-secondary/50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {paused ? "Paused" : "In focus"}
      </p>
      <p
        className="mt-1 font-display text-5xl font-semibold tracking-tight text-ink tabular-nums"
        aria-live="polite"
      >
        {formatClock(left)}
      </p>
      <p className="mt-2 text-base font-medium text-foreground">{title}</p>
      <Progress
        value={pct}
        aria-label="Focus block progress"
        className="mt-4"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {paused ? (
          <Button type="button" onClick={onResume}>
            <Play data-icon="inline-start" />
            Resume
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={onPause}>
            <Pause data-icon="inline-start" />
            Pause
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onEnd}>
          End block
        </Button>
      </div>
    </div>
  );
}
