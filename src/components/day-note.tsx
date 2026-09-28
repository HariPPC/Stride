"use client";

import { Label } from "@/components/ui/label";

const fieldClass =
  "min-h-20 w-full resize-y rounded-lg border border-input bg-white/80 px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type Props = {
  moved: string;
  blocked: string;
  onChange: (patch: { moved?: string; blocked?: string }) => void;
};

export function DayNote({ moved, blocked, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-border/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <h2 className="font-display text-lg font-semibold text-ink">
        Today&apos;s note
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        What moved, and what is still blocked. Saved on this device with your
        tasks.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="day-moved">What moved</Label>
          <textarea
            id="day-moved"
            value={moved}
            onChange={(event) => onChange({ moved: event.target.value })}
            placeholder="Shipped the PRD outline, unblocked design review…"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="day-blocked">What&apos;s blocked</Label>
          <textarea
            id="day-blocked"
            value={blocked}
            onChange={(event) => onChange({ blocked: event.target.value })}
            placeholder="Waiting on legal for the pricing copy…"
            className={fieldClass}
          />
        </div>
      </div>
    </section>
  );
}
