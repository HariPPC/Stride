# Stride

A daily todo list for product managers, with **browser reminders**, **progress tracking**, and a **speaking buddy** who greets you and nudges you by name (default: Hari).

## Features

- Today’s tasks with High / Medium / Low priority
- Timed reminders (browser notifications + spoken nudges)
- Speaking buddy avatar (“Hari, can you please work on…”)
- Daily progress + 7-day streak
- Carry unfinished tasks into today
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

Browsers cannot force an app to launch at login by themselves. After installing:

- **macOS:** System Settings → General → Login Items → add Stride  
- **Windows:** put a shortcut to the installed Stride app in the Startup folder  
- **ChromeOS / Android / iOS:** pin / add to home screen; use the OS’s startup options if available  

Keep notifications (and voice) enabled so your buddy can greet you when the app opens.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Web Speech API, PWA manifest + service worker.
