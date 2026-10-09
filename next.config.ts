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
    return [
      ...legacyPaths.map((path) => ({
        source: `/${path}`,
        destination: "/",
        permanent: true,
      })),
      // One-time install codes from the app: `curl -sL notjunk.si/<code> | sh`.
      // 6 chars of 23456789abcdefghjkmnpqrstuvwxyz with at least one digit, so
      // no real page path matches. 308 to the app, which serves the installer.
      {
        source: "/:code((?=[a-z]*[2-9])[2-9a-hjkmnp-z]{6})",
        destination: "https://app.notjunk.si/:code",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [{ source: "/agent/", destination: "/agent" }];
  },
};

export default nextConfig;
