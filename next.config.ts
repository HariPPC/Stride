import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow common local preview hosts (Cloud Agent / desktop browsers).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
