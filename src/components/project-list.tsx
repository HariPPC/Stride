"use client";

import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Project } from "@/lib/types";

type Props = {
  projects: Project[];
  openCounts: Record<string, number>;
  onAdd: (name: string, reminderTime: string | null) => void;
  onUpdate: (
    id: string,
    patch: { name?: string; reminderTime?: string | null }
  ) => void;
  onDelete: (id: string) => void;
};

export function ProjectList({
  projects,
  openCounts,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const [name, setName] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  function handleAdd(event: FormEvent) {
    event.preventDefault();
    onAdd(name, reminderTime || null);
    setName("");
    setReminderTime("");
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Projects
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Group tasks by project. Set a reminder only when you want one — it
          speaks up once a day, and only if that project still has open work
          from today or earlier.
        </p>
      </div>
      <form
        onSubmit={handleAdd}
        className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end"
      >
        <div className="space-y-1.5">
          <Label htmlFor="project-name">Project</Label>
          <Input
            id="project-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Onboarding, pricing, Q4 roadmap…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="project-reminder">Remind at</Label>
          <Input
            id="project-reminder"
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
            className="min-w-32"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Add project
        </Button>
      </form>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No projects yet. Tasks can stay unassigned until you need a reminder
          for the whole body of work.
        </p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-white/60">
          {projects.map((project) => {
            const open = openCounts[project.id] ?? 0;
            return (
              <li
                key={project.id}
                className="flex flex-wrap items-center gap-2 px-3 py-2"
              >
                <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
                  {project.name}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {open === 0 ? " · Nothing open" : ` · ${open} open`}
                  </span>
                </p>
                <Input
                  type="time"
                  aria-label={`Reminder for ${project.name}`}
                  value={project.reminderTime ?? ""}
                  onChange={(event) =>
                    onUpdate(project.id, {
                      reminderTime: event.target.value || null,
                    })
                  }
                  className="w-32 bg-white/80"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${project.name}`}
                  onClick={() => onDelete(project.id)}
                >
                  <Trash2 />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
