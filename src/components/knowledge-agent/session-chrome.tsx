"use client";

import { ArrowUpRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JourneyId, JourneyMeta, RoleLens } from "@/lib/knowledge/types";

type Props = {
  journey: JourneyId;
  onJourneyChange: (id: JourneyId) => void;
  lens: RoleLens;
  onLensChange: (lens: RoleLens) => void;
  journeys: JourneyMeta[];
  roleLenses: { id: RoleLens; label: string; hint: string }[];
  hasChat: boolean;
  onReset: () => void;
};

export function SessionChrome({
  journey,
  onJourneyChange,
  lens,
  onLensChange,
  journeys,
  roleLenses,
  hasChat,
  onReset,
}: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--line)]/70 bg-[color:var(--surface)]/75 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[color:var(--ink)] text-[color:var(--foam)] shadow-[0_10px_30px_rgba(11,31,51,0.25)]">
            <span className="font-display text-lg leading-none tracking-tight">C</span>
          </div>
          <div>
            <p className="font-display text-lg leading-none tracking-tight text-[color:var(--ink)]">
              Current
            </p>
            <p className="mt-0.5 text-xs text-[color:var(--muted-ink)]">
              Ecommerce knowledge agent · MVP
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="journey">
            Pilot journey
          </label>
          <select
            id="journey"
            value={journey}
            onChange={(e) => onJourneyChange(e.target.value as JourneyId)}
            className="h-9 rounded-lg border border-[color:var(--line)] bg-white/80 px-2.5 text-sm text-[color:var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/40"
          >
            {journeys.map((j) => (
              <option key={j.id} value={j.id}>
                {j.label}
                {j.status === "pilot"
                  ? " · pilot"
                  : j.status === "benchmark"
                    ? " · benchmark"
                    : " · candidate"}
              </option>
            ))}
          </select>

          {hasChat && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[color:var(--line)] bg-white/70 px-2.5 text-sm text-[color:var(--ink)] transition hover:bg-white"
            >
              <RotateCcw className="size-3.5" />
              New chat
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
        {roleLenses.map((r) => {
          const active = r.id === lens;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onLensChange(r.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition",
                active
                  ? "bg-[color:var(--ink)] text-[color:var(--foam)]"
                  : "bg-white/55 text-[color:var(--muted-ink)] hover:bg-white/90 hover:text-[color:var(--ink)]",
              )}
            >
              {r.label}
              <span className={cn("text-[11px]", active ? "text-white/70" : "text-[color:var(--muted-ink)]")}>
                {r.hint}
              </span>
              {active && <ArrowUpRight className="size-3.5 opacity-70" />}
            </button>
          );
        })}
      </div>
    </header>
  );
}
