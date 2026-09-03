import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow 127.0.0.1 in addition to localhost for Cloud Agent / local previews.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
