import { normalizeDayLog, normalizeProject, normalizeTodo } from "@/lib/tasks";
import type { AppSettings, DayLog, DayProgress, Project, Todo } from "@/lib/types";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/types";

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
  const raw = readJson<unknown>(STORAGE_KEYS.todos, []);
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const todo = normalizeTodo(item);
    return todo ? [todo] : [];
  });
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

export function loadDayLogs(): DayLog[] {
  const raw = readJson<unknown>(STORAGE_KEYS.dayLogs, []);
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const log = normalizeDayLog(item);
    return log ? [log] : [];
  });
}

export function saveDayLogs(logs: DayLog[]): void {
  writeJson(STORAGE_KEYS.dayLogs, logs);
}

export function loadProjects(): Project[] {
  const raw = readJson<unknown>(STORAGE_KEYS.projects, []);
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const project = normalizeProject(item);
    return project ? [project] : [];
  });
}

export function saveProjects(projects: Project[]): void {
  writeJson(STORAGE_KEYS.projects, projects);
}

export function upsertDayLog(logs: DayLog[], entry: DayLog): DayLog[] {
  const next = logs.filter((log) => log.dateKey !== entry.dateKey);
  if (entry.moved.length > 0 || entry.blocked.length > 0) {
    next.push({
      dateKey: entry.dateKey,
      moved: entry.moved,
      blocked: entry.blocked,
    });
  }
  next.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  return next.slice(-60);
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
