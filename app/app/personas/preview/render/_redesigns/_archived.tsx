// Placeholder for persona redesigns whose source was generated against
// exploration scaffolding that has since been removed (e.g. the
// /portfolio/preview `_variants/_shared` helpers, deleted when the portfolio
// surface was ported to the design kit). The persona-review render route is
// exploration tooling; this keeps it building. Re-run the persona pipeline to
// regenerate a live redesign for the affected ids.
export default function ArchivedRedesign() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "40vh",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        color: "var(--muted-foreground)",
      }}
    >
      This persona redesign was archived — its source referenced exploration
      scaffolding that has been removed. Re-run the persona pipeline to
      regenerate it.
    </div>
  );
}
