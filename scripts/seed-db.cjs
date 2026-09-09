/**
 * Seed sample Stride data into the local SQLite database.
 * Run: npm run db:seed
 */
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const file = process.env.STRIDE_DB_PATH ?? path.join(process.cwd(), "data", "stride.db");
fs.mkdirSync(path.dirname(file), { recursive: true });

const db = new Database(file);
db.pragma("journal_mode = WAL");

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

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayKey(d);
}

const todos = [
  {
    id: "seed-1",
    title: "Write PRD for onboarding redesign",
    completed: 1,
    priority: "high",
    reminder_time: "09:30",
    reminder_fired: 1,
    date_key: todayKey(),
    created_at: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "Review activation funnel metrics",
    completed: 0,
    priority: "high",
    reminder_time: "14:00",
    reminder_fired: 0,
    date_key: todayKey(),
    created_at: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "Sync with design on empty states",
    completed: 0,
    priority: "medium",
    reminder_time: null,
    reminder_fired: 0,
    date_key: todayKey(),
    created_at: new Date().toISOString(),
  },
  {
    id: "seed-4",
    title: "Customer call notes → opportunity doc",
    completed: 1,
    priority: "medium",
    reminder_time: null,
    reminder_fired: 0,
    date_key: daysAgo(1),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "seed-5",
    title: "Ship weekly product update",
    completed: 1,
    priority: "low",
    reminder_time: null,
    reminder_fired: 0,
    date_key: daysAgo(2),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const progress = Array.from({ length: 14 }, (_, i) => {
  const offset = 13 - i;
  const total = 3 + ((i * 2) % 3);
  const completed =
    offset === 0 ? 1 : offset === 1 ? total : Math.max(1, total - (i % 2));
  return { date_key: daysAgo(offset), total, completed };
});

const tx = db.transaction(() => {
  db.prepare("DELETE FROM todos").run();
  db.prepare("DELETE FROM day_progress").run();
  db.prepare("DELETE FROM settings").run();

  const insertTodo = db.prepare(`
    INSERT INTO todos
      (id, title, completed, priority, reminder_time, reminder_fired, date_key, created_at)
    VALUES (@id, @title, @completed, @priority, @reminder_time, @reminder_fired, @date_key, @created_at)
  `);
  for (const todo of todos) insertTodo.run(todo);

  const insertProgress = db.prepare(`
    INSERT INTO day_progress (date_key, total, completed)
    VALUES (@date_key, @total, @completed)
  `);
  for (const row of progress) insertProgress.run(row);

  db.prepare(`
    INSERT INTO settings (id, notifications_enabled, user_name, voice_enabled)
    VALUES (1, 0, 'Hari', 1)
  `).run();
});

tx();
db.close();

console.log(`Seeded ${file}`);
console.log("Open /dashboard to view analytics.");
