import { todayKey } from "@/lib/date";
import type { Todo } from "@/lib/types";

export const DATA_15464_TASK_ID = "data-15464-salesforce-client-id";

export const DATA_15464_TITLE =
  "Restore Account Client ID in Tableau Salesforce connector (DATA-15464)";

export const DATA_15464_NOTES = `Why Client ID is on Launch, not Account:
The identifier did not move. Client_ID__c already lives on Launch__c. The workbook’s Account-level Client ID is a broken Tableau reference (red !), along with Client Code and other Account Client* fields.

What happened:
Dwayne restored Salesforce field-level security for Client_ID__c and Client_Code__c. Those permissions landed on Launch__c. Tableau only surfaces fields the connector user can read, so Launch.Client_ID__c came back healthy while Account Client ID stayed missing.

Why swapping the join failed:
Launch is a different grain than Account (many launches per account). Existing dashboard joins still point at Account Client ID, so Launch.Client_ID__c cannot restore the same values.

Next steps:
1. Confirm Account still has Client_ID__c (or the labeled Client ID field) in Salesforce.
2. Grant the Tableau integration user Read FLS on Account.Client_ID__c and Account.Client_Code__c — not only Launch.
3. Refresh the Salesforce extract and remap the broken Client ID / Client Code aliases.
4. If Account never stored Client ID, join through Launch’s Account lookup / Account.Id instead of Launch.Client_ID__c.

Ticket: https://purchasingpower.atlassian.net/browse/DATA-15464`;

export function createData15464Task(dateKey = todayKey()): Todo {
  return {
    id: DATA_15464_TASK_ID,
    title: DATA_15464_TITLE,
    completed: false,
    priority: "high",
    reminderTime: null,
    reminderFired: false,
    dateKey,
    createdAt: new Date().toISOString(),
    notes: DATA_15464_NOTES,
  };
}
