"use client";

import { Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { taskKindClass, taskKindLabel } from "@/lib/tasks";
import type { Todo } from "@/lib/types";

type Props = {
  todo: Todo;
  onNudge: () => void;
  onUnpin: () => void;
};

export function FocusCard({ todo, onNudge, onUnpin }: Props) {
  if (todo.completed) {
    return (
      <div className="rounded-2xl border border-border/60 bg-white/70 px-4 py-3 text-sm text-muted-foreground shadow-sm">
        Today&apos;s focus is done. Pin another task when you pick what&apos;s
        next.
      </div>
    );
  }

  const kind = taskKindLabel(todo.kind);

  return (
    <div className="rounded-2xl border border-primary/25 bg-white/85 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Pin className="size-3.5" />
            Today&apos;s focus
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-ink">
            {todo.title}
          </p>
          {todo.note ? (
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
              {todo.note}
            </p>
          ) : null}
          {kind && todo.kind ? (
            <Badge className={`mt-2 ${taskKindClass(todo.kind)}`}>{kind}</Badge>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" size="sm" onClick={onNudge}>
            Nudge me
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onUnpin}>
            Unpin
          </Button>
        </div>
      </div>
    </div>
  );
}
