import type { AppSettings, DayProgress, JiraCredentials, Todo } from "@/lib/types";
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
  return readJson<Todo[]>(STORAGE_KEYS.todos, []);
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

export function loadJiraCredentials(): JiraCredentials {
  const stored = readJson<Partial<JiraCredentials>>(STORAGE_KEYS.jira, {});
  return {
    email: typeof stored.email === "string" ? stored.email : "",
    apiToken: typeof stored.apiToken === "string" ? stored.apiToken : "",
  };
}

export function saveJiraCredentials(credentials: JiraCredentials): void {
  writeJson(STORAGE_KEYS.jira, {
    email: credentials.email.trim(),
    apiToken: credentials.apiToken.trim(),
  });
}

export function clearJiraCredentials(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.jira);
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
