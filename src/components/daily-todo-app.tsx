"use client";

import { Download, ListTodo, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { AddTodoForm } from "@/components/add-todo-form";
import { BuddyCompanion } from "@/components/buddy-companion";
import { DayNote } from "@/components/day-note";
import { FocusCard } from "@/components/focus-card";
import { ReminderPermission } from "@/components/reminder-permission";
import { StartupGuide } from "@/components/startup-guide";
import { TaskFilters } from "@/components/task-filters";
import { TodoItem } from "@/components/todo-item";
import { WeekStreak } from "@/components/week-streak";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useBuddyVoice } from "@/hooks/use-buddy-voice";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useReminders } from "@/hooks/use-reminders";
import { useTodos } from "@/hooks/use-todos";
import { formatDisplayDate } from "@/lib/date";
import {
  DEFAULT_FILTERS,
  filterTodos,
  type TodoFilters,
} from "@/lib/tasks";

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
    setPinned,
    clearCompletedToday,
    todayLog,
    updateTodayLog,
  } = useTodos();

  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS);

  const { canInstall, installed, promptInstall } = usePwaInstall();

  const buddy = useBuddyVoice({
    enabled: settings.voiceEnabled,
    userName: settings.userName,
    todos,
    hydrated,
  });

  useReminders({
    todos,
    notificationsEnabled: settings.notificationsEnabled,
    onFired: (id, title) => {
      markReminderFired(id);
      void buddy.remindAbout(title);
    },
  });

  const sorted = useMemo(
    () =>
      [...todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return priorityRank[a.priority] - priorityRank[b.priority];
      }),
    [todos]
  );

  const visible = useMemo(
    () => filterTodos(sorted, filters),
    [sorted, filters]
  );

  const topOpen = sorted.find((t) => !t.completed) ?? null;
  const pinned = sorted.find((t) => t.pinned) ?? null;
  const openCount = sorted.filter((todo) => !todo.completed).length;
  const doneCount = sorted.length - openCount;

  const carryCount = useMemo(
    () => allTodos.filter((t) => t.dateKey !== dateKey && !t.completed).length,
    [allTodos, dateKey]
  );

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      {!hydrated ? (
        <p className="text-center text-xs text-muted-foreground">
          Loading saved tasks…
        </p>
      ) : null}
      <header className="animate-fade-up space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Stride
            </p>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Your daily PM checklist — with a buddy who speaks up when it&apos;s time to move.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-2xl bg-white/70 px-3 py-2 text-right shadow-sm backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Streak
              </p>
              <p className="font-display text-2xl font-semibold text-ink">
                {streak}
                <span className="ml-1 font-sans text-sm font-medium text-muted-foreground">
                  day{streak === 1 ? "" : "s"}
                </span>
              </p>
            </div>
            {canInstall ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void promptInstall()}
              >
                <Download data-icon="inline-start" />
                Install app
              </Button>
            ) : installed ? (
              <p className="text-[11px] font-medium text-muted-foreground">
                Installed on this device
              </p>
            ) : null}
          </div>
        </div>

        <BuddyCompanion
          userName={settings.userName}
          voiceEnabled={settings.voiceEnabled}
          line={buddy.line}
          speaking={buddy.speaking}
          topTaskTitle={topOpen?.title ?? null}
          onUserNameChange={(userName) => updateSettings({ userName })}
          onVoiceEnabledChange={(voiceEnabled) =>
            updateSettings({ voiceEnabled })
          }
          onAskAgain={() => {
            void buddy.nudgeAbout(topOpen?.title ?? null);
          }}
          onSilence={buddy.silence}
        />

        <div className="animate-fade-up-delay rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {formatDisplayDate()}
              </p>
              <h1 className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">
                Today&apos;s progress
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

      <section className="animate-fade-up-delay-2 space-y-3">
        <StartupGuide />
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
          <div className="flex flex-wrap gap-2">
            {doneCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearCompletedToday}
              >
                Clear done
              </Button>
            ) : null}
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
        </div>

        <Separator />

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white/40 px-5 py-10 text-center">
            <p className="font-display text-lg font-medium text-ink">
              Start with three outcomes for today
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Tag each one as a decision, doc, follow-up, or meeting. Pin the one
              that matters most — your buddy will nudge that task.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pinned ? (
              <FocusCard
                todo={pinned}
                onNudge={() => {
                  void buddy.nudgeAbout(pinned.title);
                }}
                onUnpin={() => setPinned(pinned.id, false)}
              />
            ) : null}
            <TaskFilters
              filters={filters}
              counts={{
                all: sorted.length,
                open: openCount,
                done: doneCount,
              }}
              onChange={(patch) =>
                setFilters((current) => ({ ...current, ...patch }))
              }
              onClear={() => setFilters(DEFAULT_FILTERS)}
            />
            {visible.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white/40 px-5 py-8 text-center">
                <p className="font-medium text-ink">Nothing matches this view</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Clear the filters to see the rest of today.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  Show all tasks
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-white/70 shadow-sm backdrop-blur-sm">
                {visible.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                    onPin={setPinned}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <DayNote
        moved={todayLog.moved}
        blocked={todayLog.blocked}
        onChange={updateTodayLog}
      />

      <footer className="space-y-2 pb-8 text-center text-xs text-muted-foreground">
        <p>Saved on this device · Install for a home-screen / dock icon</p>
        <p>
          Tip: after installing, add Stride to your OS login items / Startup apps so it
          opens when you start your computer. Browsers can&apos;t force that automatically.
        </p>
      </footer>
    </div>
  );
}
