"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  buildGreeting,
  buildNudge,
  buildReminderLine,
  canSpeak,
  speak,
  stopSpeaking,
} from "@/lib/speech";
import type { Todo } from "@/lib/types";

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
  const [line, setLine] = useState("Your buddy is getting ready…");
  const [speaking, setSpeaking] = useState(false);
  const greetedRef = useRef(false);

  const say = useCallback(
    async (text: string) => {
      setLine(text);
      if (!enabled || !canSpeak()) return;
      setSpeaking(true);
      await speak(text);
      setSpeaking(false);
    },
    [enabled]
  );

  useEffect(() => {
    if (!hydrated || greetedRef.current) return;
    greetedRef.current = true;

    const openTitles = todos
      .filter((t) => !t.completed)
      .sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 } as const;
        return rank[a.priority] - rank[b.priority];
      })
      .map((t) => t.title)
      .slice(0, 3);

    void say(buildGreeting(userName, openTitles));
  }, [hydrated, todos, userName, say]);

  const remindAbout = useCallback(
    async (taskTitle: string) => {
      await say(buildReminderLine(userName, taskTitle));
    },
    [say, userName]
  );

  const nudgeAbout = useCallback(
    async (taskTitle: string) => {
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
