#!/usr/bin/env bash
# Start Stride (if needed) and open it when you log in.
# Usage: ./scripts/startup/open-stride.sh [port]
set -euo pipefail

PORT="${1:-43123}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
URL="http://127.0.0.1:${PORT}"
LOG_DIR="${HOME}/.stride"
LOG_FILE="${LOG_DIR}/startup.log"
PID_FILE="${LOG_DIR}/server.pid"

mkdir -p "${LOG_DIR}"

is_up() {
  curl -sf -o /dev/null "${URL}" || return 1
}

start_server() {
  cd "${ROOT}"
  if [[ ! -d node_modules ]]; then
    echo "[stride] Installing dependencies..." >> "${LOG_FILE}"
    npm install >> "${LOG_FILE}" 2>&1
  fi

  # Prefer production server if a build exists; otherwise use next start after build, else dev.
  if [[ -d .next ]]; then
    nohup npm run start -- --port "${PORT}" >> "${LOG_FILE}" 2>&1 &
  else
    nohup npm run build >> "${LOG_FILE}" 2>&1 \
      && nohup npm run start -- --port "${PORT}" >> "${LOG_FILE}" 2>&1 &
  fi
  echo $! > "${PID_FILE}"
}

open_app() {
  if command -v open >/dev/null 2>&1; then
    # macOS — prefer installed PWA-style Chrome app window when available
    open "${URL}" || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "${URL}" || true
  elif command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Start-Process '${URL}'" || true
  fi
}

{
  echo "---- $(date -Iseconds) ----"
  if is_up; then
    echo "[stride] Already running at ${URL}"
  else
    echo "[stride] Starting server on ${PORT}..."
    start_server
    for i in $(seq 1 60); do
      if is_up; then
        echo "[stride] Server ready"
        break
      fi
      sleep 1
    done
  fi
  open_app
  echo "[stride] Opened ${URL}"
} >> "${LOG_FILE}" 2>&1
