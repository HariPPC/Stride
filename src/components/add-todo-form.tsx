"use client";

import { useState, type FormEvent } from "react";

import { TaskKindPicker } from "@/components/task-kind-picker";
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
import { TASK_KINDS } from "@/lib/tasks";
import type { Priority, TaskKind } from "@/lib/types";

type Props = {
  onAdd: (
    title: string,
    priority: Priority,
    reminderTime: string | null,
    kind: TaskKind | null,
    note: string
  ) => void;
};

const noteClass =
  "min-h-16 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AddTodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [reminderTime, setReminderTime] = useState("");
  const [kind, setKind] = useState<TaskKind | null>(null);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  const hint =
    TASK_KINDS.find((item) => item.id === kind)?.hint ??
    "Ship PRD for onboarding, prep stakeholder sync…";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onAdd(title, priority, reminderTime || null, kind, note);
    setTitle("");
    setReminderTime("");
    setPriority("medium");
    setKind(null);
    setNote("");
    setNoteOpen(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-border/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
    >
      <div className="space-y-1.5">
        <Label>Kind</Label>
        <TaskKindPicker value={kind} onChange={setKind} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="todo-title">Today’s focus</Label>
          <Input
            id="todo-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={hint}
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
      </div>
      {noteOpen ? (
        <div className="space-y-1.5">
          <Label htmlFor="todo-note">Note</Label>
          <textarea
            id="todo-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Why it matters, who it’s for, or the call you need to make."
            className={noteClass}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Add a note
        </button>
      )}
    </form>
  );
}
