const frameAncestors = process.env.OMEGA_FRAME_ANCESTORS?.trim() || "'self'";
const frameOptionHeaders =
  frameAncestors === "'self'"
    ? [{ key: "X-Frame-Options", value: "SAMEORIGIN" }]
    : [];
const allowedDevOrigins = process.env.OMEGA_ALLOWED_DEV_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          ...frameOptionHeaders,
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https://wallet.tempo.xyz https://wallet-next.tempo.xyz",
              `frame-ancestors ${frameAncestors}`,
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
