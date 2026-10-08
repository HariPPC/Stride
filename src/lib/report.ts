import { dateKeysEndingAt } from "@/lib/date";
import { TASK_KINDS } from "@/lib/tasks";
import type { Project, TaskKind, Todo } from "@/lib/types";

export type ReportRange = 7 | 30;

export type DayReport = {
  dateKey: string;
  total: number;
  completed: number;
};

export type ProjectReport = {
  id: string | null;
  name: string;
  open: number;
  completed: number;
  reminderTime: string | null;
};

export type KindReport = {
  label: string;
  open: number;
  completed: number;
};

export type UpcomingDay = {
  dateKey: string;
  count: number;
};

export type Report = {
  days: DayReport[];
  quietDays: number;
  projects: ProjectReport[];
  kinds: KindReport[];
  upcoming: UpcomingDay[];
  total: number;
  completed: number;
  open: number;
};

function countsFor(todos: Todo[]): { total: number; completed: number } {
  const completed = todos.filter((todo) => todo.completed).length;
  return { total: todos.length, completed };
}

export function buildReport(
  todos: Todo[],
  projects: Project[],
  today: string,
  range: ReportRange
): Report {
  const keys = dateKeysEndingAt(today, range);
  const keySet = new Set(keys);
  const inRange = todos.filter((todo) => keySet.has(todo.dateKey));
  const days = keys.map((dateKey) => {
    const dayTodos = inRange.filter((todo) => todo.dateKey === dateKey);
    return { dateKey, ...countsFor(dayTodos) };
  });
  const visibleDays = range === 7 ? days : days.filter((day) => day.total > 0);
  const summary = countsFor(inRange);

  const projectRows: ProjectReport[] = projects.map((project) => {
    const rows = inRange.filter((todo) => todo.projectId === project.id);
    const counted = countsFor(rows);
    return {
      id: project.id,
      name: project.name,
      open: counted.total - counted.completed,
      completed: counted.completed,
      reminderTime: project.reminderTime,
    };
  });

  const unassigned = inRange.filter((todo) => {
    if (!todo.projectId) return true;
    return !projects.some((project) => project.id === todo.projectId);
  });
  if (unassigned.length > 0) {
    const counted = countsFor(unassigned);
    projectRows.push({
      id: null,
      name: "No project",
      open: counted.total - counted.completed,
      completed: counted.completed,
      reminderTime: null,
    });
  }

  const kindRows: KindReport[] = [
    ...TASK_KINDS.map((kind) => kindRow(inRange, kind.id, kind.label)),
    kindRow(
      inRange,
      null,
      "Untagged"
    ),
  ].filter((row) => row.open + row.completed > 0);

  const upcomingMap = new Map<string, number>();
  for (const todo of todos) {
    if (todo.completed || todo.dateKey <= today) continue;
    upcomingMap.set(todo.dateKey, (upcomingMap.get(todo.dateKey) ?? 0) + 1);
  }
  const upcoming = [...upcomingMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 7)
    .map(([dateKey, count]) => ({ dateKey, count }));

  return {
    days: visibleDays,
    quietDays: days.length - visibleDays.length,
    projects: projectRows.filter((row) => row.open + row.completed > 0 || row.reminderTime),
    kinds: kindRows,
    upcoming,
    total: summary.total,
    completed: summary.completed,
    open: summary.total - summary.completed,
  };
}

function kindRow(
  todos: Todo[],
  kind: TaskKind | null,
  label: string
): KindReport {
  const rows = todos.filter((todo) => todo.kind === kind);
  const counted = countsFor(rows);
  return {
    label,
    open: counted.total - counted.completed,
    completed: counted.completed,
  };
}
