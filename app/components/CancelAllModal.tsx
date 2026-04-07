"use client";

import Modal from "./Modal";

interface CancelAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  openOrders: Array<{ id: number; pair: string; amount: number }>;
}

export default function CancelAllModal({ isOpen, onClose, openOrders }: CancelAllModalProps) {
  const totalValue = openOrders.reduce((sum, o) => sum + o.amount, 0);
  const pairsAffected = new Set(openOrders.map((o) => o.pair)).size;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel All Orders">
      <div className="flex flex-col gap-4">
        <div className="bg-bg-base border border-border rounded-md p-4 flex flex-col gap-2">
          <div className="flex justify-between text-body-sm">
            <span className="text-text-muted">Open orders</span>
            <span className="font-mono font-tabular">{openOrders.length}</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-text-muted">Total value</span>
            <span className="font-mono font-tabular">${totalValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-text-muted">Pairs affected</span>
            <span className="font-mono font-tabular">{pairsAffected}</span>
          </div>
        </div>

        <p className="text-body-sm text-text-muted">
          This will cancel all open orders. Aggregation-locked orders cannot be cancelled.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-[44px] text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast"
          >
            Keep Orders
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-[44px] text-body-sm font-semibold rounded-md bg-error text-text-inverse hover:bg-error-hover transition-fast"
          >
            Cancel All
          </button>
        </div>
      </div>
    </Modal>
  );
}
