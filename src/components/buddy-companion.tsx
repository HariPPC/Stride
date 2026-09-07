"use client";

import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  userName: string;
  voiceEnabled: boolean;
  line: string;
  speaking: boolean;
  topTaskTitle: string | null;
  onUserNameChange: (name: string) => void;
  onVoiceEnabledChange: (enabled: boolean) => void;
  onAskAgain: () => void;
  onSilence: () => void;
};

export function BuddyCompanion({
  userName,
  voiceEnabled,
  line,
  speaking,
  topTaskTitle,
  onUserNameChange,
  onVoiceEnabledChange,
  onAskAgain,
  onSilence,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-white/80 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <div className="relative mx-auto size-24 shrink-0 sm:mx-0 sm:size-28">
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-accent-teal/30 blur-md transition-opacity",
              speaking ? "animate-pulse opacity-100" : "opacity-40"
            )}
          />
          <Image
            src="/buddy-avatar.png"
            alt="Your Stride buddy"
            width={112}
            height={112}
            className={cn(
              "relative size-24 rounded-full object-cover ring-4 ring-white sm:size-28",
              speaking && "scale-[1.02]"
            )}
            priority
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your buddy
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-ink sm:text-xl">
              {speaking ? "Speaking with you…" : "Here for you"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              “{line}”
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Button
              type="button"
              size="sm"
              onClick={onAskAgain}
              title={
                topTaskTitle
                  ? `Nudge about: ${topTaskTitle}`
                  : "Add a task to get a focused nudge"
              }
            >
              Nudge me
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onVoiceEnabledChange(!voiceEnabled)}
            >
              {voiceEnabled ? (
                <Volume2 data-icon="inline-start" />
              ) : (
                <VolumeX data-icon="inline-start" />
              )}
              {voiceEnabled ? "Voice on" : "Voice off"}
            </Button>
            {speaking ? (
              <Button type="button" size="sm" variant="ghost" onClick={onSilence}>
                Stop
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 bg-secondary/40 px-4 py-3 sm:px-5">
        <Label htmlFor="buddy-name" className="text-xs text-muted-foreground">
          Buddy calls you
        </Label>
        <Input
          id="buddy-name"
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          className="mt-1.5 max-w-xs bg-white/80"
          placeholder="Hari"
        />
      </div>
    </section>
  );
}
