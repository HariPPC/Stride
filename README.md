# Stride

A daily todo list for product managers, with **browser reminders**, **progress tracking**, and a **speaking buddy** who greets you and nudges you by name (default: Hari).

## Features

- Add tasks on any date, and move between days
- Projects with an optional reminder that speaks up only while that project still has open work
- A 7-day and 30-day report by day, project, and kind, plus what’s coming up
- Today’s tasks with High / Medium / Low priority
- Task kinds: decision, doc, follow-up, or meeting, plus a note on each task
- Pin one task as today’s focus — the buddy nudges that one
- Search and filters (open, done, kind, priority)
- A daily note for what moved and what’s blocked
- Timed reminders (browser notifications + spoken nudges)
- Speaking buddy avatar (“Hari, can you please work on…”)
- Daily progress + 7-day streak
- Carry unfinished tasks into today, and clear finished ones
- Installable as an app (PWA) with a home-screen / dock icon
- Local-only storage (`localStorage`) — no account required

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123) (or `http://localhost:43123`).

## Install as an app (icon)

1. Open Stride in Chrome / Edge.
2. Click **Install app** (or the browser’s install / “Add to Home Screen” option).
3. You’ll get a Stride icon on your dock / home screen / app launcher.

## Auto-open when you start your computer

A website can’t force itself to launch at power-on. Use the one-time OS helper so Stride starts the local server and opens at login.

From the project root:

**macOS**
```bash
chmod +x scripts/startup/*.sh
./scripts/startup/install-macos-login-item.sh
```

**Windows** (PowerShell)
```powershell
.\scripts\startup\install-windows-startup.ps1
```

**Linux**
```bash
chmod +x scripts/startup/*.sh
./scripts/startup/install-linux-autostart.sh
```

Then log out/in once to verify. Logs go to `~/.stride/` (or `%USERPROFILE%\.stride\` on Windows).

The in-app **Open when your computer starts** panel also shows the command for your OS. Keep voice/notifications on so your buddy can greet you.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Web Speech API, PWA manifest + service worker.
