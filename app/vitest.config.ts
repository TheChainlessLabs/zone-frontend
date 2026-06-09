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
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}", "**/*.test.{ts,tsx}"],
    // Storybook stories are not tests — keep vitest from accidentally
    // picking them up if include globs ever broaden.
    exclude: ["**/node_modules/**", "**/.storybook/**", "**/*.stories.{ts,tsx}"],
    passWithNoTests: true,
  },
});
