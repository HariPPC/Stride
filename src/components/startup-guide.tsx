"use client";

import { CheckCircle2, Copy, Power } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Platform = "mac" | "windows" | "linux" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  if (ua.includes("linux")) return "linux";
  return "other";
}

const COMMANDS: Record<Exclude<Platform, "other">, { title: string; steps: string[]; command: string }> = {
  mac: {
    title: "macOS — open at login",
    steps: [
      "Install Stride as an app (Install app button above), or keep using this project folder.",
      "In Terminal, from the project root, run the command below once.",
      "Restart or log out/in once to verify Stride opens and your buddy greets you.",
    ],
    command: "chmod +x scripts/startup/*.sh && ./scripts/startup/install-macos-login-item.sh",
  },
  windows: {
    title: "Windows — open at sign-in",
    steps: [
      "Keep this project on your PC (Node.js installed).",
      "Open PowerShell in the project folder and run the command below once.",
      "Sign out/in once to verify Stride starts and opens in your browser.",
    ],
    command:
      'powershell -ExecutionPolicy Bypass -File .\\scripts\\startup\\install-windows-startup.ps1',
  },
  linux: {
    title: "Linux — open at login",
    steps: [
      "Keep this project on your machine with Node.js installed.",
      "In a terminal from the project root, run the command below once.",
      "Log out/in once to verify Stride opens.",
    ],
    command: "chmod +x scripts/startup/*.sh && ./scripts/startup/install-linux-autostart.sh",
  },
};

export function StartupGuide() {
  const platform = useMemo(() => detectPlatform(), []);
  const [copied, setCopied] = useState(false);
  const guide = platform === "other" ? null : COMMANDS[platform];

  async function copyCommand() {
    if (!guide) return;
    try {
      await navigator.clipboard.writeText(guide.command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-white/75 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-accent-teal/15 p-2 text-accent-teal">
          <Power className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Open when your computer starts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A website can’t force itself to launch at power-on. Run the one-time setup for your OS
              so Stride starts the local app and opens your buddy automatically at login.
            </p>
          </div>

          {guide ? (
            <>
              <p className="text-sm font-medium text-foreground">{guide.title}</p>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="block flex-1 overflow-x-auto rounded-lg bg-ink/90 px-3 py-2 font-mono text-[12px] text-white">
                  {guide.command}
                </code>
                <Button type="button" size="sm" variant="outline" onClick={() => void copyCommand()}>
                  {copied ? (
                    <CheckCircle2 data-icon="inline-start" />
                  ) : (
                    <Copy data-icon="inline-start" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Use the scripts in <code className="rounded bg-secondary px-1">scripts/startup/</code>{" "}
              for macOS, Windows, or Linux.
            </p>
          )}

          <p
            className={cn(
              "text-xs text-muted-foreground",
              "border-t border-border/50 pt-3"
            )}
          >
            Logs land in <code className="rounded bg-secondary px-1">~/.stride/</code> (or{" "}
            <code className="rounded bg-secondary px-1">%USERPROFILE%\.stride\</code> on Windows).
          </p>
        </div>
      </div>
    </section>
  );
}
