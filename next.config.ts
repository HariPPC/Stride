import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow common local preview hosts (Cloud Agent / desktop browsers).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // better-sqlite3 is native; keep it external (also in Next defaults).
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
