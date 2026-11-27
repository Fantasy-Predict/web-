import { cn } from "../../app/lib/utils";

/** Green up / red down / em-dash. Shown next to a rank number. */
export function DeltaChip({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) {
    return <span className="inline-flex w-10 justify-center text-xs text-muted-foreground">—</span>;
  }
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex w-10 items-center justify-center gap-0.5 text-xs font-semibold",
        up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      )}
    >
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      {Math.abs(delta)}
    </span>
  );
}
