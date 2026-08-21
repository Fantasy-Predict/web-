import { cn } from "../../app/lib/utils";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import type { Pool, Match } from "../../app/lib/mock-data";
import { formatNaira } from "../../app/lib/mock-data";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import type { ScoringResult } from "../../app/lib/scoring";

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "gold" | "primary" | "success";
}) {
  return (
    <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "num mt-3 font-display text-2xl font-bold",
          accent === "gold" && "text-gold",
          accent === "primary" && "text-primary",
          accent === "success" && "text-success",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function TeamCrest({ short }: { short: string }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted text-[11px] font-bold tracking-wide">
      {short}
    </span>
  );
}

export function MatchCard({ 
  match, 
  footer, 
  scoringResult 
}: { 
  match: Match; 
  footer?: React.ReactNode;
  scoringResult?: ScoringResult | null;
}) {
  return (
    <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="truncate text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {match.competitionName ?? match.competition}
        </p>
        <MatchStatus status={match.status} kickoff={match.kickoff} />
      </div>
      <div className="mt-4 grid gap-3">
        <MatchRow short={match.homeShort} name={match.home} score={match.score?.home} />
        <MatchRow short={match.awayShort} name={match.away} score={match.score?.away} />
      </div>

      {/* Points earned display */}
      {scoringResult && match.status === "finished" && (
        <div className="mt-4 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Your Prediction</p>
              <p className="text-xs text-muted-foreground">
                Points earned: <span className="font-bold text-foreground">{scoringResult.points}</span>
              </p>
            </div>
            <Badge
              className={cn(
                "px-3 py-1 text-xs font-semibold",
                scoringResult.points === 5 && "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
                scoringResult.points === 3 && "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
                scoringResult.points === 2 && "border-gold/30 bg-gold/10 text-gold",
                scoringResult.points === 0 && "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
              )}
            >
              {scoringResult.label} — {scoringResult.points} pts
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{scoringResult.description}</p>
        </div>
      )}

      {footer && <div className="mt-5 border-t border-border pt-4">{footer}</div>}
    </Card>
  );
}

function MatchRow({ short, name, score }: { short: string; name: string; score?: number }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
      <TeamCrest short={short} />
      <span className="truncate text-sm font-semibold">{name}</span>
      <span className="num text-sm font-bold text-muted-foreground">{score ?? "–"}</span>
    </div>
  );
}

export function MatchStatus({ status, kickoff }: { status: Match["status"]; kickoff: string }) {
  if (status === "live") {
    return (
      <Badge className="shrink-0 border-transparent bg-destructive/10 text-destructive">Live</Badge>
    );
  }
  if (status === "finished") {
    return (
      <Badge variant="secondary" className="shrink-0">
        Full time
      </Badge>
    );
  }
  return (
    <span className="num shrink-0 text-xs font-semibold text-muted-foreground">{kickoff}</span>
  );
}

export function PoolCard({ pool, onJoin }: { pool: Pool; onJoin?: () => void }) {
  const isFree = pool.type === "free";

  return (
    <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{pool.name}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">{pool.competition}</p>
        </div>
        <div className="flex items-center gap-2">
          {isFree ? (
            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400">
              Free
            </Badge>
          ) : (
            <Badge variant="outline" className="border-gold/30 bg-gold/10 text-gold">
              Monetized
            </Badge>
          )}
          <Badge variant={pool.privacy === "private" ? "secondary" : "outline"} className="shrink-0">
            {pool.privacy === "private" ? "Private" : "Public"}
          </Badge>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Entry</dt>
          <dd className="num mt-1 font-semibold">
            {isFree ? "Free" : formatNaira(pool.entryFee)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Prize pool</dt>
          <dd className="num mt-1 font-semibold text-gold">
            {isFree ? "—" : formatNaira(pool.prizePool)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Players</dt>
          <dd className="num mt-1 font-semibold">
            {pool.players}/{pool.maxPlayers}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Season progress</span>
          <span className="num">{pool.progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${pool.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="truncate text-xs text-muted-foreground">
          {onJoin ? "Available to join" : "Your pool"}
        </p>
        {onJoin ? (
          <Button size="sm" onClick={onJoin}>
            Join
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/pools/${pool.id}`}>
              View
            </Link>
          </Button>
        )}
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="items-center gap-0 border-dashed p-12 text-center shadow-none">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}