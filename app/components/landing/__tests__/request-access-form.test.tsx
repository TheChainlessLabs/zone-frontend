import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RequestAccessForm } from "@/components/landing/request-access-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("RequestAccessForm", () => {
  it("posts a valid access request and shows the success state", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<RequestAccessForm />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Brian Seong" } });
    fireEvent.change(screen.getByLabelText("Work email"), {
      target: { value: "brian@omegamarkets.com" },
    });
    fireEvent.change(screen.getByLabelText("Organization"), {
      target: { value: "Omega Markets" },
    });
    fireEvent.change(screen.getByLabelText("Primary use case"), {
      target: { value: "fund" },
    });
    fireEvent.change(screen.getByLabelText("What do you want to move privately?"), {
      target: { value: "Stablecoin FX flow between USDC and EURC." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Request Access" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/request-access",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(await screen.findByText("Access request received.")).toBeDefined();
  });

  it("blocks invalid email before posting", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<RequestAccessForm />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Brian Seong" } });
    fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "not-email" } });
    fireEvent.change(screen.getByLabelText("Organization"), {
      target: { value: "Omega Markets" },
    });
    fireEvent.change(screen.getByLabelText("Primary use case"), {
      target: { value: "fund" },
    });
    fireEvent.change(screen.getByLabelText("What do you want to move privately?"), {
      target: { value: "Stablecoin FX flow between USDC and EURC." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Request Access" }));

    expect(await screen.findByText("Enter a valid work email.")).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
