export type Match = {
  id: string;
  competition: string;
  home: string;
  away: string;
  homeShort: string;
  awayShort: string;
  kickoff: string;
  status: "upcoming" | "live" | "finished";
  score?: { home: number; away: number };
};

export type League = {
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
  // New fields for pool creation
  poolFor: "office" | "friends-family" | "open" | "media-blog" | "business" | "other";
  prizeType: "fun" | "prizes";
  introduction?: string;
  platformFeePercentage: number; // 10 for monetized, 0 for free
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
  type: "Deposit" | "Withdrawal" | "Entry fee" | "Prize payout";
  amount: number;
  status: "successful" | "pending" | "failed";
  date: string;
};

export const matches: Match[] = [
  { id: "m1", competition: "Premier League", home: "Arsenal", away: "Chelsea", homeShort: "ARS", awayShort: "CHE", kickoff: "Sat 15:00", status: "upcoming" },
  { id: "m2", competition: "Premier League", home: "Liverpool", away: "Man City", homeShort: "LIV", awayShort: "MCI", kickoff: "Sat 17:30", status: "upcoming" },
  { id: "m3", competition: "Premier League", home: "Tottenham", away: "Newcastle", homeShort: "TOT", awayShort: "NEW", kickoff: "Sun 14:00", status: "upcoming" },
  { id: "m4", competition: "La Liga", home: "Real Madrid", away: "Sevilla", homeShort: "RMA", awayShort: "SEV", kickoff: "Sun 20:00", status: "upcoming" },
  { id: "m5", competition: "Premier League", home: "Aston Villa", away: "Brighton", homeShort: "AVL", awayShort: "BHA", kickoff: "Fri 20:00", status: "live", score: { home: 1, away: 1 } },
  { id: "m6", competition: "Serie A", home: "Inter", away: "Napoli", homeShort: "INT", awayShort: "NAP", kickoff: "Wed 19:45", status: "finished", score: { home: 2, away: 0 } },
];

export const leagues: League[] = [
  { 
    id: "l1", 
    name: "Premier Predictors", 
    competition: "Premier League", 
    entryFee: 5000, 
    players: 128, 
    maxPlayers: 200, 
    prizePool: 640000, 
    privacy: "public", 
    progress: 42, 
    rank: 12,
    type: "monetized",
    poolFor: "open",
    prizeType: "prizes",
    introduction: "The ultimate Premier League prediction challenge. Compete against the best!",
    platformFeePercentage: 10,
  },
  { 
    id: "l2", 
    name: "Office Rivals", 
    competition: "Premier League", 
    entryFee: 2000, 
    players: 18, 
    maxPlayers: 20, 
    prizePool: 36000, 
    privacy: "private", 
    progress: 42, 
    rank: 3,
    type: "monetized",
    poolFor: "office",
    prizeType: "prizes",
    introduction: "Our office prediction league – may the best analyst win!",
    platformFeePercentage: 10,
  },
  { 
    id: "l3", 
    name: "Continental Cup Room", 
    competition: "Champions League", 
    entryFee: 10000, 
    players: 64, 
    maxPlayers: 100, 
    prizePool: 640000, 
    privacy: "public", 
    progress: 25,
    type: "monetized",
    poolFor: "open",
    prizeType: "prizes",
    introduction: "The Champions League prediction room for serious fans.",
    platformFeePercentage: 10,
  },
  { 
    id: "l4", 
    name: "Weekend Warriors", 
    competition: "La Liga", 
    entryFee: 1000, 
    players: 240, 
    maxPlayers: 500, 
    prizePool: 240000, 
    privacy: "public", 
    progress: 60,
    type: "free",
    poolFor: "friends-family",
    prizeType: "fun",
    introduction: "Weekend La Liga predictions with friends – just for bragging rights!",
    platformFeePercentage: 0,
  },
];

export const leaderboard: LeaderboardRow[] = [
  { id: "u1", username: "adaokoye", country: "Nigeria", total: 1284, weekly: 96, movement: 2 },
  { id: "u2", username: "tundeb", country: "Nigeria", total: 1251, weekly: 88, movement: -1 },
  { id: "u3", username: "m.hassan", country: "Egypt", total: 1230, weekly: 104, movement: 3 },
  { id: "u4", username: "kwesi_a", country: "Ghana", total: 1198, weekly: 72, movement: 0 },
  { id: "u5", username: "sarah.k", country: "Kenya", total: 1176, weekly: 81, movement: 1 },
  { id: "u6", username: "olumide", country: "Nigeria", total: 1140, weekly: 65, movement: -2 },
  { id: "u7", username: "danielp", country: "South Africa", total: 1122, weekly: 70, movement: 4 },
  { id: "u8", username: "amaka.e", country: "Nigeria", total: 1098, weekly: 59, movement: -3 },
];

export const transactions: Transaction[] = [
  { id: "t1", type: "Deposit", amount: 20000, status: "successful", date: "12 Jul 2026" },
  { id: "t2", type: "Entry fee", amount: -5000, status: "successful", date: "12 Jul 2026" },
  { id: "t3", type: "Prize payout", amount: 32500, status: "successful", date: "05 Jul 2026" },
  { id: "t4", type: "Withdrawal", amount: -15000, status: "pending", date: "03 Jul 2026" },
  { id: "t5", type: "Deposit", amount: 10000, status: "failed", date: "28 Jun 2026" },
];

export const currentUser = {
  username: "adaokoye",
  country: "Nigeria",
  favouriteTeam: "Arsenal",
  balance: 42500,
  points: 1284,
  weeklyPoints: 96,
  winRate: 61,
  rank: 12,
};

export function formatNaira(value: number) {
  const sign = value < 0 ? "-" : "";
  return `${sign}₦${Math.abs(value).toLocaleString("en-NG")}`;
}