import { BrandSpecimen } from "@/components/brand/brand-specimen";
import { ReviewNav } from "@/components/ReviewNav";
import { BRAND_DIRECTIONS } from "@/lib/brand-directions";

export default function BrandComparePage() {
  return (
    <main className="min-h-screen pb-12">
      <ReviewNav />
      <div className="mx-auto grid max-w-[1680px] gap-4 p-4 md:grid-cols-2">
        {BRAND_DIRECTIONS.map((direction) => (
          <section key={direction.id} data-brand-direction={direction.id} data-testid="brand-compare-cell" className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--background)]">
            <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{direction.name}</span>
              <span aria-label={`${direction.name} accent swatch`} className="h-3 w-12 rounded-full border border-[var(--border)] bg-transparent" />
            </header>
            <div className="origin-top-left scale-[0.84]">
              <BrandSpecimen direction={direction.id} />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
