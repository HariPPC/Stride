import type { DayLog, Priority, TaskKind, Todo } from "@/lib/types";

export const TASK_KINDS: { id: TaskKind; label: string; hint: string }[] = [
  {
    id: "decision",
    label: "Decision",
    hint: "Decide: ship the onboarding cut, or keep both paths…",
  },
  {
    id: "doc",
    label: "Doc",
    hint: "Write: PRD for the stakeholder sync…",
  },
  {
    id: "followup",
    label: "Follow-up",
    hint: "Follow up with design on the empty state…",
  },
  {
    id: "meeting",
    label: "Meeting",
    hint: "Prep: Monday roadmap review…",
  },
];

export function isTaskKind(value: unknown): value is TaskKind {
  return (
    value === "decision" ||
    value === "doc" ||
    value === "followup" ||
    value === "meeting"
  );
}

export function taskKindLabel(kind: TaskKind | null): string | null {
  if (!kind) return null;
  return TASK_KINDS.find((item) => item.id === kind)?.label ?? null;
}

export function taskKindClass(kind: TaskKind): string {
  switch (kind) {
    case "decision":
      return "bg-violet-100 text-violet-900";
    case "doc":
      return "bg-sky-100 text-sky-900";
    case "followup":
      return "bg-teal-100 text-teal-900";
    case "meeting":
      return "bg-orange-100 text-orange-900";
  }
}

export type StatusFilter = "all" | "open" | "done";

export type TodoFilters = {
  query: string;
  status: StatusFilter;
  kind: TaskKind | "all";
  priority: Priority | "all";
};

export const DEFAULT_FILTERS: TodoFilters = {
  query: "",
  status: "all",
  kind: "all",
  priority: "all",
};

export function filtersAreActive(filters: TodoFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.status !== "all" ||
    filters.kind !== "all" ||
    filters.priority !== "all"
  );
}

export function filterTodos(todos: Todo[], filters: TodoFilters): Todo[] {
  const query = filters.query.trim().toLowerCase();
  return todos.filter((todo) => {
    if (filters.status === "open" && todo.completed) return false;
    if (filters.status === "done" && !todo.completed) return false;
    if (filters.kind !== "all" && todo.kind !== filters.kind) return false;
    if (filters.priority !== "all" && todo.priority !== filters.priority) {
      return false;
    }
    if (!query) return true;
    return `${todo.title}\n${todo.note}`.toLowerCase().includes(query);
  });
}

export function normalizeTodo(raw: unknown): Todo | null {
  if (!raw || typeof raw !== "object") return null;
  const todo = raw as Partial<Todo>;
  if (typeof todo.id !== "string" || typeof todo.title !== "string") return null;
  const priority: Priority =
    todo.priority === "high" ||
    todo.priority === "medium" ||
    todo.priority === "low"
      ? todo.priority
      : "medium";
  return {
    id: todo.id,
    title: todo.title,
    completed: Boolean(todo.completed),
    priority,
    reminderTime:
      typeof todo.reminderTime === "string" && todo.reminderTime
        ? todo.reminderTime
        : null,
    reminderFired: Boolean(todo.reminderFired),
    dateKey: typeof todo.dateKey === "string" ? todo.dateKey : "",
    createdAt:
      typeof todo.createdAt === "string"
        ? todo.createdAt
        : new Date(0).toISOString(),
    kind: isTaskKind(todo.kind) ? todo.kind : null,
    note: typeof todo.note === "string" ? todo.note : "",
    pinned: Boolean(todo.pinned),
  };
}

export function normalizeDayLog(raw: unknown): DayLog | null {
  if (!raw || typeof raw !== "object") return null;
  const log = raw as Partial<DayLog>;
  if (typeof log.dateKey !== "string" || !log.dateKey) return null;
  return {
    dateKey: log.dateKey,
    moved: typeof log.moved === "string" ? log.moved : "",
    blocked: typeof log.blocked === "string" ? log.blocked : "",
  };
}
