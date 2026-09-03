export type Priority = "high" | "medium" | "low";

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  /** Local time HH:MM for same-day reminder, or null */
  reminderTime: string | null;
  /** Whether the reminder notification has already fired today */
  reminderFired: boolean;
  dateKey: string;
  createdAt: string;
};

export type DayProgress = {
  dateKey: string;
  total: number;
  completed: number;
};

export type AppSettings = {
  notificationsEnabled: boolean;
};

export const STORAGE_KEYS = {
  todos: "stride.todos.v1",
  progress: "stride.progress.v1",
  settings: "stride.settings.v1",
} as const;
