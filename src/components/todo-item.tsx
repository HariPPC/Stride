"use client";

import { Bell, FileText, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Priority, Todo } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    patch: Partial<Pick<Todo, "title" | "priority" | "reminderTime" | "notes">>
  ) => void;
};

const priorityLabel: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [reminderTime, setReminderTime] = useState(todo.reminderTime ?? "");
  const [notes, setNotes] = useState(todo.notes ?? "");

  function save() {
    onUpdate(todo.id, {
      title: title.trim() || todo.title,
      priority,
      reminderTime: reminderTime || null,
      notes: notes.trim() || undefined,
    });
    setOpen(false);
  }

  return (
    <>
      <li
        className={cn(
          "group flex items-start gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-border/80 hover:bg-white/60",
          todo.completed && "opacity-60"
        )}
      >
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="mt-1"
          aria-label={`Mark ${todo.title} complete`}
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[15px] font-medium leading-snug text-foreground",
              todo.completed && "line-through decoration-foreground/40"
            )}
          >
            {todo.title}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "font-medium",
                todo.priority === "high" && "bg-rose-100 text-rose-800",
                todo.priority === "medium" && "bg-amber-100 text-amber-900",
                todo.priority === "low" && "bg-slate-100 text-slate-700"
              )}
            >
              {priorityLabel[todo.priority]}
            </Badge>
            {todo.reminderTime ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Bell className="size-3.5" />
                {todo.reminderTime}
                {todo.reminderFired && !todo.completed ? " · sent" : null}
              </span>
            ) : null}
          </div>
          {todo.notes ? (
            <div className="mt-2 rounded-lg bg-muted/60 px-2.5 py-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground"
                onClick={() => setNotesOpen((openNotes) => !openNotes)}
                aria-expanded={notesOpen}
              >
                <FileText className="size-3.5" />
                {notesOpen ? "Hide investigation" : "Show investigation"}
              </button>
              <p
                className={cn(
                  "mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground",
                  !notesOpen && "line-clamp-3"
                )}
              >
                {todo.notes}
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setTitle(todo.title);
              setPriority(todo.priority);
              setReminderTime(todo.reminderTime ?? "");
              setNotes(todo.notes ?? "");
              setOpen(true);
            }}
            aria-label="Edit task"
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(todo.id)}
            aria-label="Delete task"
          >
            <Trash2 />
          </Button>
        </div>
      </li>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor={`edit-title-${todo.id}`}>Title</Label>
              <Input
                id={`edit-title-${todo.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                <SelectTrigger>
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
              <Label htmlFor={`edit-reminder-${todo.id}`}>Reminder</Label>
              <Input
                id={`edit-reminder-${todo.id}`}
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-notes-${todo.id}`}>Notes</Label>
              <textarea
                id={`edit-notes-${todo.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Investigation notes, next steps, ticket links…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
