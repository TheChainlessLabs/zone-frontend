"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import Modal from "@/components/Modal";
import type { Side, OrderType } from "@/lib/types";

export interface OrderConfirmationDetails {
  side: Side;
  pair: string;
  type: OrderType;
  amount: string;
  price: string;
  estReceive: string;
  fee: string;
}

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderDetails: OrderConfirmationDetails;
}

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  orderDetails,
}: OrderConfirmationModalProps) {
  const { side, pair, type, amount, price, estReceive, fee } = orderDetails;
  const isBuy = side === "buy";
  const isMarket = type === "midpoint";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Order">
      <div className="flex flex-col gap-4">
        {/* Side badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-body-sm font-semibold uppercase px-2 py-0.5 rounded ${
              isBuy
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error"
            }`}
          >
            {side}
          </span>
          <span className="text-body-sm text-text-primary font-medium">{pair}</span>
        </div>

        {/* Order details */}
        <div className="flex flex-col gap-2.5 text-body-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Order Type</span>
            <span className="text-text-primary capitalize">{type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Amount</span>
            <span className="text-text-primary font-mono font-tabular">{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Price</span>
            <span className="text-text-primary font-mono font-tabular">{price}</span>
          </div>
          <div className="h-px bg-border-subtle" />
          <div className="flex justify-between">
            <span className="text-text-muted">Est. Receive</span>
            <span className="text-text-primary font-mono font-tabular">${estReceive}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Fee</span>
            <span className="text-text-primary font-mono font-tabular">${fee}</span>
          </div>
        </div>

        {/* Market order warning */}
        {isMarket && (
          <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-md px-3 py-2">
            <AlertTriangle size={16} className="text-warning mt-0.5 shrink-0" />
            <span className="text-body-sm text-warning">
              Price may vary. Market orders execute at the best available price.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            onClick={onClose}
            className="flex-1 h-[44px] rounded-md text-body-sm font-semibold border border-border text-text-secondary hover:bg-bg-elevated transition-fast"
          >
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            onClick={onConfirm}
            className={`flex-1 h-[44px] rounded-md text-body-sm font-semibold text-text-inverse transition-fast ${
              isBuy
                ? "bg-success hover:bg-success-hover active:bg-success-active"
                : "bg-error hover:bg-error-hover active:bg-error-active"
            }`}
          >
            Confirm Order
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
