"use client";

import { useMemo, useState } from "react";

import { formatDateKey, weekdayShort } from "@/lib/date";
import { buildReport, type ReportRange } from "@/lib/report";
import type { Project, Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  todos: Todo[];
  projects: Project[];
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
};

export function ReportPanel({
  todos,
  projects,
  todayKey,
  onSelectDate,
}: Props) {
  const [range, setRange] = useState<ReportRange>(7);
  const report = useMemo(
    () => buildReport(todos, projects, todayKey, range),
    [todos, projects, todayKey, range]
  );
  const percent =
    report.total === 0 ? 0 : Math.round((report.completed / report.total) * 100);

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Report</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.total === 0
              ? `No tasks in the last ${range} days.`
              : `${report.completed} of ${report.total} done · ${percent}% · ${report.open} still open`}
          </p>
        </div>
        <div className="flex gap-1.5" role="group" aria-label="Report range">
          {([7, 30] as const).map((days) => (
            <button
              key={days}
              type="button"
              aria-pressed={range === days}
              onClick={() => setRange(days)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                range === days
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white/80 text-muted-foreground hover:bg-white"
              )}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          By day
        </p>
        {report.days.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dated tasks in this range.</p>
        ) : (
          <ul className="space-y-1.5">
            {report.days.map((day) => {
              const ratio = day.total === 0 ? 0 : day.completed / day.total;
              return (
                <li key={day.dateKey}>
                  <button
                    type="button"
                    onClick={() => onSelectDate(day.dateKey)}
                    className="grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-white"
                  >
                    <span
                      className={cn(
                        "text-xs font-medium uppercase tracking-wide text-muted-foreground",
                        day.dateKey === todayKey && "text-foreground"
                      )}
                    >
                      {weekdayShort(day.dateKey)} {day.dateKey.slice(8)}
                    </span>
                    <span className="h-2 overflow-hidden rounded-full bg-secondary">
                      <span
                        className="block h-full rounded-full bg-accent-teal"
                        style={{ width: `${Math.round(ratio * 100)}%` }}
                      />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {day.total === 0 ? "—" : `${day.completed}/${day.total}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {report.quietDays > 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {report.quietDays} {report.quietDays === 1 ? "day" : "days"} with no tasks are hidden.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            By project
          </p>
          {report.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No project activity in this range.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {report.projects.map((project) => (
                <li
                  key={project.id ?? "none"}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="min-w-0 truncate font-medium text-foreground">
                    {project.name}
                    {project.reminderTime ? (
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        · {project.reminderTime}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {project.completed} done · {project.open} open
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            By kind
          </p>
          {report.kinds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tagged work in this range.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {report.kinds.map((kind) => (
                <li
                  key={kind.label}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="font-medium text-foreground">{kind.label}</span>
                  <span className="text-muted-foreground">
                    {kind.completed} done · {kind.open} open
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Coming up
        </p>
        {report.upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing scheduled after today.
          </p>
        ) : (
          <ul className="space-y-1">
            {report.upcoming.map((day) => (
              <li key={day.dateKey}>
                <button
                  type="button"
                  onClick={() => onSelectDate(day.dateKey)}
                  className="flex w-full items-baseline justify-between gap-3 rounded-lg px-1 py-1 text-left text-sm hover:bg-white"
                >
                  <span className="font-medium text-foreground">
                    {formatDateKey(day.dateKey)}
                  </span>
                  <span className="text-muted-foreground">
                    {day.count} open {day.count === 1 ? "task" : "tasks"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
