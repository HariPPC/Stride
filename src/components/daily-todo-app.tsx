"use client";

import { Download, ListTodo, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { AddTodoForm } from "@/components/add-todo-form";
import { BuddyCompanion } from "@/components/buddy-companion";
import { DayNote } from "@/components/day-note";
import { DaySwitcher } from "@/components/day-switcher";
import { FocusCard } from "@/components/focus-card";
import { ProjectList } from "@/components/project-list";
import { ReminderPermission } from "@/components/reminder-permission";
import { ReportPanel } from "@/components/report-panel";
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
import { formatDateKey, formatDisplayDate } from "@/lib/date";
import { buildProjectReminderLine } from "@/lib/speech";
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
    clearCompleted,
    dayLogs,
    updateDayLog,
    projects,
    addProject,
    updateProject,
    deleteProject,
    markProjectReminderFired,
  } = useTodos();

  const [filters, setFilters] = useState<TodoFilters>(DEFAULT_FILTERS);
  const [viewDate, setViewDate] = useState(dateKey);

  const { canInstall, installed, promptInstall } = usePwaInstall();

  const buddy = useBuddyVoice({
    enabled: settings.voiceEnabled,
    userName: settings.userName,
    todos,
    hydrated,
  });

  const projectNudges = useMemo(
    () =>
      projects.flatMap((project) => {
        if (!project.reminderTime) return [];
        const openTitles = allTodos
          .filter(
            (todo) =>
              todo.projectId === project.id &&
              !todo.completed &&
              todo.dateKey <= dateKey
          )
          .sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return priorityRank[a.priority] - priorityRank[b.priority];
          })
          .map((todo) => todo.title);
        return [
          {
            id: project.id,
            name: project.name,
            reminderTime: project.reminderTime,
            reminderFiredOn: project.reminderFiredOn,
            openTitles,
          },
        ];
      }),
    [projects, allTodos, dateKey]
  );

  const openCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const todo of allTodos) {
      if (todo.completed || !todo.projectId || todo.dateKey > dateKey) continue;
      counts[todo.projectId] = (counts[todo.projectId] ?? 0) + 1;
    }
    return counts;
  }, [allTodos, dateKey]);

  useReminders({
    todos,
    todayKey: dateKey,
    notificationsEnabled: settings.notificationsEnabled,
    projects: projectNudges,
    onFired: (id, title) => {
      markReminderFired(id);
      void buddy.remindAbout(title);
    },
    onProjectFired: (project) => {
      markProjectReminderFired(project.id, dateKey);
      const top = project.openTitles[0];
      if (!top) return;
      void buddy.say(
        buildProjectReminderLine(
          settings.userName,
          project.name,
          project.openTitles.length,
          top
        )
      );
    },
  });

  const dayTodos = useMemo(
    () => allTodos.filter((todo) => todo.dateKey === viewDate),
    [allTodos, viewDate]
  );

  const sorted = useMemo(
    () =>
      [...dayTodos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return priorityRank[a.priority] - priorityRank[b.priority];
      }),
    [dayTodos]
  );

  const visible = useMemo(
    () => filterTodos(sorted, filters),
    [sorted, filters]
  );

  const nudgeTask = useMemo(() => {
    const open = allTodos.filter((todo) => !todo.completed);
    const byFocus = (a: (typeof open)[number], b: (typeof open)[number]) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return priorityRank[a.priority] - priorityRank[b.priority];
    };
    const onView = open.filter((todo) => todo.dateKey === viewDate).sort(byFocus);
    if (onView[0]) return onView[0];
    const onToday = open.filter((todo) => todo.dateKey === dateKey).sort(byFocus);
    if (onToday[0]) return onToday[0];
    const upcoming = open
      .filter((todo) => todo.dateKey > dateKey)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || byFocus(a, b));
    if (upcoming[0]) return upcoming[0];
    const overdue = open
      .filter((todo) => todo.dateKey < dateKey)
      .sort((a, b) => b.dateKey.localeCompare(a.dateKey) || byFocus(a, b));
    return overdue[0] ?? null;
  }, [allTodos, viewDate, dateKey]);
  const pinned = sorted.find((t) => t.pinned) ?? null;
  const openCount = sorted.filter((todo) => !todo.completed).length;
  const doneCount = sorted.length - openCount;

  const carryCount = useMemo(
    () => allTodos.filter((t) => t.dateKey < dateKey && !t.completed).length,
    [allTodos, dateKey]
  );

  const viewLog = dayLogs.find((log) => log.dateKey === viewDate) ?? {
    dateKey: viewDate,
    moved: "",
    blocked: "",
  };
  const viewingToday = viewDate === dateKey;

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
          topTaskTitle={nudgeTask?.title ?? null}
          onUserNameChange={(userName) => updateSettings({ userName })}
          onVoiceEnabledChange={(voiceEnabled) =>
            updateSettings({ voiceEnabled })
          }
          onAskAgain={() => {
            void buddy.nudgeAbout(nudgeTask?.title ?? null);
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
        <ProjectList
          projects={projects}
          openCounts={openCounts}
          onAdd={addProject}
          onUpdate={updateProject}
          onDelete={deleteProject}
        />
        <AddTodoForm
          key={viewDate}
          defaultDate={viewDate}
          projects={projects}
          onAdd={(input) => {
            const title = input.title.trim();
            addTodo(input);
            if (input.dateKey) setViewDate(input.dateKey);
            if (title) void buddy.nudgeAbout(title);
          }}
        />
      </section>

      <section className="space-y-3">
        <DaySwitcher
          dateKey={viewDate}
          todayKey={dateKey}
          onChange={setViewDate}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <ListTodo className="size-4" />
            {viewingToday ? "Today" : formatDateKey(viewDate)}
          </h2>
          <div className="flex flex-wrap gap-2">
            {doneCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => clearCompleted(viewDate)}
              >
                Clear done
              </Button>
            ) : null}
            {viewingToday && carryCount > 0 ? (
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
              {viewingToday
                ? "Start with three outcomes for today"
                : "Nothing on this day yet"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Pick the date on the task, tag the kind, and attach a project when
              the work belongs to one. Pin the task that should get the nudge.
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
                  Clear the filters to see the rest of this day.
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
                    projects={projects}
                    projectName={
                      projects.find((project) => project.id === todo.projectId)
                        ?.name ?? null
                    }
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onUpdate={(id, patch) => {
                      updateTodo(id, patch);
                      if (patch.dateKey) setViewDate(patch.dateKey);
                    }}
                    onPin={setPinned}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <DayNote
        title={viewingToday ? "Today's note" : formatDateKey(viewDate)}
        moved={viewLog.moved}
        blocked={viewLog.blocked}
        onChange={(patch) => updateDayLog(viewDate, patch)}
      />

      <ReportPanel
        todos={allTodos}
        projects={projects}
        todayKey={dateKey}
        onSelectDate={setViewDate}
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
