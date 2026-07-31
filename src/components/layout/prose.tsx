import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <div className="grid gap-8">{children}</div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{heading}</h2>
      <div className="mt-3 grid gap-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}