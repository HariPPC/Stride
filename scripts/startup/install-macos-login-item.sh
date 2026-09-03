#!/usr/bin/env bash
# Install a macOS Login Item (LaunchAgent) so Stride opens at login.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LABEL="com.stride.app.startup"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
SCRIPT="${ROOT}/scripts/startup/open-stride.sh"

chmod +x "${SCRIPT}"
mkdir -p "${HOME}/Library/LaunchAgents"

cat > "${PLIST}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>${LABEL}</string>
    <key>ProgramArguments</key>
    <array>
      <string>/bin/bash</string>
      <string>${SCRIPT}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>${ROOT}</string>
    <key>StandardOutPath</key>
    <string>${HOME}/.stride/launchagent.out.log</string>
    <key>StandardErrorPath</key>
    <string>${HOME}/.stride/launchagent.err.log</string>
  </dict>
</plist>
EOF

launchctl unload "${PLIST}" 2>/dev/null || true
launchctl load "${PLIST}"

echo "Stride will open at login."
echo "LaunchAgent installed at: ${PLIST}"
echo "To remove later: launchctl unload \"${PLIST}\" && rm \"${PLIST}\""
