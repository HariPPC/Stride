"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Database, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { formatDisplayDate, weekdayShort } from "@/lib/date";
import type { DashboardStats } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  stats: DashboardStats;
};

const priorityLabel = {
  high: "High",
  medium: "Medium",
  low: "Low",
} as const;

export function DashboardView({ stats }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [syncNote, setSyncNote] = useState<string | null>(null);

  const maxDayTotal = Math.max(1, ...stats.recentDays.map((d) => d.total));

  async function syncFromBrowser() {
    setSyncNote(null);
    try {
      const rawTodos = window.localStorage.getItem("stride.todos.v1");
      const rawProgress = window.localStorage.getItem("stride.progress.v1");
      const rawSettings = window.localStorage.getItem("stride.settings.v1");
      const todos = rawTodos ? JSON.parse(rawTodos) : [];
      const progress = rawProgress ? JSON.parse(rawProgress) : [];
      const settings = rawSettings ? JSON.parse(rawSettings) : undefined;

      const res = await fetch("/api/sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todos, progress, settings }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "Sync failed");
      }
      const data = (await res.json()) as {
        counts: { todos: number; progress: number };
      };
      setSyncNote(
        `Synced ${data.counts.todos} tasks and ${data.counts.progress} day records.`
      );
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setSyncNote(
        error instanceof Error ? error.message : "Could not sync from this browser."
      );
    }
  }

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(31,138,122,0.18),_transparent_60%),linear-gradient(180deg,#e8f1ef_0%,#f3f7f6_55%,#e8f1ef_100%)]"
      />

      <header className="animate-fade-up space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to today
            </Link>
            <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Stride
            </p>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
              Progress dashboard backed by your local SQLite database — ready for Cursor MCP queries.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => void syncFromBrowser()}
            >
              <RefreshCw data-icon="inline-start" className={cn(pending && "animate-spin")} />
              Sync from browser
            </Button>
            <p className="max-w-[14rem] text-right text-[11px] text-muted-foreground">
              {formatDisplayDate()}
            </p>
          </div>
        </div>

        {syncNote ? (
          <p className="rounded-xl border border-border/60 bg-white/70 px-3 py-2 text-sm text-foreground">
            {syncNote}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Tasks tracked", value: String(stats.totals.todos) },
            {
              label: "Completion",
              value: `${stats.totals.completionRate}%`,
            },
            { label: "Open tasks", value: String(stats.totals.open) },
            {
              label: "Current streak",
              value: `${stats.totals.currentStreak}d`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/60 bg-white/75 px-4 py-4 shadow-sm backdrop-blur-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-ink">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </header>

      <section className="animate-fade-up-delay grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border/60 bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <h2 className="font-display text-xl font-semibold text-ink">
            Last 14 days
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Daily completion from SQLite day_progress.
          </p>
          <div className="mt-6 flex h-44 items-end gap-1.5 sm:gap-2">
            {stats.recentDays.length === 0 ? (
              <p className="self-center text-sm text-muted-foreground">
                No progress yet — add tasks on Today, then sync.
              </p>
            ) : (
              stats.recentDays.map((day) => {
                const height =
                  day.total === 0
                    ? 8
                    : Math.max(12, Math.round((day.completed / maxDayTotal) * 100));
                const ratio = day.total === 0 ? 0 : day.completed / day.total;
                return (
                  <div
                    key={day.dateKey}
                    className="flex flex-1 flex-col items-center justify-end gap-2"
                    title={`${day.dateKey}: ${day.completed}/${day.total}`}
                  >
                    <div className="flex h-36 w-full items-end rounded-md bg-secondary/70">
                      <div
                        className={cn(
                          "w-full rounded-md transition-all duration-500",
                          ratio === 1 ? "bg-accent-teal" : "bg-accent-teal/70",
                          day.total === 0 && "bg-border"
                        )}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {weekdayShort(day.dateKey)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <h2 className="font-display text-xl font-semibold text-ink">
            By priority
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How your backlog splits across urgency.
          </p>
          <ul className="mt-6 space-y-4">
            {stats.byPriority.map((row) => {
              const pct =
                row.total === 0
                  ? 0
                  : Math.round((row.completed / row.total) * 100);
              return (
                <li key={row.priority}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {priorityLabel[row.priority]}
                    </span>
                    <span className="text-muted-foreground">
                      {row.completed}/{row.total} · {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="animate-fade-up-delay-2 space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Recent tasks
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest rows from the todos table.
          </p>
        </div>
        {stats.recentTodos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white/40 px-5 py-10 text-center">
            <p className="font-display text-lg font-medium text-ink">
              Database is empty
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Use Today to create tasks, then hit Sync from browser — or seed sample data with{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                npm run db:seed
              </code>
              .
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-white/75 shadow-sm backdrop-blur-sm">
            {stats.recentTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
              >
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium text-foreground",
                      todo.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {todo.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {todo.dateKey} · {priorityLabel[todo.priority]}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    todo.completed
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {todo.completed ? "Done" : "Open"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="rounded-2xl border border-border/60 bg-white/60 p-5 text-sm text-muted-foreground backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 size-4 shrink-0 text-accent-teal" />
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              Connected database
            </p>
            <p>
              SQLite file:{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs text-foreground">
                {stats.dbPath}
              </code>
            </p>
            <p>
              Cursor can query this DB via the{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                stride-sqlite
              </code>{" "}
              MCP server in{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                .cursor/mcp.json
              </code>
              . For Neon/Supabase/Postgres, swap the MCP entry and set{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                DATABASE_URL
              </code>{" "}
              in Cloud Agent secrets.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
