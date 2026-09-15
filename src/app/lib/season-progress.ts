import type { Match, Pool } from "./mock-data";
import { getMatches, getMatchScores } from "./api/endpoints";

const MATCHDAY_TOTALS: Record<string, number> = {
  "premier league": 38,
  "english premier league": 38,
  epl: 38,
  "la liga": 38,
  "laliga": 38,
  "serie a": 38,
  "ligue 1": 34,
  "ligue1": 34,
  bundesliga: 34,
  "champions league": 8,
  "uefa champions league": 8,
  ucl: 8,
};

function normalizeCompetitionName(name: string): string {
  return (name ?? "").trim().toLowerCase().replace(/\s+/g, " ").replace(/'/g, "");
}

export function matchdayTotalFor(competitionName: string): number {
  return MATCHDAY_TOTALS[normalizeCompetitionName(competitionName)] ?? 38;
}

export function currentMatchdayFrom(matches: Match[]): number {
  let max = 0;
  for (const m of matches) {
    if (m.status === "upcoming") continue;
    const day = parseInt(m.matchday ?? "", 10);
    if (!isNaN(day) && day > max) max = day;
  }
  return max;
}

export function computeSeasonProgress(matches: Match[], competitionName: string): number {
  const current = currentMatchdayFrom(matches);
  const total = matchdayTotalFor(competitionName);
  if (current <= 0 || total <= 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

function isPlayed(m: Match): boolean {
  return m.status === "finished" || m.status === "live";
}

export async function applySeasonProgress(pools: Pool[]): Promise<Pool[]> {
  const byCompetition = new Map<string, Pool[]>();
  for (const pool of pools) {
    if (!pool.competitionId) continue;
    if (!byCompetition.has(pool.competitionId)) byCompetition.set(pool.competitionId, []);
    byCompetition.get(pool.competitionId)!.push(pool);
  }

  await Promise.all(
    [...byCompetition.entries()].map(async ([competitionId, compPools]) => {
      const played: Match[] = [];
      try {
        const [matches, scores] = await Promise.all([
          getMatches(competitionId).catch(() => [] as Match[]),
          getMatchScores(competitionId).catch(() => [] as Match[]),
        ]);

        const scoreById = new Map(scores.map((s) => [s.id, s] as const));
        for (const m of matches) {
          const s = scoreById.get(m.id);
          if (s && s.score) {
            played.push({
              ...m,
              status: "finished" as const,
              score: s.score,
              matchday: m.matchday || s.matchday,
            });
          } else if (isPlayed(m)) {
            played.push(m);
          }
        }

        for (const s of scores) {
          if (s.score || isPlayed(s)) played.push(s);
        }
      } catch {
        // leave progress as-is when matches are unavailable
      }

      for (const pool of compPools) {
        pool.progress = computeSeasonProgress(played, pool.competition);
      }
    }),
  );

  return pools;
}