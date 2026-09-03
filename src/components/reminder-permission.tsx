"use client";

import { Bell, BellOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function ReminderPermission({ enabled, onChange }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const supported =
    typeof window !== "undefined" && "Notification" in window;

  async function enable() {
    if (!supported) {
      setMessage("Notifications aren’t supported in this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      onChange(true);
      setMessage("Reminders on — keep this tab open for timed alerts.");
      try {
        new Notification("Stride is ready", {
          body: "You’ll get a ping when a task reminder is due.",
        });
      } catch {
        // ignore preview failures
      }
    } else {
      onChange(false);
      setMessage("Permission blocked. Enable notifications in browser settings.");
    }
  }

  function disable() {
    onChange(false);
    setMessage("Reminders paused.");
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {enabled
          ? "Browser reminders are on for tasks with a time."
          : "Turn on reminders so due tasks nudge you during the day."}
      </p>
      <div className="flex items-center gap-2">
        {enabled ? (
          <Button type="button" variant="outline" size="sm" onClick={disable}>
            <BellOff data-icon="inline-start" />
            Pause
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={enable}>
            <Bell data-icon="inline-start" />
            Enable reminders
          </Button>
        )}
      </div>
      {message ? (
        <p className="text-xs text-muted-foreground sm:basis-full">{message}</p>
      ) : null}
    </div>
  );
}
