/**
 * Inert placeholder for retired persona-review snapshots.
 *
 * Some batches-targeted redesign snapshots under `tools/persona-review/runs`
 * imported the `/batches/preview/_variants/_shared` module, which was removed
 * when the settlement explorer was ported to the design kit. Those wrappers
 * now re-export this component so the persona render route still compiles
 * without resurrecting the pruned exploration code. Ignores any props the
 * renderer supplies per target.
 */
export function RetiredSnapshot() {
  return (
    <div
      role="note"
      style={{
        display: "flex",
        minHeight: 240,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        padding: 32,
        textAlign: "center",
        color: "var(--muted-foreground)",
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      This persona snapshot targeted the retired batches exploration variants
      and is no longer rendered.
    </div>
  );
}
