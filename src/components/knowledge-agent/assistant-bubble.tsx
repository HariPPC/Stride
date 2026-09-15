"use client";

import {
  AlertTriangle,
  CircleHelp,
  FileText,
  Link2,
  ShieldCheck,
} from "lucide-react";
import type { Confidence, KnowledgeAnswer, SourceKind } from "@/lib/knowledge/types";
import { cn } from "@/lib/utils";

const kindLabel: Record<SourceKind, string> = {
  code: "Code",
  jira: "Jira",
  confluence: "Confluence",
  ux: "UX",
  test: "Test",
  release: "Release",
};

function confidenceMeta(c: Confidence) {
  switch (c) {
    case "high":
      return { label: "High confidence", className: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    case "medium":
      return { label: "Medium confidence", className: "text-amber-800 bg-amber-50 border-amber-200" };
    case "low":
      return { label: "Low confidence", className: "text-slate-600 bg-slate-100 border-slate-200" };
  }
}

export function AssistantBubble({ answer }: { answer: KnowledgeAnswer }) {
  const conf = confidenceMeta(answer.confidence);

  return (
    <article className="animate-rise max-w-3xl rounded-2xl border border-[color:var(--line)]/90 bg-white/80 p-4 shadow-[0_20px_50px_rgba(11,31,51,0.06)] backdrop-blur-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--accent)]">
            {answer.useCase.replace("-", " ")}
          </p>
          <h2 className="mt-1 font-display text-2xl tracking-tight text-[color:var(--ink)]">
            {answer.title}
          </h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
            conf.className,
          )}
        >
          <ShieldCheck className="size-3.5" />
          {conf.label}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted-ink)] sm:text-[15px]">
        {answer.summary}
      </p>

      <div className="mt-5 space-y-4">
        {answer.sections.map((section) => (
          <section key={section.title}>
            <h3 className="text-sm font-semibold text-[color:var(--ink)]">
              {section.title}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-relaxed text-[color:var(--ink)]/90"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {answer.ownership && answer.ownership.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {answer.ownership.map((o) => (
            <span
              key={o}
              className="rounded-md bg-[color:var(--wash)] px-2 py-1 text-xs text-[color:var(--muted-ink)]"
            >
              {o}
            </span>
          ))}
        </div>
      )}

      {answer.conflicts.length > 0 && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertTriangle className="size-4" />
            Conflicts — not silently resolved
          </div>
          <ul className="mt-2 space-y-3">
            {answer.conflicts.map((c) => (
              <li key={c.topic} className="text-sm text-amber-950/90">
                <p className="font-medium">{c.topic}</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {c.statements.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <p className="mt-1.5 text-amber-800/90">{c.action}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.gaps.length > 0 && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/90 p-3.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CircleHelp className="size-4" />
            Knowledge gaps
          </div>
          <ul className="mt-2 space-y-2">
            {answer.gaps.map((g) => (
              <li key={g.topic} className="text-sm text-slate-700">
                <span className="font-medium">{g.topic}.</span> {g.detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      {answer.sources.length > 0 && (
        <details className="group mt-5 open:mt-5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">
            <Link2 className="size-4 text-[color:var(--accent)]" />
            Sources ({answer.sources.length})
            <span className="text-xs font-normal text-[color:var(--muted-ink)] group-open:hidden">
              expand
            </span>
          </summary>
          <ul className="mt-3 space-y-2">
            {answer.sources.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-3 rounded-lg border border-[color:var(--line)]/70 bg-[color:var(--wash)]/60 px-3 py-2.5"
              >
                <FileText className="mt-0.5 size-4 shrink-0 text-[color:var(--muted-ink)]" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-[color:var(--ink)]">
                      {s.title}
                    </span>
                    <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[color:var(--muted-ink)]">
                      {kindLabel[s.kind]}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-[color:var(--muted-ink)]">
                    {s.path}
                  </p>
                  {s.note && (
                    <p className="mt-1 text-xs text-[color:var(--muted-ink)]">{s.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-[color:var(--muted-ink)]">
        Prototype response from seeded Checkout knowledge. Human review remains
        mandatory for decisions, requirements, and release gates.
      </p>
    </article>
  );
}
