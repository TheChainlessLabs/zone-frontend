import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] px-4 py-8">
      <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted mb-4">
        {icon}
      </div>
      <h3 className="text-h3 font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-body-sm text-text-muted text-center max-w-[280px]">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-4 h-[36px] px-5 inline-flex items-center justify-center rounded-md bg-accent text-white text-body-sm font-medium hover:bg-accent-hover transition-fast"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-4 h-[36px] px-5 inline-flex items-center justify-center rounded-md bg-accent text-white text-body-sm font-medium hover:bg-accent-hover transition-fast"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
