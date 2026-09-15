"use client";

import { SendHorizonal } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  journeyLabel: string;
  lensLabel: string;
};

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  journeyLabel,
  lensLabel,
}: Props) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-[color:var(--line)]/70 bg-[color:var(--surface)]/80 backdrop-blur-md">
      <form
        className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-3 sm:px-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex items-end gap-2 rounded-2xl border border-[color:var(--line)] bg-white/90 p-2 shadow-[0_16px_40px_rgba(11,31,51,0.08)] focus-within:border-[color:var(--accent)]/50 focus-within:ring-2 focus-within:ring-[color:var(--accent)]/20">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            rows={1}
            placeholder={`Ask about ${journeyLabel}…`}
            disabled={disabled}
            className="max-h-36 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted-ink)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent)] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send"
          >
            <SendHorizonal className="size-4" />
          </button>
        </div>
        <p className="px-1 text-[11px] text-[color:var(--muted-ink)]">
          Lens: {lensLabel} · Enter to send · Shift+Enter for newline · Sources
          stay attached; conflicts and gaps are never hidden.
        </p>
      </form>
    </div>
  );
}
