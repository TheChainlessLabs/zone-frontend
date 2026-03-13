import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <span className="text-[120px] md:text-[180px] font-bold leading-none text-text-primary/10 select-none font-display">
          404
        </span>
        <h1 className="text-h2 md:text-h1 font-semibold mt-2">Page Not Found</h1>
        <p className="text-body-sm text-text-muted mt-2 text-center max-w-[400px]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 mt-8">
          <Link
            href="/trade"
            className="h-[40px] px-6 flex items-center text-body-sm font-medium rounded-md bg-accent text-text-inverse hover:bg-accent-hover transition-fast"
          >
            Go to Trade
          </Link>
          <Link
            href="/"
            className="h-[40px] px-6 flex items-center text-body-sm font-medium rounded-md border border-border text-text-primary hover:bg-bg-elevated transition-fast"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
