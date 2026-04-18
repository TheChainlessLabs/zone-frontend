"use client";

import Modal from "./Modal";

interface CancelAllProgress {
  done: number;
  failed: number;
  total: number;
}

interface CancelAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  openOrders: Array<{ id: number; pair: string; amount: number }>;
  onCancelAll?: () => void;
  progress?: CancelAllProgress | null;
}

export default function CancelAllModal({ isOpen, onClose, openOrders, onCancelAll, progress }: CancelAllModalProps) {
  const totalValue = openOrders.reduce((sum, o) => sum + o.amount, 0);
  const pairsAffected = new Set(openOrders.map((o) => o.pair)).size;
  const isCancelling = progress !== null && progress !== undefined;

  return (
    <Modal isOpen={isOpen} onClose={isCancelling ? () => {} : onClose} title="Cancel All Orders">
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

        {isCancelling ? (
          <div className="flex flex-col gap-2">
            <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-error rounded-full transition-all duration-300"
                style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-body-sm text-text-secondary text-center">
              Cancelling {progress.done} of {progress.total}...
              {progress.failed > 0 && (
                <span className="text-error"> ({progress.failed} failed)</span>
              )}
            </p>
          </div>
        ) : (
          <p className="text-body-sm text-text-muted">
            This will cancel all open orders. Aggregation-locked orders cannot be cancelled.
          </p>
        )}

        <div className="flex gap-3">
          <button
            data-testid="cancel-all-modal-keep"
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 h-[44px] text-body-sm font-medium border border-border rounded-md text-text-primary hover:bg-bg-elevated transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Orders
          </button>
          <button
            data-testid="cancel-all-modal-confirm"
            onClick={onCancelAll}
            disabled={isCancelling || openOrders.length === 0}
            className="flex-1 h-[44px] text-body-sm font-semibold rounded-md bg-error text-text-inverse hover:bg-error-hover transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? "Cancelling..." : "Cancel All"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
