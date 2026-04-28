import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { Animate, type AnimateVariant } from "@/components/ui/animate";

afterEach(cleanup);

const VARIANTS: AnimateVariant[] = ["enter", "exit", "expand", "pop", "drawer"];

// Each variant must mount with reduced-motion both off and on — the brand rule
// is that every motion has a non-motion fallback path.
it.each(VARIANTS)("Animate variant=%s mounts in both motion modes", (variant) => {
  for (const reducedMotion of ["user", "always"] as const) {
    const { unmount } = render(
      <MotionConfig reducedMotion={reducedMotion}>
        <Animate variant={variant}>
          <span>{`${variant}:${reducedMotion}`}</span>
        </Animate>
      </MotionConfig>
    );
    expect(screen.getByText(`${variant}:${reducedMotion}`)).toBeDefined();
    unmount();
  }
});

it("Animate forwards HTML attributes to the underlying element", () => {
  render(
    <Animate variant="enter" data-testid="root" aria-label="hello">
      <span>x</span>
    </Animate>
  );
  expect(screen.getByTestId("root").getAttribute("aria-label")).toBe("hello");
});
