export type AppSettings = {
  notificationsEnabled: boolean;
  /** Display name the buddy uses when speaking */
  userName: string;
  /** Speak greetings and task nudges aloud */
  voiceEnabled: boolean;
};

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

export const FOCUS_LENGTHS = [25, 50] as const;

export type FocusLength = (typeof FOCUS_LENGTHS)[number];

/** One in-progress deep-work block. Time left is `endsAt` while running. */
export type ActiveFocus = {
  id: string;
  todoId: string;
  title: string;
  dateKey: string;
  lengthMinutes: FocusLength;
  /** Epoch ms when this stretch ends. Null while paused. */
  endsAt: number | null;
  /** Milliseconds left, used while paused. */
  remainingMs: number;
  startedAt: number;
};

export type FocusState = {
  active: ActiveFocus | null;
  /** Completed focus milliseconds keyed by date. */
  focusedMsByDay: Record<string, number>;
  /** Finished blocks (timer reached zero) keyed by date. */
  sessionsByDay: Record<string, number>;
};

export const STORAGE_KEYS = {
  todos: "stride.todos.v1",
  progress: "stride.progress.v1",
  settings: "stride.settings.v1",
  focus: "stride.focus.v1",
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  userName: "Hari",
  voiceEnabled: true,
};
