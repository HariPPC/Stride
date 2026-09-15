"use client";

import { ArrowRight } from "lucide-react";

type Prompt = {
  label: string;
  prompt: string;
  useCase: string;
};

type Props = {
  prompts: readonly Prompt[];
  onPrompt: (prompt: string) => void;
  journeyLabel: string;
};

export function EmptyHero({ prompts, onPrompt, journeyLabel }: Props) {
  return (
    <section className="relative flex flex-1 flex-col justify-center py-8 sm:py-12">
      <div className="animate-rise max-w-2xl">
        <p className="font-display text-5xl tracking-tight text-[color:var(--ink)] sm:text-6xl md:text-7xl">
          Current
        </p>
        <h1 className="mt-5 max-w-xl text-balance text-2xl font-medium leading-snug text-[color:var(--ink)] sm:text-3xl">
          Ask what the system already does — with sources, conflicts, and gaps.
        </h1>
        <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-[color:var(--muted-ink)] sm:text-lg">
          Free-form discovery for {journeyLabel}. Answers stay traceable to code
          and approved artifacts. Nothing is invented when evidence is missing.
        </p>
      </div>

      <div className="animate-rise-delay mt-10 grid gap-2 sm:grid-cols-2">
        {prompts.map((p) => (
          <button
            key={p.prompt}
            type="button"
            onClick={() => onPrompt(p.prompt)}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-[color:var(--line)]/80 bg-white/55 px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]/40 hover:bg-white/90 hover:shadow-[0_18px_40px_rgba(11,31,51,0.08)]"
          >
            <span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--accent)]">
                {p.useCase}
              </span>
              <span className="mt-1 block text-sm font-medium text-[color:var(--ink)]">
                {p.label}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[color:var(--muted-ink)]">
                {p.prompt}
              </span>
            </span>
            <ArrowRight className="mt-1 size-4 shrink-0 text-[color:var(--muted-ink)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]" />
          </button>
        ))}
      </div>
    </section>
  );
}
