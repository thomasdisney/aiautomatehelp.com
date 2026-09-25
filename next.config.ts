import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      { source: "/status/", destination: "/status" },
      { source: "/automation/", destination: "/automation" },
      { source: "/privacy/", destination: "/privacy" },
      { source: "/terms/", destination: "/terms" },
    ];
  },
  async redirects() {
    return [
      { source: "/agent/", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
