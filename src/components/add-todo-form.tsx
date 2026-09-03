"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Priority } from "@/lib/types";

type Props = {
  onAdd: (title: string, priority: Priority, reminderTime: string | null) => void;
};

export function AddTodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [reminderTime, setReminderTime] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onAdd(title, priority, reminderTime || null);
    setTitle("");
    setReminderTime("");
    setPriority("medium");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-border/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
    >
      <div className="space-y-1.5 sm:col-span-1">
        <Label htmlFor="todo-title">Today’s focus</Label>
        <Input
          id="todo-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ship PRD for onboarding, prep stakeholder sync…"
          autoComplete="off"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Priority</Label>
        <Select
          value={priority}
          onValueChange={(value) => {
            if (value) setPriority(value as Priority);
          }}
        >
          <SelectTrigger className="w-full min-w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reminder-time">Reminder</Label>
        <Input
          id="reminder-time"
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="min-w-32"
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        Add task
      </Button>
    </form>
  );
}
