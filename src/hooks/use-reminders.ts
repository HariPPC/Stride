"use client";

import { useEffect, useRef } from "react";

import { parseReminder } from "@/lib/date";
import type { Todo } from "@/lib/types";

type Options = {
  todos: Todo[];
  enabled: boolean;
  onFired: (id: string) => void;
};

export function useReminders({ todos, enabled, onFired }: Options) {
  const onFiredRef = useRef(onFired);
  onFiredRef.current = onFired;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const tick = () => {
      const now = new Date();
      for (const todo of todos) {
        if (todo.completed || todo.reminderFired || !todo.reminderTime) continue;
        const when = parseReminder(todo.dateKey, todo.reminderTime);
        if (when.getTime() <= now.getTime()) {
          try {
            new Notification("Stride reminder", {
              body: todo.title,
              tag: todo.id,
            });
          } catch {
            // Some browsers require a service worker for notifications in insecure contexts.
          }
          onFiredRef.current(todo.id);
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [todos, enabled]);
}
