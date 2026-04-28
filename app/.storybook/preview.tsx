import * as React from "react";
import type { Decorator, Preview } from "@storybook/react";
import { MotionConfig } from "motion/react";

// Loads Tailwind v4 + the brand tokens (dark default, [data-theme="light"]
// override) and the .glass / .glass-pill utilities. Same pipeline the Next
// app uses at runtime — keeps Storybook visually 1:1 with the live UI.
import "../app/globals.css";
// Reduced-transparency simulation utility — dropped under Storybook so the
// fallback path for .glass / .glass-pill is inspectable from the toolbar.
import "./preview.css";

// Globals → toolbar toggles. Decorators below read these values and apply
// them to <html> / <body> / <MotionConfig> so every story renders under the
// selected combination. The three axes are the brand's primary design states
// per omega-docs/03-brand/visual-identity.md:
//   theme        · dark default vs. light override
//   transparency · default glass blur vs. prefers-reduced-transparency
//                  fallback (.glass / .glass-pill collapse to muted)
//   motion       · default ladder vs. prefers-reduced-motion
const preview: Preview = {
  parameters: {
    // Backgrounds are token-driven — disable Storybook's default white/black
    // chips and let the body's bg-background paint via the theme token.
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    a11y: {
      // Surface findings in the panel; don't hard-fail in CI yet (M7 will).
      test: "todo",
    },
  },
  globalTypes: {
    theme: {
      description: "Brand theme (dark default, light override).",
      defaultValue: "dark",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark", icon: "circle" },
          { value: "light", title: "Light", icon: "sun" },
        ],
        dynamicTitle: true,
      },
    },
    transparency: {
      description:
        "Simulate prefers-reduced-transparency by collapsing .glass / .glass-pill to the muted fallback.",
      defaultValue: "default",
      toolbar: {
        title: "Transparency",
        icon: "mirror",
        items: [
          { value: "default", title: "Default", icon: "circle" },
          { value: "reduced", title: "Reduced", icon: "circlehollow" },
        ],
        dynamicTitle: true,
      },
    },
    motion: {
      description:
        "Simulate prefers-reduced-motion by wrapping every story in MotionConfig reducedMotion=always.",
      defaultValue: "default",
      toolbar: {
        title: "Motion",
        icon: "play",
        items: [
          { value: "default", title: "Default", icon: "play" },
          { value: "reduced", title: "Reduced", icon: "stop" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

const withTheme: Decorator = (Story, ctx) => {
  const theme = (ctx.globals.theme as string) ?? "dark";
  const transparency = (ctx.globals.transparency as string) ?? "default";
  const motion = (ctx.globals.motion as string) ?? "default";

  // Apply theme + transparency on the documentElement / body. Storybook
  // remounts decorators when globals change, so the effect runs on every
  // toolbar toggle.
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [theme]);

  React.useEffect(() => {
    const body = document.body;
    if (transparency === "reduced") {
      body.classList.add("reduced-transparency");
    } else {
      body.classList.remove("reduced-transparency");
    }
  }, [transparency]);

  return (
    <MotionConfig reducedMotion={motion === "reduced" ? "always" : "never"}>
      <div className="font-sans bg-background text-foreground p-6 min-h-[120px] flex items-center justify-center">
        <Story />
      </div>
    </MotionConfig>
  );
};

export const decorators: Decorator[] = [withTheme];

export default preview;
