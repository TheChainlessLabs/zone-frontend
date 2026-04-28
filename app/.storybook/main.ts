import type { StorybookConfig } from "@storybook/react-webpack5";

/**
 * Storybook 8 config for the Omega design system showcase.
 *
 * Stories live co-located with the primitives in `components/ui/`. Tailwind
 * v4 + the design tokens load through `app/globals.css` (imported in
 * preview.tsx) via the postcss-loader Storybook auto-detects.
 *
 * Framework: react-webpack5 over @storybook/nextjs. The primitives don't
 * import next/image, next/link, next/router, or next/navigation — using the
 * plain react-webpack5 framework avoids the Webpack 5 instance mismatch
 * between @storybook/nextjs and Next's bundled webpack under pnpm
 * (storybookjs/storybook#22431, "Cannot read properties of undefined
 * (reading 'tap')"). When a primitive eventually needs Next.js APIs, switch
 * to @storybook/nextjs and configure the hoisting workaround.
 *
 * Addons:
 *   - addon-essentials → controls/actions/viewport/measure/outline/backgrounds
 *   - addon-themes     → toolbar toggles wired into the preview decorators
 *   - addon-a11y       → axe-core panel for WCAG checks per story
 */
const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(ts|tsx)",
    "../app/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-themes",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  // Babel preset chain so stories' TypeScript + JSX get transformed.
  // Without this, @storybook/builder-webpack5 falls back to acorn (JS-only)
  // and chokes on `import type` / TSX syntax.
  babel: async (config) => ({
    ...config,
    presets: [
      ["@babel/preset-env", { targets: { esmodules: true } }],
      ["@babel/preset-react", { runtime: "automatic" }],
      "@babel/preset-typescript",
      ...(config.presets ?? []),
    ],
  }),
  webpackFinal: async (config) => {
    // `.ts` / `.tsx` resolution + the `@/*` path alias mirror the values in
    // app/tsconfig.json so stories can import primitives the same way the
    // app does (e.g., `@/lib/icons`).
    const path = await import("path");
    config.resolve = config.resolve ?? {};
    const exts = config.resolve.extensions ?? [];
    for (const ext of [".ts", ".tsx"]) {
      if (!exts.includes(ext)) exts.push(ext);
    }
    config.resolve.extensions = exts;
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(__dirname, ".."),
    };
    // Add a babel-loader rule for our TS/TSX so it picks up the preset
    // chain above (the builder's default rule only sees `.js` files in
    // some configurations).
    config.module = config.module ?? { rules: [] };
    config.module.rules = config.module.rules ?? [];
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: require.resolve("babel-loader"),
        options: {
          presets: [
            ["@babel/preset-env", { targets: { esmodules: true } }],
            ["@babel/preset-react", { runtime: "automatic" }],
            "@babel/preset-typescript",
          ],
        },
      },
    });
    return config;
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
  typescript: {
    // Faster startup; the diff is reviewed in-IDE anyway.
    reactDocgen: "react-docgen",
  },
};

export default config;
