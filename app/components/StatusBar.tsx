export default function StatusBar() {
  return (
    <div className="h-[28px] bg-bg-base border-t border-border-subtle flex items-center px-4 md:px-[60px] text-[12px] shrink-0">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        <span className="text-text-secondary">TEE Connected</span>
      </div>

      <span className="mx-3 w-px h-3 bg-border-subtle" />

      <div className="hidden md:flex items-center gap-2">
        <span className="font-mono font-tabular text-text-primary">Batch #1247</span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-warning/20 text-warning">
          Processing
        </span>
      </div>

      <span className="ml-auto text-text-muted">
        Last update 2s ago
      </span>
    </div>
  );
}
