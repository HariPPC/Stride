"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { todayKey } from "@/lib/date";
import {
  loadDayLogs,
  loadProgress,
  loadSettings,
  loadTodos,
  saveDayLogs,
  saveProgress,
  saveSettings,
  saveTodos,
  upsertDayLog,
  upsertDayProgress,
} from "@/lib/storage";
import type {
  AppSettings,
  DayLog,
  DayProgress,
  Priority,
  TaskKind,
  Todo,
  TodoPatch,
} from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

function createId(): string {
  return crypto.randomUUID();
}

export function useTodos() {
  const [hydrated, setHydrated] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [progress, setProgress] = useState<DayProgress[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [dayLogs, setDayLogs] = useState<DayLog[]>([]);
  const dateKey = todayKey();

  useEffect(() => {
    setTodos(loadTodos());
    setProgress(loadProgress());
    setSettings(loadSettings());
    setDayLogs(loadDayLogs());
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

  useEffect(() => {
    if (!hydrated) return;
    saveDayLogs(dayLogs);
  }, [dayLogs, hydrated]);

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
    (
      title: string,
      priority: Priority,
      reminderTime: string | null,
      kind: TaskKind | null = null,
      note = ""
    ) => {
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
        kind,
        note: note.trim(),
        pinned: false,
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

  const updateTodo = useCallback((id: string, patch: TodoPatch) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        if (patch.note !== undefined) next.note = patch.note.trim();
        if (
          patch.reminderTime !== undefined &&
          patch.reminderTime !== t.reminderTime
        ) {
          next.reminderFired = false;
        }
        return next;
      })
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setPinned = useCallback((id: string, pinned: boolean) => {
    setTodos((prev) => {
      const target = prev.find((todo) => todo.id === id);
      if (!target) return prev;
      return prev.map((todo) => {
        if (todo.id === id) return { ...todo, pinned };
        if (pinned && todo.dateKey === target.dateKey) {
          return { ...todo, pinned: false };
        }
        return todo;
      });
    });
  }, []);

  const clearCompletedToday = useCallback(() => {
    setTodos((prev) =>
      prev.filter((todo) => !(todo.dateKey === dateKey && todo.completed))
    );
  }, [dateKey]);

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
      pinned: false,
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

  const todayLog = useMemo(
    () =>
      dayLogs.find((log) => log.dateKey === dateKey) ?? {
        dateKey,
        moved: "",
        blocked: "",
      },
    [dayLogs, dateKey]
  );

  const updateTodayLog = useCallback(
    (patch: Partial<Pick<DayLog, "moved" | "blocked">>) => {
      setDayLogs((prev) => {
        const current = prev.find((log) => log.dateKey === dateKey) ?? {
          dateKey,
          moved: "",
          blocked: "",
        };
        return upsertDayLog(prev, { ...current, ...patch, dateKey });
      });
    },
    [dateKey]
  );

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
    setPinned,
    clearCompletedToday,
    todayLog,
    updateTodayLog,
  };
}
