import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { createElement, type ReactNode } from "react";
import NotificationCenter from "../NotificationCenter";
import {
  NotificationProvider,
  useNotifications,
} from "@/lib/useNotifications";

// Mock localStorage
const store: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
});

afterEach(() => {
  cleanup();
  Object.keys(store).forEach((k) => delete store[k]);
});

function Wrapper({ children }: { children: ReactNode }) {
  return createElement(NotificationProvider, null, children);
}

// Helper component that adds a notification on mount
function AddNotificationHelper({
  type,
  title,
  message,
}: {
  type: "order_placed" | "order_cancelled" | "order_filled" | "error";
  title: string;
  message: string;
}) {
  const { addNotification } = useNotifications();
  return createElement(
    "button",
    {
      "data-testid": "add-btn",
      onClick: () => addNotification(type, title, message),
    },
    "Add"
  );
}

describe("NotificationCenter", () => {
  it("renders bell icon", () => {
    render(
      createElement(Wrapper, null, createElement(NotificationCenter))
    );
    expect(screen.getByLabelText("Notifications")).toBeDefined();
  });

  it("shows unread count badge after adding a notification", () => {
    render(
      createElement(
        Wrapper,
        null,
        createElement(NotificationCenter),
        createElement(AddNotificationHelper, {
          type: "order_placed",
          title: "Order Placed",
          message: "Buy 100 EUR",
        })
      )
    );

    // Add a notification
    fireEvent.click(screen.getByTestId("add-btn"));

    // Badge should show 1
    const badge = screen.getByText("1");
    expect(badge).toBeDefined();
  });

  it("opens dropdown on click and shows notifications", () => {
    render(
      createElement(
        Wrapper,
        null,
        createElement(NotificationCenter),
        createElement(AddNotificationHelper, {
          type: "order_cancelled",
          title: "Order Cancelled",
          message: "Order #42 cancelled",
        })
      )
    );

    // Add a notification
    fireEvent.click(screen.getByTestId("add-btn"));

    // Open the dropdown
    fireEvent.click(screen.getByLabelText("Notifications"));

    // Should show the notification
    expect(screen.getByText("Order Cancelled")).toBeDefined();
    expect(screen.getByText("Order #42 cancelled")).toBeDefined();
    expect(screen.getByText("Mark all read")).toBeDefined();
  });

  it("shows empty state when no notifications", () => {
    render(
      createElement(Wrapper, null, createElement(NotificationCenter))
    );

    // Open dropdown
    fireEvent.click(screen.getByLabelText("Notifications"));

    expect(screen.getByText("No notifications yet")).toBeDefined();
  });

  it("marks all as read when clicking mark all read", () => {
    render(
      createElement(
        Wrapper,
        null,
        createElement(NotificationCenter),
        createElement(AddNotificationHelper, {
          type: "order_filled",
          title: "Order Filled",
          message: "Your order was filled",
        })
      )
    );

    // Add notification
    fireEvent.click(screen.getByTestId("add-btn"));

    // Badge should show 1
    expect(screen.getByText("1")).toBeDefined();

    // Open dropdown and mark all read
    fireEvent.click(screen.getByLabelText("Notifications"));
    fireEvent.click(screen.getByText("Mark all read"));

    // Badge should be gone (unread count = 0)
    expect(screen.queryByText("1")).toBeNull();
  });
});
