"use client";

import { useEffect, useRef, useState } from "react";

import type { AppSettings, DayProgress, Todo } from "@/lib/types";

type SyncStatus = "idle" | "syncing" | "synced" | "error";

type Options = {
  hydrated: boolean;
  todos: Todo[];
  progress: DayProgress[];
  settings: AppSettings;
};

export function useDbSync({ hydrated, todos, progress, settings }: Options) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!hydrated) return;

    const controller = new AbortController();
    const delay = first.current ? 400 : 900;
    first.current = false;

    const timer = window.setTimeout(async () => {
      setStatus("syncing");
      setError(null);
      try {
        const res = await fetch("/api/sync", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ todos, progress, settings }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(body?.error ?? `Sync failed (${res.status})`);
        }
        setStatus("synced");
      } catch (err) {
        if (controller.signal.aborted) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Sync failed");
      }
    }, delay);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [hydrated, todos, progress, settings]);

  return { status, error };
}
