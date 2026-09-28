export type AppSettings = {
  notificationsEnabled: boolean;
  /** Display name the buddy uses when speaking */
  userName: string;
  /** Speak greetings and task nudges aloud */
  voiceEnabled: boolean;
};

export type Priority = "high" | "medium" | "low";

/** What kind of PM work this task is. Null on tasks created before kinds existed. */
export type TaskKind = "decision" | "doc" | "followup" | "meeting";

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
  kind: TaskKind | null;
  /** Extra context: why it matters, who it's for, the decision to make */
  note: string;
  /** At most one pinned task per day is today's focus */
  pinned: boolean;
};

export type TodoPatch = Partial<
  Pick<Todo, "title" | "priority" | "reminderTime" | "kind" | "note">
>;

export type DayProgress = {
  dateKey: string;
  total: number;
  completed: number;
};

/** End-of-day log for one date. */
export type DayLog = {
  dateKey: string;
  moved: string;
  blocked: string;
};

export const STORAGE_KEYS = {
  todos: "stride.todos.v1",
  progress: "stride.progress.v1",
  settings: "stride.settings.v1",
  dayLogs: "stride.daylog.v1",
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  userName: "Hari",
  voiceEnabled: true,
};
