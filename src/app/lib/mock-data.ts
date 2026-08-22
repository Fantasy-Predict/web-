export type Match = {
  id: string;
  competition: string;
  competitionName?: string;
  matchday?: string;
  home: string;
  away: string;
  homeShort: string;
  awayShort: string;
  homeCrest?: string;
  awayCrest?: string;
  kickoff: string;
  status: "upcoming" | "live" | "finished";
  score?: { home: number; away: number };
  prediction?: { outcome: string }[];
};

export type Pool = {
  id: string;
  name: string;
  competition: string;
  entryFee: number;
  players: number;
  maxPlayers: number;
  prizePool: number;
  privacy: "public" | "private";
  progress: number;
  rank?: number;
  type: "free" | "monetized";
  poolFor: "office" | "friends-family" | "open" | "media-blog" | "business" | "other";
  prizeType: "fun" | "prizes";
  introduction?: string;
  platformFeePercentage: number;
  createdBy?: string;
  isCreator?: boolean;
  inviteCode?: string;
};

export type LeaderboardRow = {
  id: string;
  username: string;
  country: string;
  total: number;
  weekly: number;
  movement: number;
};

export type Transaction = {
  id: string;
  type: string;
  amount: number;
  status: string;
  date: string;
};

export function formatNaira(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}₦${Math.abs(value).toLocaleString("en-NG")}`;
}
