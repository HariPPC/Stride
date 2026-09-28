"use client";

import { useEffect, useRef } from "react";

import { parseReminder } from "@/lib/date";
import type { Todo } from "@/lib/types";

export type ProjectNudge = {
  id: string;
  name: string;
  reminderTime: string;
  reminderFiredOn: string | null;
  openTitles: string[];
};

type Options = {
  todos: Todo[];
  todayKey: string;
  notificationsEnabled: boolean;
  projects: ProjectNudge[];
  onFired: (id: string, title: string) => void;
  onProjectFired: (project: ProjectNudge) => void;
};

export function useReminders({
  todos,
  todayKey,
  notificationsEnabled,
  projects,
  onFired,
  onProjectFired,
}: Options) {
  const onFiredRef = useRef(onFired);
  const onProjectFiredRef = useRef(onProjectFired);

  useEffect(() => {
    onFiredRef.current = onFired;
    onProjectFiredRef.current = onProjectFired;
  }, [onFired, onProjectFired]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tick = () => {
      const now = new Date();
      for (const todo of todos) {
        if (todo.completed || todo.reminderFired || !todo.reminderTime) continue;
        const when = parseReminder(todo.dateKey, todo.reminderTime);
        if (when.getTime() > now.getTime()) continue;

        if (
          notificationsEnabled &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification("Stride reminder", {
              body: todo.title,
              tag: todo.id,
              icon: "/icons/icon-192.png",
            });
          } catch {
            // Some browsers need a service worker context for notifications.
          }
        }

        onFiredRef.current(todo.id, todo.title);
      }

      for (const project of projects) {
        if (!project.reminderTime || project.openTitles.length === 0) continue;
        if (project.reminderFiredOn === todayKey) continue;
        const when = parseReminder(todayKey, project.reminderTime);
        if (when.getTime() > now.getTime()) continue;

        const top = project.openTitles[0];
        const extra = project.openTitles.length - 1;
        const body =
          extra > 0
            ? `${project.name}: ${top}, and ${extra} more`
            : `${project.name}: ${top}`;

        if (
          notificationsEnabled &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification("Stride project reminder", {
              body,
              tag: `project-${project.id}`,
              icon: "/icons/icon-192.png",
            });
          } catch {
            // Some browsers need a service worker context for notifications.
          }
        }

        onProjectFiredRef.current(project);
      }
    };

    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [todos, todayKey, notificationsEnabled, projects]);
}
