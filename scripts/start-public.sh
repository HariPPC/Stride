#!/usr/bin/env bash
# Start Stride locally and print a public trycloudflare URL (for demos).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${HOME}/.nvm/versions/node/$(ls "${HOME}/.nvm/versions/node" 2>/dev/null | tail -1)/bin:${PATH}"

PORT="${PORT:-43123}"
URL="http://127.0.0.1:${PORT}"

if [[ ! -d node_modules ]]; then
  npm install
fi
if [[ ! -d .next ]]; then
  npm run build
fi

if ! curl -sf -o /dev/null "${URL}"; then
  npm run start >/tmp/stride-server.log 2>&1 &
  echo $! >/tmp/stride-server.pid
  for i in $(seq 1 30); do
    curl -sf -o /dev/null "${URL}" && break
    sleep 1
  done
fi

CF_BIN="${CF_BIN:-cloudflared}"
if ! command -v "${CF_BIN}" >/dev/null 2>&1; then
  if [[ -x /tmp/cloudflared ]]; then
    CF_BIN=/tmp/cloudflared
  else
    echo "cloudflared not found. Install it or place binary at /tmp/cloudflared" >&2
    exit 1
  fi
fi

echo "Local:  ${URL}"
echo "Starting public tunnel..."
exec "${CF_BIN}" tunnel --url "${URL}" --no-autoupdate --protocol http2
