"use client";

import { Bell, Pencil, Pin, Trash2 } from "lucide-react";
import { useState } from "react";

import { TaskKindPicker } from "@/components/task-kind-picker";
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
import { taskKindClass, taskKindLabel } from "@/lib/tasks";
import type { Priority, Project, TaskKind, Todo, TodoPatch } from "@/lib/types";
import { cn } from "@/lib/utils";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type Props = {
  todo: Todo;
  projects: Project[];
  projectName: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: TodoPatch) => void;
  onPin: (id: string, pinned: boolean) => void;
};

const priorityLabel: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const noteClass =
  "min-h-20 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function TodoItem({
  todo,
  projects,
  projectName,
  onToggle,
  onDelete,
  onUpdate,
  onPin,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [reminderTime, setReminderTime] = useState(todo.reminderTime ?? "");
  const [kind, setKind] = useState<TaskKind | null>(todo.kind);
  const [note, setNote] = useState(todo.note);
  const [dateKey, setDateKey] = useState(todo.dateKey);
  const [projectId, setProjectId] = useState<string | null>(todo.projectId);

  function openEditor() {
    setTitle(todo.title);
    setPriority(todo.priority);
    setReminderTime(todo.reminderTime ?? "");
    setKind(todo.kind);
    setNote(todo.note);
    setDateKey(todo.dateKey);
    setProjectId(todo.projectId);
    setOpen(true);
  }

  function save() {
    onUpdate(todo.id, {
      title: title.trim() || todo.title,
      priority,
      reminderTime: reminderTime || null,
      kind,
      note,
      dateKey,
      projectId,
    });
    setOpen(false);
  }

  const kindLabel = taskKindLabel(todo.kind);

  return (
    <>
      <li
        className={cn(
          "group flex items-start gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-border/80 hover:bg-white/60",
          todo.completed && "opacity-60",
          todo.pinned && !todo.completed && "bg-primary/5"
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
          {todo.note ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {todo.note}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {todo.pinned ? (
              <Badge className="bg-primary/10 text-primary">Focus</Badge>
            ) : null}
            {projectName ? (
              <Badge className="bg-emerald-100 text-emerald-900">{projectName}</Badge>
            ) : null}
            {kindLabel && todo.kind ? (
              <Badge className={taskKindClass(todo.kind)}>{kindLabel}</Badge>
            ) : null}
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
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-pressed={todo.pinned}
            aria-label={
              todo.pinned ? "Unpin today's focus" : "Pin as today's focus"
            }
            title={todo.pinned ? "Unpin today's focus" : "Pin as today's focus"}
            onClick={() => onPin(todo.id, !todo.pinned)}
            className={cn(todo.pinned && "text-primary")}
          >
            <Pin />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={openEditor}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label>Kind</Label>
              <TaskKindPicker value={kind} onChange={setKind} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-title-${todo.id}`}>Title</Label>
              <Input
                id={`edit-title-${todo.id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-note-${todo.id}`}>Note</Label>
              <textarea
                id={`edit-note-${todo.id}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Context for this decision, doc, or follow-up."
                className={noteClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-date-${todo.id}`}>Date</Label>
              <Input
                id={`edit-date-${todo.id}`}
                type="date"
                value={dateKey}
                onChange={(event) => setDateKey(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`edit-project-${todo.id}`}>Project</Label>
              <select
                id={`edit-project-${todo.id}`}
                value={projectId ?? ""}
                onChange={(event) => setProjectId(event.target.value || null)}
                className={selectClass}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
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
