import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] px-4 py-8">
      <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error mb-4">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-h3 font-semibold text-text-primary mb-1">Something went wrong</h3>
      <p className="text-body-sm text-text-muted text-center max-w-[280px]">
        {message ?? "We couldn\u2019t load this data. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 h-[36px] px-5 inline-flex items-center justify-center rounded-md border border-border text-text-primary text-body-sm font-medium hover:bg-bg-elevated transition-fast"
        >
          Retry
        </button>
      )}
    </div>
  );
}
