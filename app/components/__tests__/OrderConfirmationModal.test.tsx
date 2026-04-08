import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import OrderConfirmationModal from "@/components/OrderConfirmationModal";
import type { OrderConfirmationDetails } from "@/components/OrderConfirmationModal";

afterEach(cleanup);

const baseDetails: OrderConfirmationDetails = {
  side: "buy",
  pair: "EUR / USD",
  type: "limit",
  amount: "500 EUR",
  price: "1.0850",
  estReceive: "542.50",
  fee: "0.03",
};

describe("OrderConfirmationModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <OrderConfirmationModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        orderDetails={baseDetails}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders order details correctly when open", () => {
    render(
      <OrderConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        orderDetails={baseDetails}
      />,
    );

    expect(screen.getByRole("heading", { name: "Confirm Order" })).toBeInTheDocument();
    expect(screen.getByText("buy")).toBeInTheDocument();
    expect(screen.getByText("EUR / USD")).toBeInTheDocument();
    expect(screen.getByText("limit")).toBeInTheDocument();
    expect(screen.getByText("500 EUR")).toBeInTheDocument();
    expect(screen.getByText("1.0850")).toBeInTheDocument();
    expect(screen.getByText("$542.50")).toBeInTheDocument();
    expect(screen.getByText("$0.03")).toBeInTheDocument();
  });

  it("renders sell side with correct styling", () => {
    render(
      <OrderConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        orderDetails={{ ...baseDetails, side: "sell" }}
      />,
    );

    const sideBadge = screen.getByText("sell");
    expect(sideBadge.className).toContain("text-error");
  });

  it("calls onConfirm when Confirm Order button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <OrderConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        orderDetails={baseDetails}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirm Order" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onClose when Cancel button is clicked", () => {
    const onClose = vi.fn();
    render(
      <OrderConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        orderDetails={baseDetails}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows 'Price may vary' warning for market (midpoint) orders", () => {
    render(
      <OrderConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        orderDetails={{ ...baseDetails, type: "midpoint" }}
      />,
    );

    expect(screen.getByText(/Price may vary/)).toBeInTheDocument();
  });

  it("does not show 'Price may vary' warning for limit orders", () => {
    render(
      <OrderConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        orderDetails={baseDetails}
      />,
    );

    expect(screen.queryByText(/Price may vary/)).toBeNull();
  });
});
