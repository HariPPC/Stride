"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { todayKey } from "@/lib/date";
import {
  loadProgress,
  loadSettings,
  loadTodos,
  saveProgress,
  saveSettings,
  saveTodos,
  upsertDayProgress,
} from "@/lib/storage";
import type { AppSettings, DayProgress, Priority, Todo } from "@/lib/types";

function createId(): string {
  return crypto.randomUUID();
}

export function useTodos() {
  const [hydrated, setHydrated] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [progress, setProgress] = useState<DayProgress[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    notificationsEnabled: false,
  });
  const dateKey = todayKey();

  useEffect(() => {
    setTodos(loadTodos());
    setProgress(loadProgress());
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveTodos(todos);
  }, [todos, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveProgress(progress);
  }, [progress, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveSettings(settings);
  }, [settings, hydrated]);

  const todayTodos = useMemo(
    () => todos.filter((t) => t.dateKey === dateKey),
    [todos, dateKey]
  );

  const completedCount = todayTodos.filter((t) => t.completed).length;
  const totalCount = todayTodos.length;
  const progressPct =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  useEffect(() => {
    if (!hydrated) return;
    setProgress((prev) =>
      upsertDayProgress(prev, {
        dateKey,
        total: totalCount,
        completed: completedCount,
      })
    );
  }, [hydrated, dateKey, totalCount, completedCount]);

  const addTodo = useCallback(
    (title: string, priority: Priority, reminderTime: string | null) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const todo: Todo = {
        id: createId(),
        title: trimmed,
        completed: false,
        priority,
        reminderTime,
        reminderFired: false,
        dateKey,
        createdAt: new Date().toISOString(),
      };
      setTodos((prev) => [todo, ...prev]);
    },
    [dateKey]
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }, []);

  const updateTodo = useCallback(
    (
      id: string,
      patch: Partial<Pick<Todo, "title" | "priority" | "reminderTime">>
    ) => {
      setTodos((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const next = { ...t, ...patch };
          if (
            patch.reminderTime !== undefined &&
            patch.reminderTime !== t.reminderTime
          ) {
            next.reminderFired = false;
          }
          return next;
        })
      );
    },
    []
  );

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markReminderFired = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, reminderFired: true } : t))
    );
  }, []);

  const carryIncompleteForward = useCallback(() => {
    const incomplete = todos.filter(
      (t) => t.dateKey !== dateKey && !t.completed
    );
    if (incomplete.length === 0) return 0;

    const carried: Todo[] = incomplete.map((t) => ({
      ...t,
      id: createId(),
      dateKey,
      completed: false,
      reminderFired: false,
      createdAt: new Date().toISOString(),
    }));

    const incompleteIds = new Set(incomplete.map((t) => t.id));
    setTodos((prev) => [
      ...carried,
      ...prev.filter((t) => !incompleteIds.has(t.id)),
    ]);
    return carried.length;
  }, [todos, dateKey]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const streak = useMemo(() => {
    let count = 0;
    const cursor = new Date();
    // Count consecutive prior days (and today if done) with at least one completion and full clear when total > 0
    for (let i = 0; i < 60; i += 1) {
      const key = todayKey(cursor);
      const entry = progress.find((p) => p.dateKey === key);
      const isToday = key === dateKey;
      if (!entry || entry.total === 0) {
        if (isToday) {
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
        break;
      }
      if (entry.completed === entry.total && entry.total > 0) {
        count += 1;
      } else if (!isToday) {
        break;
      } else {
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [progress, dateKey]);

  return {
    hydrated,
    dateKey,
    todos: todayTodos,
    allTodos: todos,
    progress,
    settings,
    completedCount,
    totalCount,
    progressPct,
    streak,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    markReminderFired,
    carryIncompleteForward,
    updateSettings,
  };
}
