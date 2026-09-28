"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TASK_KINDS,
  filtersAreActive,
  type StatusFilter,
  type TodoFilters,
} from "@/lib/tasks";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

type Counts = {
  all: number;
  open: number;
  done: number;
};

type Props = {
  filters: TodoFilters;
  counts: Counts;
  onChange: (patch: Partial<TodoFilters>) => void;
  onClear: () => void;
};

const STATUSES: { id: StatusFilter; label: (counts: Counts) => string }[] = [
  { id: "all", label: (counts) => `All ${counts.all}` },
  { id: "open", label: (counts) => `Open ${counts.open}` },
  { id: "done", label: (counts) => `Done ${counts.done}` },
];

const PRIORITIES: { id: Priority | "all"; label: string }[] = [
  { id: "all", label: "Any priority" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
];

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white/70 text-muted-foreground hover:bg-white"
      )}
    >
      {children}
    </button>
  );
}

export function TaskFilters({ filters, counts, onChange, onClear }: Props) {
  const active = filtersAreActive(filters);

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-white/50 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Search tasks or notes"
          aria-label="Search tasks or notes"
          className="bg-white/80 pl-8"
        />
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status">
        {STATUSES.map((status) => (
          <Chip
            key={status.id}
            pressed={filters.status === status.id}
            onClick={() => onChange({ status: status.id })}
          >
            {status.label(counts)}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Kind">
        <Chip
          pressed={filters.kind === "all"}
          onClick={() => onChange({ kind: "all" })}
        >
          Any kind
        </Chip>
        {TASK_KINDS.map((kind) => (
          <Chip
            key={kind.id}
            pressed={filters.kind === kind.id}
            onClick={() => onChange({ kind: kind.id })}
          >
            {kind.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Priority">
        {PRIORITIES.map((priority) => (
          <Chip
            key={priority.id}
            pressed={filters.priority === priority.id}
            onClick={() => onChange({ priority: priority.id })}
          >
            {priority.label}
          </Chip>
        ))}
        {active ? (
          <Button type="button" variant="ghost" size="xs" onClick={onClear}>
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
