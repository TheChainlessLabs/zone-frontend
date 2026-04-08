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
    }
    return config;
  },
};

export default nextConfig;
