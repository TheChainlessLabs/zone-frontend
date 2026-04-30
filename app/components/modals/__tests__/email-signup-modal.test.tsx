import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import { EmailSignupModal } from "@/components/modals";

afterEach(cleanup);

describe("EmailSignupModal — idle (default)", () => {
  it("opens at idle with the email input + Send magic link CTA", () => {
    render(
      <EmailSignupModal open state="idle" onClose={() => {}} />,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByPlaceholderText("you@example.com")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /send magic link/i }),
    ).toBeTruthy();
  });
});

describe("EmailSignupModal — submit flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("submitting a valid email transitions through submitting → sent and shows the entered email", () => {
    const onSubmit = vi.fn();
    render(
      <EmailSignupModal
        open
        state="idle"
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText(
      "you@example.com",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "alpha@omegamarkets.com" } });
    fireEvent.click(
      screen.getByRole("button", { name: /send magic link/i }),
    );

    // submitting state — Sending... copy is visible
    expect(screen.getByText(/Sending your magic link\./i)).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(700);
    });

    // sent state — title surfaces and the entered email is rendered (in
    // both the dialog description and the body — at least one match).
    expect(
      screen.getAllByText(/Check your inbox/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/alpha@omegamarkets\.com/).length,
    ).toBeGreaterThan(0);
    expect(onSubmit).toHaveBeenCalledWith("alpha@omegamarkets.com");
  });

  it("submitting an invalid email shows an inline error, no submit fires", () => {
    const onSubmit = vi.fn();
    render(
      <EmailSignupModal
        open
        state="idle"
        onClose={() => {}}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText(
      "you@example.com",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "not-an-email" } });
    fireEvent.click(
      screen.getByRole("button", { name: /send magic link/i }),
    );

    expect(
      screen.getByRole("alert").textContent,
    ).toMatch(/valid email/i);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("EmailSignupModal — pinned states (showcase)", () => {
  it("renders the sent view with the supplied email when state='sent'", () => {
    render(
      <EmailSignupModal
        open
        state="sent"
        email="alpha@omegamarkets.com"
        onClose={() => {}}
      />,
    );
    expect(
      screen.getAllByText(/Check your inbox/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/alpha@omegamarkets\.com/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /use a different email/i }),
    ).toBeTruthy();
  });

  it("renders the expired view when state='expired'", () => {
    render(
      <EmailSignupModal open state="expired" onClose={() => {}} />,
    );
    expect(screen.getAllByText(/Link expired/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /send new link/i }),
    ).toBeTruthy();
  });

  it("renders the already-claimed view when state='already-claimed'", () => {
    render(
      <EmailSignupModal
        open
        state="already-claimed"
        email="alpha@omegamarkets.com"
        onClose={() => {}}
      />,
    );
    expect(
      screen.getAllByText(/Already registered/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /resend magic link/i }),
    ).toBeTruthy();
  });

  it("renders the not-on-allowlist view when state='not-on-allowlist'", () => {
    render(
      <EmailSignupModal
        open
        state="not-on-allowlist"
        onClose={() => {}}
      />,
    );
    expect(screen.getAllByText(/Closed alpha/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /request access/i }),
    ).toBeTruthy();
  });
});
