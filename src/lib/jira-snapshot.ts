import { jiraBrowseUrl, type JiraIssue } from "@/lib/jira";

/** Open GAI tickets assigned to Hariharan R, pulled from Jira on 2026-10-05. */
export const JIRA_SNAPSHOT_FETCHED_AT = "2026-10-05T14:07:00.000Z";
export const JIRA_SNAPSHOT_ASSIGNEE = "Hariharan R";

const RAW: Array<Omit<JiraIssue, "url">> = [
  {
    key: "GAI-713",
    summary: "Customer Care Reqs - Full Automation Direct Deposit Forms",
    status: "Open",
    priority: "Blocker",
    issueType: "Task",
  },
  {
    key: "GAI-683",
    summary: "Detect Fraud Indicators in Paystub Documents",
    status: "On Hold",
    priority: "Blocker",
    issueType: "Story",
  },
  {
    key: "GAI-714",
    summary:
      "Customer Care Reqs - Fraudulent Paystub Use Cases, Reqs, Examples - 0 Use Cases for launch",
    status: "Open",
    priority: "Critical",
    issueType: "Task",
  },
  {
    key: "GAI-488",
    summary: "AIDP UI Enhancement | Transition frontend from JSP to Angular",
    status: "Open",
    priority: "Enhancement",
    issueType: "Story",
  },
  {
    key: "GAI-186",
    summary: "NFR | UIPath Response has incomplete data",
    status: "In Progress",
    priority: "Minor",
    issueType: "Task",
  },
  {
    key: "GAI-793",
    summary:
      "[D3] - The Automated status is displaying as 'FAILURE' despite the expected automated message is correct.",
    status: "Open",
    priority: "Minor",
    issueType: "Defect.",
  },
  {
    key: "GAI-575",
    summary:
      "AIDP Phase-2 | Automating Paystub validation, enabling fraud detection for Paystubs, handling multi-scenario workflows like COA+Paystub",
    status: "Open",
    priority: "Minor",
    issueType: "Epic",
  },
  {
    key: "GAI-211",
    summary: "Future Opportunities Backlog",
    status: "Open",
    priority: "Minor",
    issueType: "Epic",
  },
  {
    key: "GAI-711",
    summary: "Risk flagged fraud from dec 2025",
    status: "On Hold",
    priority: "Minor",
    issueType: "Task",
  },
  {
    key: "GAI-571",
    summary: "Fraud Detection KPI Dashboard (with Tooltips)",
    status: "On Hold",
    priority: "Minor",
    issueType: "Story",
  },
  {
    key: "GAI-581",
    summary: "Display Fraud Detection Insights from UiPath in COA Document Tooltip",
    status: "PO",
    priority: "Minor",
    issueType: "Story",
  },
  {
    key: "GAI-572",
    summary: "Monitor UiPath Processing & Callback Failures and Alert Stakeholders",
    status: "PO",
    priority: "Minor",
    issueType: "Story",
  },
];

export const JIRA_OPEN_ASSIGNED: JiraIssue[] = RAW.map((issue) => ({
  ...issue,
  url: jiraBrowseUrl(issue.key),
}));
