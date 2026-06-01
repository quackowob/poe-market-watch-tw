import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "web.poecdn.com"
      },
      {
        protocol: "https",
        hostname: "poe.ninja"
      }
    ]
  }
};

export default nextConfig;
