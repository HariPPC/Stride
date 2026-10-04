"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  createActiveFocus,
  creditFocus,
  focusedTodayMs,
  pauseFocus,
  remainingMs,
  resumeFocus,
} from "@/lib/focus";
import {
  getFocusServerSnapshot,
  getFocusSnapshot,
  subscribeFocus,
  updateFocus,
} from "@/lib/focus-store";
import type { ActiveFocus, FocusLength, Todo } from "@/lib/types";

export type FocusFinish = {
  title: string;
  lengthMinutes: FocusLength;
  elapsedMs: number;
  completed: boolean;
};

type Options = {
  onFinished?: (info: FocusFinish) => void;
};

function describe(
  active: ActiveFocus,
  now: number,
  completed: boolean
): FocusFinish {
  const total = active.lengthMinutes * 60_000;
  return {
    title: active.title,
    lengthMinutes: active.lengthMinutes,
    elapsedMs: completed ? total : Math.max(0, total - remainingMs(active, now)),
    completed,
  };
}

export function useFocus({ onFinished }: Options = {}) {
  const state = useSyncExternalStore(
    subscribeFocus,
    getFocusSnapshot,
    getFocusServerSnapshot
  );
  const [now, setNow] = useState(() => Date.now());
  const onFinishedRef = useRef(onFinished);
  const sawRunningRef = useRef(false);
  const finishingIdRef = useRef<string | null>(null);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  const running = state.active?.endsAt != null;

  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 250);
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(Date.now());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [running]);

  const finish = useCallback((active: ActiveFocus, completed: boolean, at: number) => {
    if (finishingIdRef.current === active.id) return;
    finishingIdRef.current = active.id;
    const info = describe(active, at, completed);
    const announce = sawRunningRef.current || !completed;
    updateFocus((prev) => {
      if (!prev.active || prev.active.id !== active.id) return prev;
      return creditFocus(prev, prev.active, at, completed);
    });
    sawRunningRef.current = false;
    if (announce) onFinishedRef.current?.(info);
  }, []);

  useEffect(() => {
    const active = state.active;
    if (!active || active.endsAt == null) return;
    if (active.endsAt > Date.now()) {
      sawRunningRef.current = true;
      return;
    }
    finish(active, true, Date.now());
  }, [state.active, now, finish]);

  const start = useCallback(
    (todo: Pick<Todo, "id" | "title">, minutes: FocusLength, dateKey: string) => {
      if (getFocusSnapshot().active) return;
      sawRunningRef.current = true;
      finishingIdRef.current = null;
      const startedAt = Date.now();
      updateFocus((prev) => {
        if (prev.active) return prev;
        return {
          ...prev,
          active: createActiveFocus(
            todo,
            minutes,
            dateKey,
            startedAt,
            crypto.randomUUID()
          ),
        };
      });
      setNow(startedAt);
    },
    []
  );

  const pause = useCallback(() => {
    const active = getFocusSnapshot().active;
    if (!active || active.endsAt == null) return;
    const at = Date.now();
    if (remainingMs(active, at) <= 0) {
      finish(active, true, at);
      return;
    }
    updateFocus((prev) => {
      if (!prev.active || prev.active.endsAt == null) return prev;
      return { ...prev, active: pauseFocus(prev.active, at) };
    });
    setNow(at);
  }, [finish]);

  const resume = useCallback(() => {
    const active = getFocusSnapshot().active;
    if (!active || active.endsAt != null) return;
    const at = Date.now();
    if (active.remainingMs <= 0) {
      finish(active, true, at);
      return;
    }
    sawRunningRef.current = true;
    updateFocus((prev) => {
      if (!prev.active || prev.active.endsAt != null) return prev;
      return { ...prev, active: resumeFocus(prev.active, at) };
    });
    setNow(at);
  }, [finish]);

  const endEarly = useCallback(() => {
    const active = getFocusSnapshot().active;
    if (!active) return;
    finish(active, false, Date.now());
  }, [finish]);

  return {
    active: state.active,
    now,
    sessionsByDay: state.sessionsByDay,
    todayMs: (dateKey: string) => focusedTodayMs(state, dateKey, now),
    start,
    pause,
    resume,
    endEarly,
  };
}
