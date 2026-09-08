import type { AppSettings, DayProgress, Todo } from "@/lib/types";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/types";
import { createData15464Task, DATA_15464_TASK_ID } from "@/lib/work-items";

function seedData15464(todos: Todo[]): Todo[] {
  if (typeof window === "undefined") return todos;
  if (window.localStorage.getItem(STORAGE_KEYS.data15464Seed) === "1") {
    return todos;
  }
  window.localStorage.setItem(STORAGE_KEYS.data15464Seed, "1");
  if (todos.some((t) => t.id === DATA_15464_TASK_ID)) {
    return todos;
  }
  return [createData15464Task(), ...todos];
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadTodos(): Todo[] {
  return seedData15464(readJson<Todo[]>(STORAGE_KEYS.todos, []));
}

export function saveTodos(todos: Todo[]): void {
  writeJson(STORAGE_KEYS.todos, todos);
}

export function loadProgress(): DayProgress[] {
  return readJson<DayProgress[]>(STORAGE_KEYS.progress, []);
}

export function saveProgress(progress: DayProgress[]): void {
  writeJson(STORAGE_KEYS.progress, progress);
}

export function loadSettings(): AppSettings {
  const stored = readJson<Partial<AppSettings>>(STORAGE_KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveSettings(settings: AppSettings): void {
  writeJson(STORAGE_KEYS.settings, settings);
}

export function upsertDayProgress(
  progress: DayProgress[],
  entry: DayProgress
): DayProgress[] {
  const next = progress.filter((p) => p.dateKey !== entry.dateKey);
  next.push(entry);
  next.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return next.slice(-60);
}
