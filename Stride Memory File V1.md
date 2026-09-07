# Stride Memory File V1

Last updated: 2026-09-07

## What this project is

**Stride** is a daily todo web app for product managers:

- Today’s tasks with High / Medium / Low priority
- Timed reminders (browser notifications + spoken nudges)
- Speaking buddy avatar (default name: **Hari**)
- Daily progress + 7-day streak
- Carry unfinished tasks into today
- Installable PWA (manifest + service worker)
- Data stored in browser `localStorage` only (no auth/DB)

Stack: Next.js 16 (App Router), TypeScript, Tailwind, shadcn/ui.

Default port: **43123**

## How to run (agent / VM)

```bash
export PATH="$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node" | tail -1)/bin:$PATH"
cd /workspace
npm install          # required if node_modules is missing
npm run build
npm run start        # or: npm run dev
```

Health check:

```bash
curl -sI http://127.0.0.1:43123 | head -5
```

Dev server is often kept in tmux session `stride-dev`.

## Critical pitfall: `127.0.0.1` vs the user’s laptop

In a **Cloud Agent**, the app listens on the **agent VM**, not the user’s computer.

| Where the user opens the URL | What happens |
|---|---|
| Cursor agent preview / in-agent browser | Can reach the VM’s `127.0.0.1:43123` (when Cursor proxies it) |
| User’s own Chrome on their laptop | Hits **their** machine → usually `ERR_EMPTY_RESPONSE` |

**Do not tell the user that pasting `http://127.0.0.1:43123` into their laptop browser will work** unless they are running the app locally on that machine.

### Workable URL for the user’s laptop

Expose a temporary public tunnel (Cloudflare quick tunnel):

```bash
# After the app is serving on :43123
/tmp/cloudflared tunnel --url http://127.0.0.1:43123 --no-autoupdate --protocol http2
```

Or use:

```bash
./scripts/start-public.sh
```

Tunnel binary (if needed):

```bash
curl -sL -o /tmp/cloudflared \
  https://github.com/cloudflare/cloudflared/releases/download/2026.8.3/cloudflared-linux-amd64
chmod +x /tmp/cloudflared
```

- Public URLs look like `https://<name>.trycloudflare.com`
- They only stay up while the agent session + tunnel process are running
- Verify with `curl -sI <public-url>` expecting **HTTP 200** and HTML containing `Stride`

## Issues we already hit (and fixes)

1. **`node_modules` wiped / missing**  
   Symptom: `sh: 1: next: not found`, empty responses, broken links.  
   Fix: `npm install`, then `npm run build && npm run start`.  
   `package.json` scripts use `npx next …` to reduce PATH failures.

2. **Stuck loading skeleton on first paint**  
   Symptom: grey placeholders forever until hard refresh.  
   Fix: UI renders immediately; hydration from `localStorage` is non-blocking (`Loading saved tasks…` only).

3. **Nudge me button appeared broken**  
   Causes: button was `disabled` with no open tasks, and `onAskAgain` no-op’d when `topOpen` was null; speech synthesis could hang and leave UI in a bad state.  
   Fix: always enable Nudge; empty-state line via `buildEmptyNudge`; `nudgeAbout(null)` supported; speech watchdog + Chrome `resume()`; `say()` uses `try/finally`.

4. **Next.js 16 `allowedDevOrigins`**  
   Dev must allow both hosts:

   ```ts
   // next.config.ts
   allowedDevOrigins: ["127.0.0.1", "localhost"]
   ```

   Prefer binding: `--hostname 0.0.0.0 --port 43123`.

4. **Browser error: `Router action dispatched before initialization`**  
   Seen intermittently in Turbopack dev logs; production `next start` is more stable for demos.

## Auto-open when the user’s computer starts

A website cannot force launch at power-on. One-time OS helpers live in `scripts/startup/`:

- macOS: `./scripts/startup/install-macos-login-item.sh`
- Windows: `.\scripts\startup\install-windows-startup.ps1`
- Linux: `./scripts/startup/install-linux-autostart.sh`

These start the local server (if needed) and open the app at login. Logs: `~/.stride/` (Windows: `%USERPROFILE%\.stride\`).

In-app panel: **Open when your computer starts** (`StartupGuide`).

## Key files

| Path | Role |
|---|---|
| `src/components/daily-todo-app.tsx` | Main UI |
| `src/components/buddy-companion.tsx` | Avatar + voice controls |
| `src/hooks/use-todos.ts` | Todos + settings + localStorage |
| `src/hooks/use-buddy-voice.ts` | Greeting / nudge speech |
| `src/hooks/use-reminders.ts` | Timed reminders |
| `src/lib/speech.ts` | Web Speech helpers |
| `public/manifest.webmanifest` + `public/sw.js` | PWA |
| `scripts/startup/*` | OS login autostart |
| `scripts/start-public.sh` | Local server + public tunnel helper |

## Product defaults

- Brand name: **Stride** (working name; rename if user prefers)
- Buddy calls user: **Hari** (`DEFAULT_SETTINGS.userName`)
- Voice on by default
- Storage keys: `stride.todos.v1`, `stride.progress.v1`, `stride.settings.v1`

## Checklist before saying “it’s live”

1. `npm install` if `node_modules` missing  
2. `curl http://127.0.0.1:43123` → 200 inside the VM  
3. If the user needs laptop access → start Cloudflare tunnel and share the `*.trycloudflare.com` URL  
4. Confirm that public URL returns 200 + `Stride` in HTML  
5. Remind them the tunnel dies when the agent/tunnel stops  

## What not to assume

- Do not assume `127.0.0.1` links work in the user’s local browser during Cloud Agent sessions  
- Do not assume `node_modules` or `.next` persist across environment resets  
- Do not promise permanent public hosting from a quick tunnel  
