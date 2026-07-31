import { cn } from "../../app/lib/utils";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import type { League, Match } from "../../app/lib/mock-data";
import { formatNaira } from "../../app/lib/mock-data";
import Link from "next/link";
import { Button } from "../../components/ui/button";

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

export function MatchCard({ match, footer }: { match: Match; footer?: React.ReactNode }) {
  return (
    <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="truncate text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {match.competition}
        </p>
        <MatchStatus status={match.status} kickoff={match.kickoff} />
      </div>
      <div className="mt-4 grid gap-3">
        <MatchRow short={match.homeShort} name={match.home} score={match.score?.home} />
        <MatchRow short={match.awayShort} name={match.away} score={match.score?.away} />
      </div>
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

export function LeagueCard({ league }: { league: League }) {
  return (
    <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{league.name}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">{league.competition}</p>
        </div>
        <Badge variant={league.privacy === "private" ? "secondary" : "outline"} className="shrink-0">
          {league.privacy === "private" ? "Private" : "Public"}
        </Badge>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Entry</dt>
          <dd className="num mt-1 font-semibold">{formatNaira(league.entryFee)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Prize pool</dt>
          <dd className="num mt-1 font-semibold text-gold">{formatNaira(league.prizePool)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Players</dt>
          <dd className="num mt-1 font-semibold">
            {league.players}/{league.maxPlayers}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Season progress</span>
          <span className="num">{league.progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${league.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="truncate text-xs text-muted-foreground">
          {league.rank ? `Your position: #${league.rank}` : "You have not joined this league"}
        </p>
        <Button asChild size="sm" variant={league.rank ? "outline" : "default"}>
          <Link href={`/dashboard/leagues/${league.id}`}>
            {league.rank ? "View" : "Join"}
          </Link>
        </Button>
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