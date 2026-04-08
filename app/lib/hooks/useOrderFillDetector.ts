"use client";

import { useRef, useEffect } from "react";
import { useNotifications } from "@/lib/useNotifications";
import type { UserOrder } from "@/lib/hooks/useUserOrders";

export function useOrderFillDetector(orders: UserOrder[]) {
  const { addNotification } = useNotifications();
  const prevOrdersRef = useRef<Map<number, string>>(new Map());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!orders.length) return;

    // Skip first render (don't notify for existing fills)
    if (!initializedRef.current) {
      initializedRef.current = true;
      orders.forEach((o) => prevOrdersRef.current.set(o.id, o.status));
      return;
    }

    for (const order of orders) {
      const prevStatus = prevOrdersRef.current.get(order.id);
      if (prevStatus && prevStatus !== "filled" && order.status === "filled") {
        addNotification(
          "order_filled",
          "Order Filled",
          `${order.side} ${order.amount.toLocaleString()} ${order.pair} @ ${order.price.toFixed(4)}`,
        );

        // Browser notification if permission granted
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          new Notification("Omega: Order Filled", {
            body: `${order.side} ${order.amount.toLocaleString()} @ ${order.price.toFixed(4)}`,
          });
        }
      }
    }

    // Update previous states
    orders.forEach((o) => prevOrdersRef.current.set(o.id, o.status));
  }, [orders, addNotification]);
}
