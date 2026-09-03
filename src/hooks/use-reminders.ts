"use client";

import { useEffect, useRef } from "react";

import { parseReminder } from "@/lib/date";
import type { Todo } from "@/lib/types";

type Options = {
  todos: Todo[];
  notificationsEnabled: boolean;
  onFired: (id: string, title: string) => void;
};

export function useReminders({
  todos,
  notificationsEnabled,
  onFired,
}: Options) {
  const onFiredRef = useRef(onFired);
  onFiredRef.current = onFired;

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
    };

    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [todos, notificationsEnabled]);
}
