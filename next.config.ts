import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/og": ["./app/api/og/fonts/**/*"],
  },
};

export default nextConfig;
