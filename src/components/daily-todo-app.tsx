"use client";

import { ListTodo, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { AddTodoForm } from "@/components/add-todo-form";
import { ReminderPermission } from "@/components/reminder-permission";
import { TodoItem } from "@/components/todo-item";
import { WeekStreak } from "@/components/week-streak";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useReminders } from "@/hooks/use-reminders";
import { useTodos } from "@/hooks/use-todos";
import { formatDisplayDate } from "@/lib/date";

const priorityRank = { high: 0, medium: 1, low: 2 } as const;

export function DailyTodoApp() {
  const {
    hydrated,
    dateKey,
    todos,
    allTodos,
    progress,
    settings,
    completedCount,
    totalCount,
    progressPct,
    streak,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    markReminderFired,
    carryIncompleteForward,
    updateSettings,
  } = useTodos();

  useReminders({
    todos,
    enabled: settings.notificationsEnabled,
    onFired: markReminderFired,
  });

  const sorted = useMemo(
    () =>
      [...todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return priorityRank[a.priority] - priorityRank[b.priority];
      }),
    [todos]
  );

  const carryCount = useMemo(
    () => allTodos.filter((t) => t.dateKey !== dateKey && !t.completed).length,
    [allTodos, dateKey]
  );

  if (!hydrated) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-white/50" />
        <div className="h-28 animate-pulse rounded-2xl bg-white/50" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/50" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-5 animate-fade-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Stride
            </p>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Your daily PM checklist — clear priorities, timed nudges, visible progress.
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-3 py-2 text-right shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Streak
            </p>
            <p className="font-display text-2xl font-semibold text-ink">
              {streak}
              <span className="ml-1 text-sm font-sans font-medium text-muted-foreground">
                day{streak === 1 ? "" : "s"}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm backdrop-blur-sm sm:p-5 animate-fade-up-delay">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {formatDisplayDate()}
              </p>
              <h1 className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
                Today’s progress
              </h1>
            </div>
            <p className="text-sm font-medium text-foreground">
              {totalCount === 0
                ? "No tasks yet"
                : `${completedCount} of ${totalCount} done · ${progressPct}%`}
            </p>
          </div>
          <Progress value={progressPct} className="mt-4 h-2.5" />
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Last 7 days
            </p>
            <WeekStreak progress={progress} todayKey={dateKey} />
          </div>
        </div>
      </header>

      <section className="space-y-3 animate-fade-up-delay-2">
        <ReminderPermission
          enabled={settings.notificationsEnabled}
          onChange={(notificationsEnabled) =>
            updateSettings({ notificationsEnabled })
          }
        />
        <AddTodoForm onAdd={addTodo} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <ListTodo className="size-4" />
            Today
          </h2>
          {carryCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => carryIncompleteForward()}
            >
              <Sparkles data-icon="inline-start" />
              Carry {carryCount} unfinished
            </Button>
          ) : null}
        </div>

        <Separator />

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white/40 px-5 py-10 text-center">
            <p className="font-display text-lg font-medium text-ink">
              Start with three outcomes for today
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Add the decisions, docs, and follow-ups that move your product forward.
              Attach a reminder for anything time-sensitive.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-white/70 shadow-sm backdrop-blur-sm">
            {sorted.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
              />
            ))}
          </ul>
        )}
      </section>

      <footer className="pb-8 text-center text-xs text-muted-foreground">
        Saved on this device · Keep the tab open for reminder alerts
      </footer>
    </div>
  );
}
