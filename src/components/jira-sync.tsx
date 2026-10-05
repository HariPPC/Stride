"use client";

import { RefreshCw } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JiraIssue, JiraSyncPayload } from "@/lib/jira";
import {
  clearJiraCredentials,
  loadJiraCredentials,
  saveJiraCredentials,
} from "@/lib/storage";
import { STORAGE_KEYS, type JiraCredentials } from "@/lib/types";

const EMPTY_CREDENTIALS: JiraCredentials = { email: "", apiToken: "" };
const credentialListeners = new Set<() => void>();
let credentialSnapshot = EMPTY_CREDENTIALS;
let credentialRaw: string | null = null;

function subscribeCredentials(listener: () => void) {
  credentialListeners.add(listener);
  return () => credentialListeners.delete(listener);
}

function emitCredentials() {
  credentialRaw = null;
  for (const listener of credentialListeners) listener();
}

function readCredentials(): JiraCredentials {
  const raw = window.localStorage.getItem(STORAGE_KEYS.jira) ?? "";
  if (raw === credentialRaw) return credentialSnapshot;
  credentialRaw = raw;
  credentialSnapshot = loadJiraCredentials();
  return credentialSnapshot;
}

type Props = {
  hydrated: boolean;
  onImport: (issues: JiraIssue[]) => { added: number; updated: number };
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function resultMessage(
  payload: JiraSyncPayload,
  added: number,
  updated: number
): string {
  const who =
    payload.source === "live" ? payload.assignee : `${payload.assignee} (saved list)`;
  const when = formatWhen(payload.fetchedAt);
  let change = "Nothing new to add.";
  if (added > 0 && updated > 0) {
    change = `Added ${added} to today and refreshed ${updated}.`;
  } else if (added > 0) {
    change = `Added ${added} to today.`;
  } else if (updated > 0) {
    change = `Refreshed ${updated} already on your list.`;
  }
  const source =
    payload.source === "live"
      ? `Live from Jira for ${who}.`
      : `Using the ${when} GAI list for ${who}. Add an API token to refresh live.`;
  return `${change} ${source}`;
}

function writeCredentials(next: JiraCredentials) {
  if (!next.email.trim() && !next.apiToken.trim()) {
    clearJiraCredentials();
  } else {
    saveJiraCredentials(next);
  }
  emitCredentials();
}

export function JiraSync({ hydrated, onImport }: Props) {
  const credentials = useSyncExternalStore(
    subscribeCredentials,
    readCredentials,
    () => EMPTY_CREDENTIALS
  );
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sync() {
    if (!hydrated || syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    setError(null);
    setMessage(null);
    try {
      const email = credentials.email.trim();
      const apiToken = credentials.apiToken.trim();
      const hasCredentials = email.includes("@") && apiToken.length >= 8;
      const response = await fetch("/api/jira/assigned", {
        method: hasCredentials ? "POST" : "GET",
        headers: hasCredentials ? { "Content-Type": "application/json" } : undefined,
        body: hasCredentials ? JSON.stringify({ email, apiToken }) : undefined,
      });
      const data = (await response.json()) as JiraSyncPayload & { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not load Jira tickets.");
        return;
      }
      const { added, updated } = onImport(data.issues ?? []);
      setMessage(resultMessage(data, added, updated));
    } catch {
      setError("Could not reach Stride’s Jira sync.");
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }

  function forgetToken() {
    writeCredentials(EMPTY_CREDENTIALS);
    setMessage("Removed the saved Jira token from this browser.");
    setError(null);
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">GAI board</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pull open Jira tickets assigned to you onto today. Each task keeps its Jira link.
          </p>
        </div>
        <Button type="button" onClick={() => void sync()} disabled={!hydrated || syncing}>
          <RefreshCw data-icon="inline-start" className={syncing ? "animate-spin" : undefined} />
          {syncing ? "Syncing…" : "Sync Jira"}
        </Button>
      </div>

      {message ? <p className="mt-3 text-sm text-foreground">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
          API token for a live refresh
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="jira-email">Atlassian email</Label>
            <Input
              id="jira-email"
              type="email"
              autoComplete="username"
              value={credentials.email}
              onChange={(event) =>
                writeCredentials({ ...credentials, email: event.target.value })
              }
              placeholder="you@purchasingpower.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jira-token">API token</Label>
            <Input
              id="jira-token"
              type="password"
              autoComplete="current-password"
              value={credentials.apiToken}
              onChange={(event) =>
                writeCredentials({ ...credentials, apiToken: event.target.value })
              }
              placeholder="Saved only in this browser"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-xs text-muted-foreground">
            Create one at{" "}
            <a
              className="font-medium text-primary underline-offset-2 hover:underline"
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              rel="noreferrer"
            >
              id.atlassian.com
            </a>
            . Without a token, Sync uses the Oct 5 open GAI list.
          </p>
          {credentials.apiToken ? (
            <Button type="button" variant="ghost" size="sm" onClick={forgetToken}>
              Forget token
            </Button>
          ) : null}
        </div>
      </details>
    </section>
  );
}
