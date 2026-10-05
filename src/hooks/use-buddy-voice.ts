"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  buildDoneGreeting,
  buildEmptyNudge,
  buildGreeting,
  buildNudge,
  buildReminderLine,
  canSpeak,
  speak,
  stopSpeaking,
} from "@/lib/speech";
import { publishStartupGreeting } from "@/lib/startup-greeting";
import type { Todo } from "@/lib/types";

function greetingText(userName: string, todos: Todo[]): string {
  const openTitles = todos
    .filter((todo) => !todo.completed)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const rank = { high: 0, medium: 1, low: 2 } as const;
      return rank[a.priority] - rank[b.priority];
    })
    .map((todo) => todo.title)
    .slice(0, 3);

  if (openTitles.length) return buildGreeting(userName, openTitles);
  if (todos.some((todo) => todo.completed)) return buildDoneGreeting(userName);
  return buildGreeting(userName, []);
}

type Options = {
  enabled: boolean;
  userName: string;
  todos: Todo[];
  hydrated: boolean;
};

export function useBuddyVoice({
  enabled,
  userName,
  todos,
  hydrated,
}: Options) {
  const greeting = hydrated ? greetingText(userName, todos) : null;
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const greetedRef = useRef(false);
  const line = followUp ?? greeting ?? "Your buddy is getting ready…";

  const say = useCallback(
    async (text: string) => {
      setFollowUp(text);
      if (!enabled || !canSpeak()) return "skipped" as const;
      setSpeaking(true);
      try {
        return await speak(text);
      } finally {
        setSpeaking(false);
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!hydrated || greetedRef.current) return;
    greetedRef.current = true;
    if (!enabled || !canSpeak()) return;
    if (new URLSearchParams(window.location.search).get("spoken") === "1") return;

    const text = greetingText(userName, todos);
    // Speak once when the page is ready. Do not replay this on the next click:
    // that click is often Nudge me, and the replay was canceling the nudge.
    void speak(text);
  }, [hydrated, todos, userName, enabled]);

  useEffect(() => {
    if (!hydrated) return;
    const text = enabled ? greetingText(userName, todos) : "";
    void publishStartupGreeting(text);
  }, [hydrated, todos, userName, enabled]);

  const remindAbout = useCallback(
    async (taskTitle: string) => {
      await say(buildReminderLine(userName, taskTitle));
    },
    [say, userName]
  );

  const nudgeAbout = useCallback(
    async (taskTitle: string | null) => {
      if (!taskTitle) {
        await say(buildEmptyNudge(userName));
        return;
      }
      await say(buildNudge(userName, taskTitle));
    },
    [say, userName]
  );

  const silence = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
  }, []);

  return { line, speaking, say, remindAbout, nudgeAbout, silence };
}
