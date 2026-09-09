import { NextResponse } from "next/server";

import { getSettings, listProgress, listTodos, replaceAllData } from "@/lib/db";
import type { AppSettings, DayProgress, Todo } from "@/lib/types";

export const runtime = "nodejs";

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.completed === "boolean" &&
    (t.priority === "high" || t.priority === "medium" || t.priority === "low") &&
    (t.reminderTime === null || typeof t.reminderTime === "string") &&
    typeof t.reminderFired === "boolean" &&
    typeof t.dateKey === "string" &&
    typeof t.createdAt === "string"
  );
}

function isProgress(value: unknown): value is DayProgress {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.dateKey === "string" &&
    typeof p.total === "number" &&
    typeof p.completed === "number"
  );
}

function isSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.notificationsEnabled === "boolean" &&
    typeof s.userName === "string" &&
    typeof s.voiceEnabled === "boolean"
  );
}

export async function GET() {
  return NextResponse.json({
    todos: listTodos(),
    progress: listProgress(),
    settings: getSettings(),
  });
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected an object body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const todos = payload.todos;
  const progress = payload.progress;
  const settings = payload.settings;

  if (!Array.isArray(todos) || !todos.every(isTodo)) {
    return NextResponse.json({ error: "Invalid todos payload" }, { status: 400 });
  }
  if (!Array.isArray(progress) || !progress.every(isProgress)) {
    return NextResponse.json(
      { error: "Invalid progress payload" },
      { status: 400 }
    );
  }
  if (settings !== undefined && !isSettings(settings)) {
    return NextResponse.json(
      { error: "Invalid settings payload" },
      { status: 400 }
    );
  }

  replaceAllData({
    todos,
    progress,
    settings: isSettings(settings) ? settings : undefined,
  });

  return NextResponse.json({
    ok: true,
    counts: {
      todos: todos.length,
      progress: progress.length,
    },
  });
}
