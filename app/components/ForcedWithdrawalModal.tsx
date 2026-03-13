"use client";

import { useState } from "react";
import Modal from "./Modal";

interface ForcedWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForcedWithdrawalModal({ isOpen, onClose }: ForcedWithdrawalModalProps) {
  const [confirmText, setConfirmText] = useState("");

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const withdrawable = 28750.50;
  const forfeited = 5100.00;
  const net = withdrawable - forfeited;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Force Withdrawal">
      <div className="flex flex-col gap-4">
        <p className="text-body-sm text-error font-medium">
          This action cannot be undone.
        </p>

        <p className="text-body-sm text-text-secondary">
          Force withdrawal will immediately withdraw all available funds. Any reserved funds in
          active orders will be forfeited.
        </p>

        <div className="bg-bg-base border border-border rounded-md p-4 flex flex-col gap-2">
          <div className="flex justify-between text-body-sm">
            <span className="text-text-muted">Withdrawable</span>
            <span className="font-mono font-tabular text-success">
              ${withdrawable.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-body-sm">
            <span className="text-text-muted">Forfeited (reserved)</span>
            <span className="font-mono font-tabular text-error">
              -${forfeited.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-body-sm font-medium">
            <span className="text-text-primary">Net withdrawal</span>
            <span className="font-mono font-tabular">
              ${net.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div>
          <label className="text-body-sm text-text-muted mb-1 block">
            Type <span className="font-mono text-text-primary">FORCE WITHDRAW</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="FORCE WITHDRAW"
            className="w-full h-[44px] bg-bg-base border border-border rounded-md px-4 text-body-sm font-mono outline-none text-text-primary placeholder:text-text-muted focus:border-border-focus"
          />
        </div>

        <button
          onClick={handleClose}
          disabled={confirmText !== "FORCE WITHDRAW"}
          className="h-[44px] w-full text-body-sm font-semibold rounded-md bg-error text-text-inverse transition-fast disabled:opacity-40 disabled:cursor-not-allowed hover:bg-error-hover"
        >
          Force Withdraw
        </button>
      </div>
    </Modal>
  );
}
