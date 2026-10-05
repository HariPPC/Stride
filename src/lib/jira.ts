import type { JiraLink, Priority, Todo } from "@/lib/types";

export const JIRA_SITE = "https://purchasingpower.atlassian.net";

export const JIRA_ASSIGNED_JQL =
  'project = GAI AND assignee = currentUser() AND statusCategory != Done ORDER BY priority DESC, updated DESC';

export type JiraIssue = {
  key: string;
  summary: string;
  status: string;
  priority: string;
  issueType: string;
  url: string;
};

export type JiraSyncPayload = {
  source: "live" | "snapshot";
  fetchedAt: string;
  projectKey: "GAI";
  assignee: string;
  issues: JiraIssue[];
};

const HIGH = new Set(["blocker", "critical", "highest", "high"]);
const MEDIUM = new Set(["major", "medium", "enhancement"]);

export function jiraPriorityToStride(priority: string): Priority {
  const name = priority.trim().toLowerCase();
  if (HIGH.has(name)) return "high";
  if (MEDIUM.has(name)) return "medium";
  return "low";
}

export function jiraBrowseUrl(key: string): string {
  return `${JIRA_SITE}/browse/${key}`;
}

export type JiraMergeResult = {
  todos: Todo[];
  added: number;
  updated: number;
};

export function mergeJiraIssues(
  todos: Todo[],
  issues: JiraIssue[],
  dateKey: string,
  now = new Date().toISOString()
): JiraMergeResult {
  const next = [...todos];
  let added = 0;
  let updated = 0;

  for (const issue of issues) {
    const link: JiraLink = {
      key: issue.key,
      url: issue.url,
      status: issue.status,
      issueType: issue.issueType,
    };
    const priority = jiraPriorityToStride(issue.priority);
    const todayIndex = next.findIndex(
      (todo) => todo.jira?.key === issue.key && todo.dateKey === dateKey
    );

    if (todayIndex >= 0) {
      const current = next[todayIndex];
      next[todayIndex] = {
        ...current,
        title: issue.summary,
        priority,
        jira: link,
      };
      updated += 1;
      continue;
    }

    const openIndex = next.findIndex(
      (todo) => todo.jira?.key === issue.key && !todo.completed
    );
    if (openIndex >= 0) {
      const current = next[openIndex];
      next[openIndex] = {
        ...current,
        title: issue.summary,
        priority,
        jira: link,
        dateKey,
        reminderFired: current.dateKey === dateKey ? current.reminderFired : false,
      };
      updated += 1;
      continue;
    }

    next.unshift({
      id: crypto.randomUUID(),
      title: issue.summary,
      completed: false,
      priority,
      reminderTime: null,
      reminderFired: false,
      dateKey,
      createdAt: now,
      jira: link,
    });
    added += 1;
  }

  return { todos: next, added, updated };
}
