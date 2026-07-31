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

  return (
    <AppShell
      title={league.name}
      description={`${league.competition} · ${league.privacy === "private" ? "Private league" : "Public league"}`}
      actions={
        <div className="flex gap-2">
          <InviteButton leagueId={league.id} />
          <Button>{league.rank ? "Make predictions" : `Join for ${formatNaira(league.entryFee)}`}</Button>
        </div>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Prize pool" value={formatNaira(league.prizePool)} accent="gold" />
        <StatCard label="Entry fee" value={formatNaira(league.entryFee)} />
        <StatCard label="Participants" value={`${league.players}/${league.maxPlayers}`} />
        <StatCard label="Season progress" value={`${league.progress}%`} accent="primary" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
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

        <section>
          <h2 className="text-lg font-semibold">League rules</h2>
          <Card className="mt-4 gap-0 p-6 shadow-[var(--shadow-card)]">
            <ul className="grid gap-4 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Correct outcome:</span> 3 points.
              </li>
              <li>
                <span className="font-semibold text-foreground">Exact score:</span> 5 points
                (replaces the outcome points).
              </li>
              <li>
                <span className="font-semibold text-foreground">Deadline:</span> predictions lock at
                each match kickoff.
              </li>
              <li>
                <span className="font-semibold text-foreground">Prize split:</span> top three
                finishers share the pool 60 / 30 / 10.
              </li>
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