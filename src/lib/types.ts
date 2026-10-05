export type AppSettings = {
  notificationsEnabled: boolean;
  /** Display name the buddy uses when speaking */
  userName: string;
  /** Speak greetings and task nudges aloud */
  voiceEnabled: boolean;
};

export type Priority = "high" | "medium" | "low";

export type JiraLink = {
  key: string;
  url: string;
  status: string;
  issueType: string;
};

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
  /** Set when the task was imported from Jira */
  jira?: JiraLink;
};

export type DayProgress = {
  dateKey: string;
  total: number;
  completed: number;
};

export const STORAGE_KEYS = {
  todos: "stride.todos.v1",
  progress: "stride.progress.v1",
  settings: "stride.settings.v1",
  jira: "stride.jira.v1",
} as const;

export type JiraCredentials = {
  email: string;
  apiToken: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  userName: "Hari",
  voiceEnabled: true,
};
