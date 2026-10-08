"use client";

import { TASK_KINDS } from "@/lib/tasks";
import type { TaskKind } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  value: TaskKind | null;
  onChange: (kind: TaskKind | null) => void;
};

export function TaskKindPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Task kind">
      {TASK_KINDS.map((kind) => {
        const selected = value === kind.id;
        return (
          <button
            key={kind.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : kind.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white/80 text-muted-foreground hover:bg-white"
            )}
          >
            {kind.label}
          </button>
        );
      })}
    </div>
  );
}
