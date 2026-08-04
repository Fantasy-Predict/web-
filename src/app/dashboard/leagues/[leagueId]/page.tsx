import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { StatCard } from "../../../../components/app/card";
import { formatNaira, leaderboard, leagues } from "../../../lib/mock-data";
import { InviteButton } from "./invite-button";
import { cn } from "../../../lib/utils";

function getLeague(leagueId: string) {
  return leagues.find((l) => l.id === leagueId);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}): Promise<Metadata> {
  const { leagueId } = await params;
  const league = getLeague(leagueId);

  if (!league) {
    return {
      title: "League unavailable — Fantasy Predict",
      robots: { index: false },
    };
  }

  return {
    title: `${league.name} — Fantasy Predict`,
    description: `${league.name} is a ${league.competition} prediction league with a ${formatNaira(league.prizePool)} prize pool and ${league.players} players.`,
    openGraph: {
      title: `${league.name} — Fantasy Predict`,
      description: `${league.competition} prediction league · ${formatNaira(league.prizePool)} prize pool.`,
    },
  };
}

export default async function LeagueDetailPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const league = getLeague(leagueId);

  if (!league) notFound();

  const isFree = league.type === "free";
  const isMonetized = league.type === "monetized";
  const hasPrize = league.prizeType === "prizes";

  // Calculate platform fee breakdown for monetized leagues
  const totalPot = league.entryFee * league.maxPlayers;
  const platformFee = isMonetized ? Math.round(totalPot * 0.1) : 0;
  const prizePoolAfterFee = isMonetized ? totalPot - platformFee : 0;

  // Map poolFor value to display label
  const poolForLabels: Record<string, string> = {
    office: "Office pool",
    "friends-family": "Friends / family",
    open: "Open pool - anyone is welcome!",
    "media-blog": "Media / blog",
    business: "Business / competition",
    other: "Other",
  };

  return (
    <AppShell
      title={league.name}
      description={`${league.competition} · ${league.privacy === "private" ? "Private league" : "Public league"}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold px-2.5 py-1",
              isFree
                ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                : "border-gold/30 bg-gold/10 text-gold"
            )}
          >
            {isFree ? "Free" : "Monetized"}
          </Badge>
          <InviteButton leagueId={league.id} />
          <Button>
            {league.rank ? "Make predictions" : isFree ? "Join Free" : `Join for ${formatNaira(league.entryFee)}`}
          </Button>
        </div>
      }
    >
      {/* Stats Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Prize pool" 
          value={isFree ? "—" : formatNaira(league.prizePool)} 
          accent="gold" 
        />
        <StatCard 
          label="Entry fee" 
          value={isFree ? "Free" : formatNaira(league.entryFee)} 
        />
        <StatCard label="Participants" value={`${league.players}/${league.maxPlayers}`} />
        <StatCard label="Season progress" value={`${league.progress}%`} accent="primary" />
      </div>

      {/* New: League Details Section – Pool For, Prize Type, Introduction, Platform Fee */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {/* Left Column: Pool For + Prize Type */}
        <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            League Details
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Who is this pool for?</p>
              <p className="text-sm font-medium">{poolForLabels[league.poolFor] || league.poolFor}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Anything to win?</p>
              <p className="text-sm font-medium">{hasPrize ? "There are prizes 🏆" : "It's just for fun"}</p>
            </div>
            {league.introduction && (
              <div>
                <p className="text-xs text-muted-foreground">Introduction</p>
                <p className="text-sm font-medium leading-relaxed">{league.introduction}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Platform Fee (only for monetized leagues) */}
        {isMonetized && (
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)] border-gold/20">
            <h3 className="text-sm font-semibold text-gold uppercase tracking-wider">
              Fee Breakdown
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Entry Fees</span>
                <span className="font-semibold">{formatNaira(totalPot)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee (10%)</span>
                <span className="font-semibold text-gold">{formatNaira(platformFee)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted-foreground">Prize Pool (90%)</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{formatNaira(prizePoolAfterFee)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                The prize pool is distributed among winners based on the league's prize distribution rules.
              </p>
            </div>
          </Card>
        )}

        {/* If free league, show a placeholder card */}
        {isFree && (
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)] border-green-500/20">
            <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
              Free League
            </h3>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                This is a free league with no entry fees. Perfect for playing with friends!
              </p>
              <p className="text-xs text-muted-foreground">
                Prize pool: {formatNaira(league.prizePool) || "Bragging rights only"}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Members + Rules Section */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Members Section */}
        <section>
          <h2 className="text-lg font-semibold">Members</h2>
          <Card className="mt-4 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
            {leaderboard.slice(0, 6).map((row, index) => (
              <div key={row.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                <span className="num text-sm font-bold text-muted-foreground">{index + 1}</span>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-muted text-[10px] font-semibold">
                      {row.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.username}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.country}</p>
                  </div>
                </div>
                <span className="num text-sm font-bold">{row.total.toLocaleString()}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* League Rules Section – Updated Scoring System */}
        <section>
          <h2 className="text-lg font-semibold">League rules</h2>
          <Card className="mt-4 gap-0 p-6 shadow-[var(--shadow-card)]">
            <ul className="grid gap-4 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Exact score:</span> 5 points
                (correct score and outcome).
              </li>
              <li>
                <span className="font-semibold text-foreground">Close (goal margin):</span> 3 points
                (correct margin, e.g., predicted 2-1, actual 3-2).
              </li>
              <li>
                <span className="font-semibold text-foreground">Correct outcome:</span> 2 points
                (correct win/draw result).
              </li>
              <li>
                <span className="font-semibold text-foreground">Wrong:</span> 0 points
                (incorrect prediction).
              </li>
              <li>
                <span className="font-semibold text-foreground">Deadline:</span> predictions lock at
                each match kickoff.
              </li>
              {!isFree && hasPrize && (
                <li>
                  <span className="font-semibold text-foreground">Prize split:</span> top three
                  finishers share the pool 60 / 30 / 10.
                </li>
              )}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary">No late entries after matchweek 5</Badge>
              <Badge variant="secondary">Refunds if the league does not fill</Badge>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}