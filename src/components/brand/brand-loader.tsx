import { Logo } from "./logo";

export function BrandLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-5">
      <div className="flex h-10 items-end gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block w-2 origin-bottom rounded-full bg-primary"
            style={{
              height: "100%",
              animation: `fp-bar 1s ${i * 0.12}s cubic-bezier(0.4,0,0.2,1) infinite`,
              backgroundColor: i === 2 ? "var(--gold)" : undefined,
            }}
          />
        ))}
      </div>
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  );
}

export function InlineBrandLoader() {
  return (
    <div className="flex items-center gap-3 py-8">
      <Logo variant="mark" />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  );
}