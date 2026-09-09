import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import type {
  AppSettings,
  DashboardStats,
  DayProgress,
  Priority,
  Todo,
} from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

export type { DashboardStats };

const globalForDb = globalThis as unknown as {
  strideDb?: Database.Database;
};

function dbPath(): string {
  return (
    process.env.STRIDE_DB_PATH ??
    path.join(process.cwd(), "data", "stride.db")
  );
}

function ensureSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL,
      reminder_time TEXT,
      reminder_fired INTEGER NOT NULL DEFAULT 0,
      date_key TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_todos_date_key ON todos(date_key);

    CREATE TABLE IF NOT EXISTS day_progress (
      date_key TEXT PRIMARY KEY NOT NULL,
      total INTEGER NOT NULL,
      completed INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      notifications_enabled INTEGER NOT NULL DEFAULT 0,
      user_name TEXT NOT NULL,
      voice_enabled INTEGER NOT NULL DEFAULT 1
    );
  `);

  const settings = db
    .prepare("SELECT id FROM settings WHERE id = 1")
    .get() as { id: number } | undefined;
  if (!settings) {
    db.prepare(
      `INSERT INTO settings (id, notifications_enabled, user_name, voice_enabled)
       VALUES (1, ?, ?, ?)`
    ).run(
      DEFAULT_SETTINGS.notificationsEnabled ? 1 : 0,
      DEFAULT_SETTINGS.userName,
      DEFAULT_SETTINGS.voiceEnabled ? 1 : 0
    );
  }
}

export function getDb(): Database.Database {
  if (globalForDb.strideDb) return globalForDb.strideDb;

  const file = dbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  ensureSchema(db);

  globalForDb.strideDb = db;
  return db;
}

type TodoRow = {
  id: string;
  title: string;
  completed: number;
  priority: string;
  reminder_time: string | null;
  reminder_fired: number;
  date_key: string;
  created_at: string;
};

type ProgressRow = {
  date_key: string;
  total: number;
  completed: number;
};

type SettingsRow = {
  notifications_enabled: number;
  user_name: string;
  voice_enabled: number;
};

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    priority: row.priority as Priority,
    reminderTime: row.reminder_time,
    reminderFired: Boolean(row.reminder_fired),
    dateKey: row.date_key,
    createdAt: row.created_at,
  };
}

export function listTodos(): Todo[] {
  const rows = getDb()
    .prepare(
      `SELECT id, title, completed, priority, reminder_time, reminder_fired, date_key, created_at
       FROM todos
       ORDER BY created_at DESC`
    )
    .all() as TodoRow[];
  return rows.map(rowToTodo);
}

export function listProgress(): DayProgress[] {
  const rows = getDb()
    .prepare(
      `SELECT date_key, total, completed
       FROM day_progress
       ORDER BY date_key ASC`
    )
    .all() as ProgressRow[];
  return rows.map((row) => ({
    dateKey: row.date_key,
    total: row.total,
    completed: row.completed,
  }));
}

export function getSettings(): AppSettings {
  const row = getDb()
    .prepare(
      `SELECT notifications_enabled, user_name, voice_enabled FROM settings WHERE id = 1`
    )
    .get() as SettingsRow | undefined;
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    notificationsEnabled: Boolean(row.notifications_enabled),
    userName: row.user_name,
    voiceEnabled: Boolean(row.voice_enabled),
  };
}

export function replaceAllData(input: {
  todos: Todo[];
  progress: DayProgress[];
  settings?: AppSettings;
}): void {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM todos").run();
    db.prepare("DELETE FROM day_progress").run();

    const insertTodo = db.prepare(
      `INSERT INTO todos
        (id, title, completed, priority, reminder_time, reminder_fired, date_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const todo of input.todos) {
      insertTodo.run(
        todo.id,
        todo.title,
        todo.completed ? 1 : 0,
        todo.priority,
        todo.reminderTime,
        todo.reminderFired ? 1 : 0,
        todo.dateKey,
        todo.createdAt
      );
    }

    const insertProgress = db.prepare(
      `INSERT INTO day_progress (date_key, total, completed) VALUES (?, ?, ?)`
    );
    for (const entry of input.progress) {
      insertProgress.run(entry.dateKey, entry.total, entry.completed);
    }

    if (input.settings) {
      db.prepare(
        `UPDATE settings
         SET notifications_enabled = ?, user_name = ?, voice_enabled = ?
         WHERE id = 1`
      ).run(
        input.settings.notificationsEnabled ? 1 : 0,
        input.settings.userName,
        input.settings.voiceEnabled ? 1 : 0
      );
    }
  });
  tx();
}

function computeStreak(progress: DayProgress[], today: string): number {
  let count = 0;
  const byKey = new Map(progress.map((p) => [p.dateKey, p]));
  const cursor = new Date(`${today}T12:00:00`);

  for (let i = 0; i < 60; i += 1) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
    const entry = byKey.get(key);
    const isToday = key === today;

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
}

export function getDashboardStats(todayKey: string): DashboardStats {
  const todos = listTodos();
  const progress = listProgress();
  const settings = getSettings();
  const completed = todos.filter((t) => t.completed).length;
  const open = todos.length - completed;
  const priorities: Priority[] = ["high", "medium", "low"];

  return {
    totals: {
      todos: todos.length,
      completed,
      open,
      completionRate:
        todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100),
      daysTracked: progress.filter((p) => p.total > 0).length,
      currentStreak: computeStreak(progress, todayKey),
    },
    byPriority: priorities.map((priority) => {
      const subset = todos.filter((t) => t.priority === priority);
      return {
        priority,
        total: subset.length,
        completed: subset.filter((t) => t.completed).length,
      };
    }),
    recentDays: progress.slice(-14),
    recentTodos: todos.slice(0, 12),
    settings,
    dbPath: dbPath(),
  };
}
