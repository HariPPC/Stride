"use client";

import { lastNDateKeys, weekdayShort } from "@/lib/date";
import type { DayProgress } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  progress: DayProgress[];
  todayKey: string;
};

export function WeekStreak({ progress, todayKey }: Props) {
  const keys = lastNDateKeys(7);

  return (
    <div className="flex items-end justify-between gap-1.5 sm:gap-2">
      {keys.map((key) => {
        const entry = progress.find((p) => p.dateKey === key);
        const ratio =
          !entry || entry.total === 0 ? null : entry.completed / entry.total;
        const isToday = key === todayKey;
        return (
          <div key={key} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={cn(
                "flex h-10 w-full max-w-10 items-end justify-center rounded-md bg-secondary/80",
                isToday && "ring-2 ring-primary/30"
              )}
              title={
                ratio === null
                  ? "No tasks"
                  : `${Math.round(ratio * 100)}% complete`
              }
            >
              <div
                className={cn(
                  "w-full rounded-md transition-all duration-500",
                  ratio === null && "h-1 bg-border",
                  ratio !== null && ratio < 1 && "bg-accent-teal/70",
                  ratio === 1 && "bg-accent-teal"
                )}
                style={{
                  height:
                    ratio === null
                      ? "4px"
                      : `${Math.max(12, Math.round(ratio * 100))}%`,
                }}
              />
            </div>
            <span
              className={cn(
                "text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
                isToday && "text-foreground"
              )}
            >
              {weekdayShort(key)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
