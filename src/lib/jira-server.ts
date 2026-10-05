import {
  JIRA_ASSIGNED_JQL,
  JIRA_SITE,
  jiraBrowseUrl,
  type JiraIssue,
  type JiraSyncPayload,
} from "@/lib/jira";
import {
  JIRA_OPEN_ASSIGNED,
  JIRA_SNAPSHOT_ASSIGNEE,
  JIRA_SNAPSHOT_FETCHED_AT,
} from "@/lib/jira-snapshot";

type JiraSearchIssue = {
  key?: string;
  fields?: {
    summary?: string;
    status?: { name?: string };
    priority?: { name?: string } | null;
    issuetype?: { name?: string };
  };
};

type JiraSearchResponse = {
  issues?: JiraSearchIssue[];
  nextPageToken?: string;
  isLast?: boolean;
};

export function snapshotPayload(): JiraSyncPayload {
  return {
    source: "snapshot",
    fetchedAt: JIRA_SNAPSHOT_FETCHED_AT,
    projectKey: "GAI",
    assignee: JIRA_SNAPSHOT_ASSIGNEE,
    issues: JIRA_OPEN_ASSIGNED,
  };
}

function mapIssue(issue: JiraSearchIssue): JiraIssue | null {
  if (!issue.key) return null;
  return {
    key: issue.key,
    summary: issue.fields?.summary?.trim() || issue.key,
    status: issue.fields?.status?.name || "Unknown",
    priority: issue.fields?.priority?.name || "Medium",
    issueType: issue.fields?.issuetype?.name || "Task",
    url: jiraBrowseUrl(issue.key),
  };
}

async function jiraFetch(
  path: string,
  auth: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(new URL(path, JIRA_SITE), {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function fetchAssignedFromJira(
  email: string,
  apiToken: string
): Promise<JiraSyncPayload> {
  const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
  const meResponse = await jiraFetch("/rest/api/3/myself", auth);
  if (meResponse.status === 401 || meResponse.status === 403) {
    throw new Error("Jira rejected that email and API token.");
  }
  const assignee = meResponse.ok
    ? ((await meResponse.json()) as { displayName?: string }).displayName ||
      "you"
    : "you";

  const issues: JiraIssue[] = [];
  let nextPageToken: string | undefined;

  for (let page = 0; page < 5; page += 1) {
    const params = new URLSearchParams({
      jql: JIRA_ASSIGNED_JQL,
      maxResults: "100",
      fields: "summary,status,priority,issuetype",
    });
    if (nextPageToken) params.set("nextPageToken", nextPageToken);

    let response = await jiraFetch(`/rest/api/3/search/jql?${params}`, auth);
    if (response.status === 404 || response.status === 405) {
      response = await jiraFetch("/rest/api/3/search/jql", auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jql: JIRA_ASSIGNED_JQL,
          maxResults: 100,
          fields: ["summary", "status", "priority", "issuetype"],
          nextPageToken,
        }),
      });
    }

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 180);
      throw new Error(`Jira returned ${response.status}. ${detail}`.trim());
    }

    const data = (await response.json()) as JiraSearchResponse;
    for (const issue of data.issues ?? []) {
      const mapped = mapIssue(issue);
      if (mapped) issues.push(mapped);
    }
    if (data.isLast || !data.nextPageToken) break;
    nextPageToken = data.nextPageToken;
  }

  return {
    source: "live",
    fetchedAt: new Date().toISOString(),
    projectKey: "GAI",
    assignee,
    issues,
  };
}
