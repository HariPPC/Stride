# Stride

A daily todo list for product managers, with **browser reminders**, **progress tracking**, and a **speaking buddy** who greets you and nudges you by name (default: Hari).

## Features

- Today’s tasks with High / Medium / Low priority
- Timed reminders (browser notifications + spoken nudges)
- Speaking buddy avatar (“Hari, can you please work on…”)
- Daily progress + 7-day streak
- Carry unfinished tasks into today
- Installable as an app (PWA) with a home-screen / dock icon
- Local browser storage plus automatic sync to a **SQLite database**
- **/dashboard** progress analytics (completion, priority mix, recent tasks)
- Cursor **MCP** config so the agent can query the same SQLite file

## Run locally

```bash
npm install
npm run db:seed   # optional sample data for the dashboard
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123) (or `http://localhost:43123`).

Dashboard: [http://127.0.0.1:43123/dashboard](http://127.0.0.1:43123/dashboard)

## Database + Cursor

Stride writes to `data/stride.db` (created on first sync / seed). Tasks still save in `localStorage` for offline use, and the app syncs them to SQLite in the background.

### Connect the DB in Cursor (MCP)

Project MCP is configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "stride-sqlite": {
      "command": "npx",
      "args": ["-y", "mcp-sqlite", "data/stride.db"]
    }
  }
}
```

1. Run `npm run db:seed` (or use the app so a DB file exists).
2. In Cursor: **Settings → MCP** and enable **stride-sqlite** (or reload MCP servers).
3. Ask the agent things like “list tables in stride.db” or “show open high-priority todos”.

For a hosted database (Neon / Supabase / Postgres), add that provider from the Cursor MCP marketplace and put the connection string in Cloud Agent secrets — keep app secrets separate from MCP credentials.

Optional override: set `STRIDE_DB_PATH` to point the app at another SQLite file.

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

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, better-sqlite3, Web Speech API, PWA manifest + service worker.
