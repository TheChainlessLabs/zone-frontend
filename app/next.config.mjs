import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer, dev }) {
    // In production client builds, replace devWallet with a no-op stub
    // so dev-only code is excluded from the client bundle.
    if (!isServer && !dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        [path.resolve(__dirname, "lib/devWallet")]: path.resolve(
          __dirname,
          "lib/devWalletStub"
        ),
      };

      // Same pattern for the e2e test hooks: only bundle the real
      // implementation when explicitly opted in via
      // NEXT_PUBLIC_OMEGA_E2E_TEST=true. Otherwise resolve to the stub so
      // __TEST_* globals and mirror logic drop out of prod bundles.
      if (process.env.NEXT_PUBLIC_OMEGA_E2E_TEST !== "true") {
        config.resolve.alias[path.resolve(__dirname, "lib/testHooks")] =
          path.resolve(__dirname, "lib/testHooksStub");
      }
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
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
              "frame-ancestors 'none'",
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
