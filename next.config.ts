import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during production builds for now
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
