"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateKey, shiftDateKey } from "@/lib/date";

type Props = {
  dateKey: string;
  todayKey: string;
  onChange: (dateKey: string) => void;
};

export function DaySwitcher({ dateKey, todayKey, onChange }: Props) {
  const isToday = dateKey === todayKey;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Previous day"
        onClick={() => onChange(shiftDateKey(dateKey, -1))}
      >
        <ChevronLeft />
      </Button>
      <Input
        type="date"
        value={dateKey}
        aria-label="Choose a day"
        onChange={(event) => {
          if (event.target.value) onChange(event.target.value);
        }}
        className="w-auto bg-white/80"
      />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Next day"
        onClick={() => onChange(shiftDateKey(dateKey, 1))}
      >
        <ChevronRight />
      </Button>
      <p className="text-sm font-medium text-foreground">
        {isToday ? "Today" : formatDateKey(dateKey)}
      </p>
      {isToday ? null : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(todayKey)}
        >
          Back to today
        </Button>
      )}
    </div>
  );
}
