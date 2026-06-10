import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    // Zone identifiers are env-driven (no default zone in source). The tests
    // pin the canonical generated local zone-35, so provide those values here.
    env: {
      NEXT_PUBLIC_OMEGA_ZONE_ID: "35",
      NEXT_PUBLIC_OMEGA_ZONE_CHAIN_ID: "421700035",
      NEXT_PUBLIC_OMEGA_ZONE_PORTAL:
        "0xA6b5f8aF076DaAFBfd373a2629e4E46c8e03e6b2",
      NEXT_PUBLIC_OMEGA_ZONE_OALPHA:
        "0x20c000000000000000000000518ddadd37ed1d28",
    },
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],
    // Storybook stories are not tests — keep vitest from accidentally
    // picking them up if include globs ever broaden.
    exclude: ["**/node_modules/**", "**/.storybook/**", "**/*.stories.{ts,tsx}"],
    passWithNoTests: true,
  },
});
