import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dribbble.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Suppress warnings for OpenTelemetry instrumentation packages used by Inngest
    if (isServer) {
      config.ignoreWarnings = [
        { module: /opentelemetry/ },
        { module: /require-in-the-middle/ },
      ];
    }
    return config;
  },
};

export default nextConfig;
