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

const legacyPaths = ["automation", "status", "privacy", "terms"] as const;

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return legacyPaths.map((path) => ({
      source: `/${path}`,
      destination: "/",
      permanent: true,
    }));
  },
  async rewrites() {
    return [{ source: "/agent/", destination: "/agent" }];
  },
};

export default nextConfig;
