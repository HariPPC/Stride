#!/usr/bin/env bash
# Install a Linux desktop autostart entry for Stride.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="${ROOT}/scripts/startup/open-stride.sh"
AUTOSTART_DIR="${HOME}/.config/autostart"
DESKTOP="${AUTOSTART_DIR}/stride.desktop"

chmod +x "${SCRIPT}"
mkdir -p "${AUTOSTART_DIR}"

cat > "${DESKTOP}" <<EOF
[Desktop Entry]
Type=Application
Name=Stride
Comment=Open Stride daily todo buddy at login
Exec=/bin/bash ${SCRIPT}
X-GNOME-Autostart-enabled=true
Terminal=false
EOF

echo "Stride autostart installed at: ${DESKTOP}"
echo "It will open at login on most Linux desktops."
echo "To remove later: rm \"${DESKTOP}\""
