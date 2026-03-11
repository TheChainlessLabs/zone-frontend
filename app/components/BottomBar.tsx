export default function BottomBar() {
  return (
    <div className="h-[40px] bg-bg-surface border-t border-border flex items-center px-4 text-body-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success" />
        <span className="text-text-secondary">TEE Connected</span>
      </div>

      <span className="mx-4 w-px h-4 bg-border" />

      <div className="hidden md:flex items-center gap-2">
        <span className="font-mono font-tabular text-text-primary">Batch #1247</span>
        <span className="text-label-uppercase px-2 py-0.5 rounded-sm bg-warning/20 text-warning">
          Processing
        </span>
      </div>

      <span className="ml-auto text-text-muted text-body-sm">
        Last update 2s ago
      </span>
    </div>
  );
}
