import { apiFetch } from "./client";
import { API_BASE_URL } from "./config";
import {
  type LeaderboardRow,
  type Pool,
  type Match,
  type Transaction,
} from "../mock-data";
export type { Pool } from "../mock-data";

// ============================================================
// Backend contract types (as exposed in the OpenAPI spec)
// ============================================================

export type RegisterPayload = {
  email: string;
  password: string;
  phoneNumber: string;
  username?: string;
  countryCode?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
};

export type LoginPayload = {
  to: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  userType?: "admin" | "user";
  verificationStatus?: boolean;
  user?: {
    id?: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    userType?: "admin" | "user";
  };
};

export type PredictionPayload = {
  match: string;
  competition: string;
  outcome: string;
  pool?: string;
};

export type WithdrawalPayload = {
  amount: number;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
};

export type Wallet = {
  balance: number;
  currency: string;
  totalDeposited?: number;
  totalWithdrawn?: number;
};

export type LeaderboardEntry = LeaderboardRow;

// ============================================================
// Users / Auth
// ============================================================

type AuthBody = {
  data?: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    _id?: string;
    userType?: "admin" | "user";
    verificationStatus?: boolean;
    refreshToken?: string;
  };
  meta?: { token?: string; refreshToken?: string };
  refreshToken?: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await apiFetch<AuthBody>("/v1/users/login", {
    method: "POST",
    body: payload,
    unwrap: false,
  });
  return {
    token: res?.meta?.token,
    verificationStatus: res?.data?.verificationStatus,
    userType: res?.data?.userType === "admin" ? "admin" : "user",
    user: res?.data,
  };
}

export async function adminLogin(payload: { email: string; password: string }): Promise<LoginResponse> {
  const res = await apiFetch<AuthBody>("/v1/admins/login", {
    method: "POST",
    body: payload,
    unwrap: false,
  });
  return {
    token: res?.meta?.token,
    userType: "admin",
    user: res?.data,
  };
}

export async function register(payload: RegisterPayload): Promise<{ success: boolean }> {
  return apiFetch("/v1/users", {
    method: "POST",
    body: payload,
  });
}

export async function verifyAccount(payload: { email: string; otp: string }): Promise<{ success: boolean }> {
  return apiFetch("/v1/users/verify-account", {
    method: "POST",
    body: payload,
  });
}

export async function resendCode(payload: { email: string }): Promise<{ success: boolean }> {
  return apiFetch("/v1/users/resend-code", {
    method: "POST",
    body: payload,
  });
}

export async function forgotPassword(payload: { email: string }): Promise<{ success: boolean }> {
  return apiFetch("/v1/users/forget-password", {
    method: "POST",
    body: payload,
  });
}

export async function resetPassword(payload: {
  email: string;
  otp: string;
  password: string;
}): Promise<{ success: boolean }> {
  return apiFetch("/v1/users/reset-password", {
    method: "POST",
    body: payload,
  });
}

export async function refreshToken(): Promise<void> {
  await apiFetch("/v1/users/refresh-token", {
    method: "POST",
    unwrap: false,
  });
}

export async function changePassword(payload: { oldPassword: string; password: string }): Promise<{ success: boolean }> {
  return apiFetch("/v1/users/change-password", {
    method: "PATCH",
    body: payload,
  });
}

export type UserProfile = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  countryCode?: string;
  isActive?: boolean;
  sendNotification?: boolean;
  dateOfBirth?: string;
  favouriteTeam?: string;
};

export async function getProfile(): Promise<UserProfile> {
  const res = await apiFetch<UserProfile | { data?: UserProfile }>("/v1/users/profile", {
    unwrap: false,
  });
  return (res as { data?: UserProfile })?.data ?? (res as UserProfile);
}

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  username?: string;
  gender?: string;
  phoneNumber?: string;
  avatar?: string;
  favouriteTeam?: string;
};

export async function updateProfile(payload: UpdateProfilePayload): Promise<void> {
  await apiFetch("/v1/users/profile", {
    method: "PUT",
    body: payload,
  });
}

export async function sendNotification(payload: {
  sendNotification: boolean;
}): Promise<{ success?: boolean; status?: boolean; message?: string }> {
  return apiFetch("/v1/users/send-notification", {
    method: "POST",
    body: { sendNotification: payload.sendNotification },
    unwrap: false,
  });
}

// ============================================================
// Matches / Predictions / Leaderboard
// ============================================================

type TeamObject = {
  name?: string;
  shortName?: string;
  crest?: string;
  score?: number | null;
  _id?: string;
};

function extractTeamName(
  team: string | TeamObject | undefined,
  fallback: string,
): string {
  if (typeof team === "string") return team;
  if (team && typeof team === "object") return team.name ?? team.shortName ?? fallback;
  return fallback;
}

function makeAbbreviation(name: string): string {
  const cleaned = name
    .replace(/ fc$/i, "")
    .replace(/ cf$/i, "")
    .replace(/ ac$/i, "")
    .replace(/ sc$/i, "")
    .replace(/ de /gi, " ")
    .replace(/ cf$/i, "")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  const articles = new Set(["de", "la", "el", "las", "los", "the", "of", "al"]);
  const meaningful = words.filter((w) => !articles.has(w.toLowerCase()));
  if (meaningful.length >= 2) return (meaningful[0].slice(0, 1) + meaningful[1].slice(0, 1) + (meaningful[2]?.slice(0, 1) ?? "")).toUpperCase();
  return cleaned.slice(0, 3).toUpperCase();
}

function extractTeamShort(
  team: string | TeamObject | undefined,
  fallback: string,
): string {
  if (typeof team === "string") return makeAbbreviation(team);
  if (team && typeof team === "object") {
    const source = team.shortName ?? team.name;
    if (source) return makeAbbreviation(source);
  }
  return fallback;
}

export async function getMatches(competition: string, date?: string): Promise<Match[]> {
  type MatchDoc = {
    _id?: string;
    id?: string;
    competition?: string | { name?: string; code?: string; _id?: string };
    league?: string;
    homeTeam?: string | TeamObject;
    home?: string;
    home_team?: string;
    awayTeam?: string | TeamObject;
    away?: string;
    away_team?: string;
    homeShort?: string;
    home_short?: string;
    awayShort?: string;
    away_short?: string;
    kickoff?: string;
    kickoffTime?: string;
    kickoff_time?: string;
    date?: string;
    matchDate?: string;
    status?: string;
    state?: string;
    score?: { home?: number; away?: number } | null;
    homeScore?: number;
    awayScore?: number;
    matchday?: string;
    stage?: string;
    matchId?: string;
    prediction?: unknown[];
  };

  let matchPath = `/v1/matches?competition=${encodeURIComponent(competition)}`;
  if (date) matchPath += `&date=${encodeURIComponent(date)}`;
  const res = await apiFetch<MatchDoc[] | { docs?: MatchDoc[] }>(matchPath, {

  });

  const list = Array.isArray(res) ? res : (res?.docs ?? []);

  return list.map((m) => ({
    id: m._id ?? m.id ?? "",
    competition:
      typeof m.competition === "object" && m.competition
        ? m.competition.name ?? ""
        : m.competition ?? "",
    matchday: m.matchday ?? "",
    home: extractTeamName(m.homeTeam ?? m.home ?? m.home_team, "Home"),
    away: extractTeamName(m.awayTeam ?? m.away ?? m.away_team, "Away"),
    homeShort: m.homeShort ?? m.home_short ?? extractTeamShort(m.homeTeam ?? m.home, "HOM"),
    awayShort: m.awayShort ?? m.away_short ?? extractTeamShort(m.awayTeam ?? m.away, "AWY"),
    homeCrest: (typeof m.homeTeam === "object" && m.homeTeam?.crest) || undefined,
    awayCrest: (typeof m.awayTeam === "object" && m.awayTeam?.crest) || undefined,
    kickoff: m.kickoff ?? m.kickoffTime ?? m.kickoff_time ?? m.date ?? m.matchDate ?? "",
    status: ((): Match["status"] => {
      const s = (m.status ?? m.state ?? "upcoming").toLowerCase();
      if (s === "live" || s === "in-play" || s === "in_play" || s === "1h" || s === "2h" || s === "ht") return "live";
      if (s === "finished" || s === "ft" || s === "complete" || s === "ended") return "finished";
      return "upcoming";
    })(),
    score: m.score
      ? { home: m.score.home ?? 0, away: m.score.away ?? 0 }
      : m.homeScore !== undefined
        ? { home: m.homeScore ?? 0, away: m.awayScore ?? 0 }
        : (typeof m.homeTeam === "object" && m.homeTeam && "score" in m.homeTeam && typeof m.awayTeam === "object" && m.awayTeam && "score" in m.awayTeam)
          ? { home: (m.homeTeam as any).score ?? 0, away: (m.awayTeam as any).score ?? 0 }
          : undefined,
    prediction: Array.isArray(m.prediction) ? m.prediction.map((p: any) => ({ outcome: p.outcome, point: p.point })) : undefined,
  }));
}

export async function getMatchScores(competition: string): Promise<Match[]> {
  type ScoreDoc = {
    _id?: string;
    id?: string;
    competition?: string | { name?: string; code?: string; _id?: string };
    homeTeam?: string | TeamObject;
    awayTeam?: string | TeamObject;
    home?: string;
    away?: string;
    home_team?: string;
    away_team?: string;
    homeShort?: string;
    home_short?: string;
    awayShort?: string;
    away_short?: string;
    kickoff?: string;
    kickoffTime?: string;
    kickoff_time?: string;
    date?: string;
    matchDate?: string;
    status?: string;
    state?: string;
    score?: { home?: number; away?: number } | null;
    homeScore?: number;
    awayScore?: number;
    matchday?: string;
    matchId?: string;
    prediction?: unknown[];
  };

  const res = await apiFetch<ScoreDoc[] | { docs?: ScoreDoc[] }>(
    `/v1/matches/score?competition=${encodeURIComponent(competition)}`,

  );

  const list = Array.isArray(res) ? res : (res?.docs ?? []);

  return list.map((m) => ({
    id: m._id ?? m.id ?? "",
    competition:
      typeof m.competition === "object" && m.competition
        ? m.competition.name ?? ""
        : m.competition ?? "",
    matchday: m.matchday ?? "",
    home: extractTeamName(m.homeTeam ?? m.home ?? m.home_team, "Home"),
    away: extractTeamName(m.awayTeam ?? m.away ?? m.away_team, "Away"),
    homeShort: m.homeShort ?? m.home_short ?? extractTeamShort(m.homeTeam ?? m.home, "HOM"),
    awayShort: m.awayShort ?? m.away_short ?? extractTeamShort(m.awayTeam ?? m.away, "AWY"),
    homeCrest: (typeof m.homeTeam === "object" && m.homeTeam?.crest) || undefined,
    awayCrest: (typeof m.awayTeam === "object" && m.awayTeam?.crest) || undefined,
    kickoff: m.kickoff ?? m.kickoffTime ?? m.kickoff_time ?? m.date ?? m.matchDate ?? "",
    status: ((): Match["status"] => {
      const s = (m.status ?? m.state ?? "upcoming").toLowerCase();
      if (s === "live" || s === "in-play" || s === "in_play" || s === "1h" || s === "2h" || s === "ht") return "live";
      if (s === "finished" || s === "ft" || s === "complete" || s === "ended") return "finished";
      return "upcoming";
    })(),
    score: m.score
      ? { home: m.score.home ?? 0, away: m.score.away ?? 0 }
      : m.homeScore !== undefined
        ? { home: m.homeScore ?? 0, away: m.awayScore ?? 0 }
        : (typeof m.homeTeam === "object" && m.homeTeam && "score" in m.homeTeam && typeof m.awayTeam === "object" && m.awayTeam && "score" in m.awayTeam)
          ? { home: (m.homeTeam as any).score ?? 0, away: (m.awayTeam as any).score ?? 0 }
          : undefined,
    prediction: Array.isArray((m as any).prediction) ? (m as any).prediction.map((p: any) => ({ outcome: p.outcome, point: p.point })) : undefined,
  }));
}

export async function createPrediction(payload: PredictionPayload): Promise<{ success: boolean }> {
  return apiFetch("/v1/predictions", {
    method: "POST",
    body: payload,

  });
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await apiFetch<
    Array<{
      _id?: string;
      id?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      email?: string;
      predictions?: { totalPoints?: number };
    }>
  >("/v1/predictions", {

  });
  return (res ?? []).map((row, index) => ({
    id: row._id ?? row.id ?? `row-${index}`,
    username:
      row.username || `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() || row.email || "Player",
    country: "",
    total: row.predictions?.totalPoints ?? 0,
    weekly: 0,
    movement: 0,
  }));
}

export type CompLeaderboardEntry = {
  userId: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  exact: number;
  close: number;
  slam: number;
  total: number;
  rank: number;
};

export type CompLeaderboardResponse = {
  board: CompLeaderboardEntry[];
  personalRank: CompLeaderboardEntry[];
};

export async function getCompLeaderboard(competition: string): Promise<CompLeaderboardResponse> {
  const res = await apiFetch<{
    data?: {
      board?: Array<{
        Cls?: number;
        Exact?: number;
        Slam?: number;
        Total?: number;
        rank?: number;
        user?: { _id?: string; firstName?: string; lastName?: string; username?: string; email?: string };
      }>;
      personalRank?: Array<{
        Cls?: number;
        Exact?: number;
        Slam?: number;
        Total?: number;
        rank?: number;
        user?: { _id?: string; firstName?: string; lastName?: string; username?: string; email?: string };
      }>;
    };
  }>(`/v1/predictions/comp-leaderboard?competition=${encodeURIComponent(competition)}`, {

    unwrap: false,
  });

  const mapEntry = (raw: NonNullable<NonNullable<NonNullable<typeof res>["data"]>["board"]>[number]): CompLeaderboardEntry => ({
    userId: raw.user?._id ?? "",
    firstName: raw.user?.firstName ?? "",
    lastName: raw.user?.lastName ?? "",
    username: raw.user?.username,
    email: raw.user?.email ?? "",
    exact: raw.Exact ?? 0,
    close: raw.Cls ?? 0,
    slam: raw.Slam ?? 0,
    total: raw.Total ?? 0,
    rank: raw.rank ?? 0,
  });

  return {
    board: (res?.data?.board ?? []).map(mapEntry),
    personalRank: (res?.data?.personalRank ?? []).map(mapEntry),
  };
}

// ============================================================
// Wallets / Payments / Withdrawals / Transactions
// ============================================================

function formatTxDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export async function getWallet(): Promise<Wallet> {
  const res = await apiFetch<{ wallet?: Wallet; balance?: number; currency?: string; totalDeposited?: number; totalWithdrawn?: number; data?: { wallet?: Wallet; balance?: number; currency?: string; totalDeposited?: number; totalWithdrawn?: number } }>("/v1/wallets", {
    unwrap: false,
  });
  const d = res?.data ?? res;
  const base = d?.wallet
    ? d.wallet
    : d?.balance !== undefined
      ? { balance: d.balance, currency: d.currency ?? "NGN" }
      : { balance: 0, currency: "NGN" };
  return {
    ...base,
    totalDeposited: d?.totalDeposited ?? (d?.wallet as any)?.totalDeposited ?? 0,
    totalWithdrawn: d?.totalWithdrawn ?? (d?.wallet as any)?.totalWithdrawn ?? 0,
  };
}

export function getPayUrl(email: string, amount: number): string {
  return `${API_BASE_URL}/v1/wallets/pay?email=${encodeURIComponent(email)}&amount=${amount}`;
}

export async function verifyPayment(payload: { reference?: string; transactionId?: string }): Promise<{ success: boolean }> {
  return apiFetch("/v1/wallets/verify-payment", {
    method: "POST",
    body: payload,

  });
}

type TransactionDoc = {
  _id?: string;
  id?: string;
  type?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  dateInitiated?: string;
  date?: string;
};

export async function getTransactions(): Promise<Transaction[]> {
  const res = await apiFetch<TransactionDoc[] | { docs?: TransactionDoc[] }>("/v1/transactions", {

  });
  const list = Array.isArray(res) ? res : (res?.docs ?? []);
  return list.map((tx) => ({
    id: tx._id ?? tx.id ?? "",
    type:
      tx.type === "debit" || tx.type === "Withdrawal"
        ? "Withdrawal"
        : tx.type === "credit" || tx.type === "Deposit"
          ? "Deposit"
          : tx.type ?? "Deposit",
    amount: tx.amount ?? 0,
    status:
      tx.status === "success" || tx.status === "completed" || tx.status === "successful"
        ? "successful"
        : tx.status === "pending"
          ? "pending"
          : "failed",
    date: formatTxDate(tx.createdAt ?? tx.dateInitiated ?? tx.date ?? ""),
  }));
}

export async function createWithdrawal(payload: WithdrawalPayload): Promise<{ success: boolean }> {
  return apiFetch("/v1/withdrawals", {
    method: "POST",
    body: payload,

  });
}

// ============================================================
// Competitions
// ============================================================

export type UserCompetition = {
  _id: string;
  name: string;
  code: string;
  type: string;
  default?: boolean;
};

export async function getUserCompetitions(): Promise<UserCompetition[]> {
  const res = await apiFetch<UserCompetition[] | { data?: UserCompetition[] | { docs?: UserCompetition[] }; docs?: UserCompetition[] }>("/v1/competitions", {

    unwrap: false,
  });
  if (Array.isArray(res)) return res;
  const data = (res as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as UserCompetition[];
  if (data && typeof data === "object" && "docs" in data) return (data as { docs?: UserCompetition[] }).docs ?? [];
  return (res as { docs?: UserCompetition[] })?.docs ?? [];
}

// ============================================================
// Pools
// ============================================================

export type PoolConfig = {
  amount?: number;
  paid?: boolean;
  code?: string;
  poolSharing?: string;
};

export type PoolDoc = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  privacy?: string;
  competition?: string | { _id?: string; name?: string; code?: string };
  icon?: string;
  config?: PoolConfig;
  members?: unknown[] | { length?: number };
  totalMembers?: number;
  maxMembers?: number;
  createdBy?: string | { _id?: string; firstName?: string; lastName?: string; username?: string };
  isCreator?: boolean;
  isActive?: boolean;
  code?: string;
};

export function normalizePool(pool: PoolDoc | Pool, opts?: { mine?: boolean }): Pool {
  if ("players" in pool && "type" in pool && pool.name) {
    return pool as unknown as Pool;
  }
  const p = pool as PoolDoc;
  const competition =
    typeof p.competition === "object" && p.competition
      ? p.competition.name ?? p.competition.code ?? ""
      : (p.competition ?? "");
  const competitionId =
    typeof p.competition === "object" && p.competition
      ? p.competition._id
      : undefined;
  const isPaid = p.config?.paid === true;
  const players = p.totalMembers ?? (Array.isArray(p.members)
    ? p.members.length
    : typeof p.members === "object" && p.members
      ? ((p.members as { length?: number }).length ?? 0)
      : 0);
  const entryFee = p.config?.amount ?? 0;
  const creatorId =
    typeof p.createdBy === "object" && p.createdBy
      ? p.createdBy._id
      : typeof p.createdBy === "string"
        ? p.createdBy
        : undefined;

  return {
    id: p._id ?? p.id ?? "",
    name: p.name ?? p.title ?? "Untitled pool",
    competition,
    competitionId,
    entryFee,
    players,
    maxPlayers: p.maxMembers ?? players,
    prizePool: isPaid ? Math.round(entryFee * players * 0.9) : 0,
    privacy: p.privacy === "public" ? "public" : "private",
    progress: 0,
    rank: opts?.mine ? 1 : undefined,
    type: isPaid ? "monetized" : "free",
    poolFor: "open",
    prizeType: isPaid ? "prizes" : "fun",
    introduction: p.description,
    platformFeePercentage: isPaid ? 10 : 0,
    createdBy: creatorId,
    isCreator: p.isCreator,
    inviteCode: p.config?.code,
  };
}

type PaginatedResponse<T> = {
  docs?: T[];
  totalDocs?: number;
  totalPages?: number;
  limit?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  hasMore?: boolean;
};

export async function getMyPools(): Promise<Pool[]> {
  const res = await apiFetch<{ data?: PaginatedResponse<PoolDoc> } | PaginatedResponse<PoolDoc>>(`/v1/pools/mine`, {

    unwrap: false,
  });
  const list = (res as { data?: PaginatedResponse<PoolDoc> })?.data?.docs
    ?? (res as PaginatedResponse<PoolDoc>)?.docs
    ?? [];
  return list.map((pool) => normalizePool(pool));
}

export async function getPools(
  options: { page?: number; name?: string; privacy?: string; personal?: boolean } = {},
): Promise<Pool[]> {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 1));
  if (options.name) params.set("name", options.name);
  if (options.privacy) params.set("privacy", options.privacy);
  if (options.personal) params.set("personal", "true");
  const qs = params.toString();
  const res = await apiFetch<{ data?: PaginatedResponse<PoolDoc> } | PaginatedResponse<PoolDoc> | PoolDoc[]>(`/v1/pools?${qs}`, {

    unwrap: false,
  });
  const list = Array.isArray(res) ? res
    : (res as { data?: PaginatedResponse<PoolDoc> })?.data?.docs
    ?? (res as PaginatedResponse<PoolDoc>)?.docs
    ?? (res as { data?: PoolDoc[] })?.data
    ?? (res as { pools?: PoolDoc[] })?.pools
    ?? [];
  return list.map((pool) => normalizePool(pool));
}

export async function getPool(id: string): Promise<Pool> {
  const res = await apiFetch<PoolDoc | Pool | { data?: PoolDoc | Pool }>(`/v1/pools/${id}`, {

    unwrap: false,
  });
  const d = (res as { data?: PoolDoc | Pool })?.data ?? res;
  return normalizePool(d as PoolDoc | Pool, { mine: true });
}

export type CreatePoolPayload = {
  name: string;
  description?: string;
  privacy?: string;
  competition?: string;
  maxMembers?: number;
  config: { amount: number; paid: boolean };
};

export async function createPool(payload: CreatePoolPayload): Promise<{ _id?: string; id?: string }> {
  return apiFetch("/v1/pools", {
    method: "POST",
    body: payload,

  });
}

export async function joinPool(payload: {
  poolId: string;
  code?: string;
}): Promise<{ success?: boolean }> {
  return apiFetch("/v1/pool-members", {
    method: "POST",
    body: payload,

  });
}

export async function getPoolByCode(code: string): Promise<Pool> {
  const data = await apiFetch<PoolDoc>(`/v1/pools/by-code/${encodeURIComponent(code)}`, {

  });
  return normalizePool(data);
}

export async function joinPoolByCode(code: string): Promise<{ success?: boolean; poolId?: string }> {
  const pool = await getPoolByCode(code);
  if (!pool.id) throw new Error("Invalid invite code");
  await joinPool({ poolId: pool.id, code });
  return { success: true, poolId: pool.id };
}

export type PoolMember = {
  _id?: string;
  user?: { _id?: string; firstName?: string; lastName?: string; email?: string };
  userId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  points?: number;
  position?: number;
  status?: "pending" | "approved" | "declined";
  type?: string;
  gameWeeksParticipated?: unknown[];
  totalAmountSpent?: number;
  poolId?: string;
  createdAt?: string;
};

export async function getPoolMembers(poolId: string): Promise<PoolMember[]> {
  const res = await apiFetch<{ data?: { docs?: PoolMember[] } } | PoolMember[]>(
    `/v1/pool-members?poolId=${encodeURIComponent(poolId)}`,
    {
  
      unwrap: false,
    },
  );
  const list = Array.isArray(res) ? res : res?.data?.docs ?? [];
  return list.map((m) => ({
    ...m,
    userId: m.user?._id ?? m.userId,
    firstName: m.user?.firstName ?? m.firstName,
    lastName: m.user?.lastName ?? m.lastName,
    username: m.user
      ? `${m.user.firstName ?? ""} ${m.user.lastName ?? ""}`.trim() || m.username
      : m.username,
  }));
}

export async function updatePoolMemberStatus(
  memberId: string,
  poolId: string,
  status: "pending" | "approved" | "declined",
): Promise<{ success?: boolean }> {
  return apiFetch(`/v1/pool-members/${memberId}`, {
    method: "PATCH",
    body: { poolId, status },

    unwrap: false,
  });
}

export async function getPoolLeaderboard(): Promise<LeaderboardEntry[]> {
  return apiFetch("/v1/pools/leadboard/pool", {

  });
}

// ============================================================
// Transaction PIN
// ============================================================

export async function getPin(): Promise<{ hasPin: boolean }> {
  return apiFetch("/v1/pins", {
    method: "GET",
    unwrap: false,

  });
}

export async function setPin(payload: { pin: string }): Promise<{ success?: boolean; status?: boolean; message?: string }> {
  return apiFetch("/v1/pins", {
    method: "POST",
    body: { pin: payload.pin, code: payload.pin },
    unwrap: false,

  });
}

// ============================================================
// Banks
// ============================================================

export type Bank = {
  name: string;
  code: string;
};

export type BankAccount = {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
};

export async function getBanks(): Promise<Bank[]> {
  const res = await apiFetch<Bank[] | { data?: Bank[]; docs?: Bank[] }>("/v1/banks", {

    unwrap: false,
  });
  if (Array.isArray(res)) return res;
  const d = (res as { data?: unknown })?.data;
  if (Array.isArray(d)) return d;
  return res?.docs ?? [];
}

export async function getBankAccount(): Promise<BankAccount | null> {
  const res = await apiFetch<{ account?: BankAccount; data?: { account?: BankAccount } }>("/v1/banks/account", {

    unwrap: false,
  });
  return res?.account ?? res?.data?.account ?? null;
}

export async function verifyBankAccount(payload: {
  bankCode: string;
  accountNumber: string;
}): Promise<{ accountName?: string; account_name?: string }> {
  const res = await apiFetch<{
    data?: {
      accountName?: string;
      account_name?: string;
      account_number?: string;
      bank_id?: number;
    };
    accountName?: string;
    account_name?: string;
    account_number?: string;
    bank_id?: number;
  }>("/v1/banks/verify-account", {
    method: "POST",
    body: payload,

    unwrap: false,
  });
  const d = res?.data ?? res;
  return {
    accountName: d?.accountName ?? d?.account_name,
    account_name: d?.account_name ?? d?.accountName,
  };
}

// ============================================================
// Feedback
// ============================================================

export type FeedbackPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function submitFeedback(payload: FeedbackPayload): Promise<{ success?: boolean }> {
  return apiFetch("/v1/feedbacks", {
    method: "POST",
    body: payload,
    unwrap: false,
  });
}

// ============================================================
// Notifications
// ============================================================

export type BackendNotification = {
  _id: string;
  title: string;
  body: string;
  type: "prediction" | "pool" | "payment" | "system";
  read: boolean;
  createdAt: string;
};

export async function getNotifications(): Promise<BackendNotification[]> {
  const res = await apiFetch<{ docs?: BackendNotification[] } | BackendNotification[]>("/v1/notifications");
  return Array.isArray(res) ? res : (res?.docs ?? []);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch("/v1/notifications/read-all", { method: "PATCH" });
}

export async function clearNotifications(): Promise<void> {
  await apiFetch("/v1/notifications", { method: "DELETE" });
}

export type FeaturedMatch = {
  _id: string;
  homeTeam: { name: string; shortName: string; crest: string };
  awayTeam: { name: string; shortName: string; crest: string };
  date: string;
  stage: string;
  matchday: string;
  competitionName: string;
  competitionCode: string;
};

export async function getFeaturedMatch(): Promise<FeaturedMatch | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/matches/featured`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ============================================================
// FPL — Fantasy Premier League
// ============================================================

export type FplTeam = {
  _id: string;
  teamName: string;
  budget: number;
  squadValue: number;
  totalPoints: number;
  gwPoints: number;
  overallRank: number | null;
  season: string;
  freeTransfers: number;
  players: number[];
  fplImportId?: number;
  chipUsed: {
    wildcard1: boolean;
    wildcard2: boolean;
    tripleCaptain: boolean;
    benchBoost: boolean;
    freeHit: boolean;
  };
  playerDetails: FplPlayer[];
};

export type FplPlayer = {
  _id: string;
  fplId: number;
  name: string;
  clubName: string;
  clubShort: string;
  position: number; // 1=GK 2=DEF 3=MID 4=FWD
  price: number;    // tenths of millions (65 = £6.5m)
  totalPoints: number;
  currentGwPoints: number;
  status: string;
  form: string;
  ownership: number;
};

export type FplGameweek = {
  _id: string;
  fplId: number;
  name: string;
  deadline: string;
  isCurrent: boolean;
  isNext: boolean;
  isFinished: boolean;
  averageScore: number;
  highestScore: number;
};

export type FplPickPlayer = {
  fplId: number;
  squadPosition: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
};

export type FplPick = {
  _id: string;
  gwId: number;
  players: FplPickPlayer[];
  chip: "wildcard" | "triple_captain" | "bench_boost" | "free_hit" | null;
  gwPoints: number | null;
  isConfirmed: boolean;
};

export type FplLeague = {
  _id: string;
  name: string;
  code: string;
  type: "classic" | "h2h";
  status: "active" | "draft";
  adminId: string;
  memberCount: number;
};

export type FplLeagueMember = {
  _id: string;
  teamName: string;
  totalPoints: number;
  gwPoints: number;
  currentRank: number;
  previousRank: number | null;
  h2hPoints?: number;
};

export type FplH2HResult = {
  _id: string;
  gwId: number;
  teamName1: string;
  points1: number;
  teamName2: string;
  points2: number;
  winnerId: string | null;
};

export type FplFixture = {
  id: number;
  gwId: number;
  homeTeam: string;
  homeTeamShort: string;
  awayTeam: string;
  awayTeamShort: string;
  kickoffTime: string;
  started: boolean;
  finished: boolean;
  homeScore: number | null;
  awayScore: number | null;
};

export type FplPlayersResponse = {
  docs: FplPlayer[];
  totalDocs: number;
  totalPages: number;
  page: number;
};

// --- FPL Team ---

export async function getFplTeam(): Promise<FplTeam | null> {
  try {
    const res = await apiFetch<FplTeam | { data?: FplTeam }>("/v1/fpl/team", { unwrap: false });
    return (res as { data?: FplTeam })?.data ?? (res as FplTeam) ?? null;
  } catch {
    return null;
  }
}

export async function createFplTeam(payload: { teamName: string; players: number[] }): Promise<{ success: boolean }> {
  return apiFetch("/v1/fpl/team", { method: "POST", body: payload });
}

export async function importFplTeam(payload: { teamName: string; fplImportId: number }): Promise<{ success: boolean }> {
  return apiFetch("/v1/fpl/team/import", { method: "POST", body: payload });
}

export async function updateFplTeam(payload: { teamName?: string; chip?: string }): Promise<{ success: boolean }> {
  return apiFetch("/v1/fpl/team", { method: "PUT", body: payload });
}

export async function getFplTeamHistory(): Promise<Array<{ gwId: number; points: number; totalPoints: number; rank: number }>> {
  const res = await apiFetch<
    Array<{ gwId: number; points: number; totalPoints: number; rank: number }> |
    { data?: Array<{ gwId: number; points: number; totalPoints: number; rank: number }> }
  >("/v1/fpl/team/history", { unwrap: false });
  if (Array.isArray(res)) return res;
  return (res as { data?: Array<{ gwId: number; points: number; totalPoints: number; rank: number }> })?.data ?? [];
}

// --- FPL Data ---

export async function getFplGameweeks(): Promise<FplGameweek[]> {
  const res = await apiFetch<FplGameweek[] | { data?: FplGameweek[] }>("/v1/fpl/gameweeks", { unwrap: false });
  if (Array.isArray(res)) return res;
  return (res as { data?: FplGameweek[] })?.data ?? [];
}

export async function getFplCurrentGameweek(): Promise<FplGameweek | null> {
  try {
    const res = await apiFetch<FplGameweek | { data?: FplGameweek }>("/v1/fpl/gameweeks/current", { unwrap: false });
    return (res as { data?: FplGameweek })?.data ?? (res as FplGameweek) ?? null;
  } catch {
    return null;
  }
}

export async function getFplPlayers(params: { page?: number; position?: number; search?: string; sortBy?: string } = {}): Promise<FplPlayersResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.position) qs.set("position", String(params.position));
  if (params.search) qs.set("search", params.search);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  const query = qs.toString();
  const res = await apiFetch<FplPlayersResponse | { data?: FplPlayersResponse }>(
    `/v1/fpl/players${query ? "?" + query : ""}`,
    { unwrap: false },
  );
  const d = (res as { data?: FplPlayersResponse })?.data ?? (res as FplPlayersResponse);
  return { docs: d?.docs ?? [], totalDocs: d?.totalDocs ?? 0, totalPages: d?.totalPages ?? 1, page: d?.page ?? 1 };
}

export async function getFplFixtures(gwId: number): Promise<FplFixture[]> {
  const res = await apiFetch<FplFixture[] | { data?: FplFixture[] }>(`/v1/fpl/fixtures/${gwId}`, { unwrap: false });
  if (Array.isArray(res)) return res;
  return (res as { data?: FplFixture[] })?.data ?? [];
}

// --- FPL Picks ---

export async function getFplPicks(gwId: number): Promise<FplPick | null> {
  try {
    const res = await apiFetch<FplPick | { data?: FplPick }>(`/v1/fpl/picks/${gwId}`, { unwrap: false });
    return (res as { data?: FplPick })?.data ?? (res as FplPick) ?? null;
  } catch {
    return null;
  }
}

export async function saveFplPicks(payload: { gwId: number; players: FplPickPlayer[]; chip?: string | null }): Promise<{ success: boolean }> {
  return apiFetch("/v1/fpl/picks", { method: "POST", body: payload });
}

// --- FPL Transfers ---

export async function makeFplTransfer(payload: { transfers: Array<{ playerInId: number; playerOutId: number }> }): Promise<{ success: boolean; cost: number }> {
  return apiFetch("/v1/fpl/transfers", { method: "POST", body: payload });
}

// --- FPL Leagues ---

export async function createFplLeague(payload: { name: string; type: "classic" | "h2h" }): Promise<{ _id: string; code: string }> {
  return apiFetch("/v1/fpl/leagues", { method: "POST", body: payload });
}

export async function joinFplLeague(payload: { code: string }): Promise<{ success: boolean }> {
  return apiFetch("/v1/fpl/leagues/join", { method: "POST", body: payload });
}

export async function getMyFplLeagues(): Promise<FplLeague[]> {
  const res = await apiFetch<FplLeague[] | { data?: FplLeague[] }>("/v1/fpl/leagues/mine", { unwrap: false });
  if (Array.isArray(res)) return res;
  return (res as { data?: FplLeague[] })?.data ?? [];
}

export async function getFplLeagueStandings(leagueId: string): Promise<{ league: FplLeague; members: FplLeagueMember[] }> {
  const res = await apiFetch<
    { league?: FplLeague; members?: FplLeagueMember[] } |
    { data?: { league?: FplLeague; members?: FplLeagueMember[] } }
  >(`/v1/fpl/leagues/${leagueId}`, { unwrap: false });
  const d = (res as { data?: { league?: FplLeague; members?: FplLeagueMember[] } })?.data ?? res;
  return {
    league: (d as { league?: FplLeague })?.league as FplLeague,
    members: (d as { members?: FplLeagueMember[] })?.members ?? [],
  };
}

export async function getFplH2HResults(leagueId: string, gwId?: number): Promise<FplH2HResult[]> {
  const qs = gwId ? `?gwId=${gwId}` : "";
  const res = await apiFetch<FplH2HResult[] | { data?: FplH2HResult[] }>(`/v1/fpl/leagues/${leagueId}/h2h${qs}`, { unwrap: false });
  if (Array.isArray(res)) return res;
  return (res as { data?: FplH2HResult[] })?.data ?? [];
}
