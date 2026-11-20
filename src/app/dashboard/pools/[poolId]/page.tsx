"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { StatCard } from "../../../../components/app/card";
import { Sheet, SheetContent, SheetTitle } from "../../../../components/ui/sheet";
import { formatNaira, type Pool } from "../../../lib/mock-data";
import { getPool, getPoolMembers, getProfile, joinPool, updatePoolMemberStatus, getCompLeaderboard, getUserCompetitions, getPoolChallenges, sendPoolChallenge, respondToPoolChallenge, leavePool, removePoolMember, closePool, type PoolMember, type CompLeaderboardEntry, type PoolChallenge } from "../../../lib/api/endpoints";
import { applySeasonProgress } from "../../../lib/season-progress";
import { notifyPool } from "../../../lib/notifications";
import { InviteButton } from "./invite-button";
import { cn } from "../../../lib/utils";

const poolForLabels: Record<string, string> = {
  office: "Office pool",
  "friends-family": "Friends / family",
  open: "Open pool - anyone is welcome!",
  "media-blog": "Media / blog",
  business: "Business / competition",
  other: "Other",
};

export default function PoolDetailPage() {
  const params = useParams<{ poolId: string }>();
  const router = useRouter();
  const poolId = params.poolId;

  const [pool, setPool] = useState<Pool | null>(null);
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<CompLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [actingMemberId, setActingMemberId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "h2h">("members");
  const [challenges, setChallenges] = useState<PoolChallenge[] | null>(null);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [challengeSheetOpen, setChallengeSheetOpen] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<PoolMember | null>(null);
  const [challengeWager, setChallengeWager] = useState("");
  const [challengeDuration, setChallengeDuration] = useState<7 | 14 | 21 | 30>(7);
  const [challengeSending, setChallengeSending] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const isPrivatePool = pool?.privacy === "private";
  const isPoolCreator = pool?.isCreator === true;
  const showApproveDecline = isPrivatePool && isPoolCreator;

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [poolData, poolMembers, profile] = await Promise.all([
          getPool(poolId),
          getPoolMembers(poolId),
          getProfile().catch(() => null),
        ]);
        if (!active) return;
        if (poolData) await applySeasonProgress([poolData]).catch(() => {});
        if (!active) return;
        setPool(poolData ?? null);
        setMembers(poolMembers ?? []);
        setCurrentUserId(profile?._id ?? null);

        let compId = poolData?.competitionId;
        if (!compId) {
          try {
            const comps = await getUserCompetitions();
            const defaultComp = comps.find((c) => c.name === "Premier League" || c.code === "PL") ?? comps.find((c) => c.default) ?? comps[0];
            if (defaultComp) compId = defaultComp._id;
          } catch {
            // ignore
          }
        }
        if (compId) {
          try {
            const lb = await getCompLeaderboard(compId);
            if (active) setLeaderboard(lb.board ?? []);
          } catch {
            // leaderboard fetch failed silently
          }
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load this pool");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [poolId]);

  async function handleJoin() {
    if (!pool) return;
    setJoining(true);
    try {
      await joinPool({ poolId: pool.id });
      setJoined(true);
      toast.success(`Joined ${pool.name}`);
      notifyPool("Pool joined", `You joined "${pool.name}". Start making predictions to earn points!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to join this pool");
    } finally {
      setJoining(false);
    }
  }

  async function handleMemberStatus(memberId: string, status: "approved" | "declined") {
    if (!pool) return;
    setActingMemberId(memberId);
    try {
      await updatePoolMemberStatus(memberId, pool.id, status);
      toast.success(`Member ${status}`);
      const updated = await getPoolMembers(poolId);
      setMembers(updated ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update member");
    } finally {
      setActingMemberId(null);
    }
  }

  function openH2HTab() {
    setActiveTab("h2h");
    if (challenges === null && !challengesLoading) {
      setChallengesLoading(true);
      getPoolChallenges(poolId)
        .then(setChallenges)
        .catch(() => setChallenges([]))
        .finally(() => setChallengesLoading(false));
    }
  }

  function openChallengeSheet(member: PoolMember) {
    setChallengeTarget(member);
    setChallengeWager("");
    setChallengeDuration(7);
    setChallengeSheetOpen(true);
  }

  async function handleSendChallenge() {
    if (!challengeTarget || !challengeWager) return;
    const wagerNum = Number(challengeWager);
    if (!wagerNum || wagerNum <= 0) {
      toast.error("Enter a valid wager amount");
      return;
    }
    setChallengeSending(true);
    try {
      await sendPoolChallenge(poolId, challengeTarget.userId ?? challengeTarget.user?._id ?? "", wagerNum, challengeDuration);
      toast.success("Challenge sent!");
      setChallengeSheetOpen(false);
      // Refresh challenges list
      const updated = await getPoolChallenges(poolId);
      setChallenges(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send challenge");
    } finally {
      setChallengeSending(false);
    }
  }

  async function handleRespond(challengeId: string, action: "accepted" | "declined") {
    setRespondingId(challengeId);
    try {
      await respondToPoolChallenge(challengeId, action);
      toast.success(action === "accepted" ? "Challenge accepted!" : "Challenge declined");
      const updated = await getPoolChallenges(poolId);
      setChallenges(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to respond");
    } finally {
      setRespondingId(null);
    }
  }

  async function handleLeavePool() {
    setLeaving(true);
    try {
      await leavePool(poolId);
      toast.success("You have left the pool");
      router.push("/dashboard/pools");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to leave pool");
    } finally {
      setLeaving(false);
      setConfirmLeave(false);
    }
  }

  async function handleClosePool() {
    if (!pool) return;
    setClosing(true);
    try {
      await closePool(poolId);
      toast.success(
        pool.type === "monetized"
          ? "Pool closed — entry fees refunded to members"
          : "Pool closed"
      );
      router.push("/dashboard/pools");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to close pool");
    } finally {
      setClosing(false);
      setConfirmClose(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    setRemovingMemberId(memberId);
    try {
      await removePoolMember(poolId, memberId);
      toast.success("Member removed from pool");
      const updated = await getPoolMembers(poolId);
      setMembers(updated ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setRemovingMemberId(null);
      setConfirmRemoveId(null);
    }
  }

  if (loading) {
    return (
      <AppShell title="Loading…" description="Fetching pool details.">
        <p className="text-sm text-muted-foreground">Loading pool details…</p>
      </AppShell>
    );
  }

  if (!pool) {
    return (
      <AppShell title="Pool unavailable" description="This pool could not be found.">
        <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
          <p className="text-sm text-muted-foreground">This pool may have been removed.</p>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard/pools")}>
            Back to pools
          </Button>
        </Card>
      </AppShell>
    );
  }

  const isFree = pool.type === "free";
  const isMonetized = pool.type === "monetized";
  const hasPrize = pool.prizeType === "prizes";
  const isMember = currentUserId
    ? members.some((m) => m.userId === currentUserId || m.user?._id === currentUserId)
    : false;
  const isJoined = joined || isPoolCreator || isMember;

  const totalPot = pool.entryFee * pool.maxPlayers;
  const platformFee = isMonetized ? Math.round(totalPot * 0.1) : 0;
  const prizePoolAfterFee = isMonetized ? totalPot - platformFee : 0;

  function lookupLeaderboard(member: PoolMember): CompLeaderboardEntry | undefined {
    const uid = member.userId || member.user?._id;
    return leaderboard.find((e) => e.userId === uid);
  }

  const sortedMembers = [...members].sort((a, b) => {
    const aLb = lookupLeaderboard(a);
    const bLb = lookupLeaderboard(b);
    const aPoints = aLb?.total ?? a.points ?? -1;
    const bPoints = bLb?.total ?? b.points ?? -1;
    return bPoints - aPoints;
  });

  return (
    <AppShell
      title={pool.name}
      description={`${pool.competition} · ${pool.privacy === "private" ? "Private pool" : "Public pool"}`}
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
          <InviteButton poolId={pool.id} inviteCode={pool.inviteCode} />
          {isJoined && !isPoolCreator && (
            confirmLeave ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Leave pool?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 px-3 text-xs"
                  disabled={leaving}
                  onClick={handleLeavePool}
                >
                  {leaving ? "Leaving…" : "Yes, leave"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => setConfirmLeave(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmLeave(true)}
              >
                Leave pool
              </Button>
            )
          )}
          {isPoolCreator && !pool.settled && (
            confirmClose ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  {isMonetized ? "Close & refund?" : "Close pool?"}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 px-3 text-xs"
                  disabled={closing}
                  onClick={handleClosePool}
                >
                  {closing ? "Closing…" : "Yes, close"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => setConfirmClose(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmClose(true)}
              >
                Close pool
              </Button>
            )
          )}
          {isJoined ? (
            <Button asChild>
              <Link href={`/dashboard/predict?pool=${pool.id}`}>Make predictions</Link>
            </Button>
          ) : (
            <Button onClick={handleJoin} disabled={joining}>
              {joining ? "Joining…" : isFree ? "Join Free" : `Join for ${formatNaira(pool.entryFee)}`}
            </Button>
          )}
        </div>
      }
    >
      {/* Stats Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Prize pool" value={isFree ? "—" : formatNaira(pool.prizePool)} accent="gold" />
        <StatCard label="Entry fee" value={isFree ? "Free" : formatNaira(pool.entryFee)} />
        <StatCard label="Participants" value={`${pool.players}/${pool.maxPlayers}`} />
        <StatCard label="Season progress" value={`${pool.progress}%`} accent="primary" />
      </div>

      {/* Pool Details Section */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Pool Details
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Who is this pool for?</p>
              <p className="text-sm font-medium">{poolForLabels[pool.poolFor] || pool.poolFor}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Anything to win?</p>
              <p className="text-sm font-medium">{hasPrize ? "There are prizes 🏆" : "For fun only"}</p>
            </div>
            {pool.introduction && (
              <div>
                <p className="text-xs text-muted-foreground">Introduction</p>
                <p className="text-sm font-medium leading-relaxed">{pool.introduction}</p>
              </div>
            )}
          </div>
        </Card>

        {isMonetized && (
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)] border-gold/20">
            <h3 className="text-sm font-semibold text-gold uppercase tracking-wider">Fee Breakdown</h3>
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
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatNaira(prizePoolAfterFee)}
                </span>
              </div>
              {pool.prizeDistribution && pool.prizeDistribution.length > 0 ? (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Distribution:</p>
                  {pool.prizeDistribution.map((d) => (
                    <div key={d.position} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {["1st", "2nd", "3rd", "4th", "5th"][d.position - 1] ?? `#${d.position}`} place
                      </span>
                      <span className="font-medium">
                        {d.percentage}% · {formatNaira(Math.round((prizePoolAfterFee * d.percentage) / 100))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  The prize pool is distributed among winners based on the pool&apos;s prize distribution rules.
                </p>
              )}
            </div>
          </Card>
        )}

        {isFree && (
          <Card className="gap-0 p-5 shadow-[var(--shadow-card)] border-green-500/20">
            <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
              Free Pool
            </h3>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                This is a free pool with no entry fees. Perfect for playing with friends!
              </p>
              <p className="text-xs text-muted-foreground">Prize pool: Bragging rights only</p>
            </div>
          </Card>
        )}
      </div>

      {/* Members + Rules Section */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 w-fit">
            <button
              onClick={() => setActiveTab("members")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === "members" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Members
            </button>
            {isJoined && (
              <button
                onClick={openH2HTab}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === "h2h" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Challenges
              </button>
            )}
          </div>

          {/* Members Tab */}
          {activeTab === "members" && (
          <Card className="mt-4 gap-0 overflow-hidden p-0 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-[2.8rem_minmax(0,1fr)_auto] gap-3 border-b border-border px-5 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              <span>Rank</span>
              <span>Member</span>
              <span className="text-right">Points</span>
            </div>
            {sortedMembers.length ? (
              sortedMembers.map((member, index) => {
                const displayName = member.username || `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || "Member";
                const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                const lbEntry = lookupLeaderboard(member);
                const pts = lbEntry?.total ?? member.points;
                const rank = lbEntry?.rank ?? (index + 1);
                const isTop1 = rank === 1;
                const isTop3 = rank <= 3;
                return (
                <div
                  key={member._id ?? index}
                  className={cn(
                    "grid grid-cols-[2.8rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-4 last:border-0",
                    isTop1 && "bg-gold/5",
                  )}
                >
                  <div className="flex items-center justify-center">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                        isTop1 && "bg-gold text-navy",
                        !isTop1 && "bg-muted text-muted-foreground",
                      )}
                    >
                      {rank}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className={cn(
                        "text-[10px] font-semibold",
                        isTop1 ? "bg-gold text-navy" : "bg-muted text-muted-foreground",
                      )}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className={cn("truncate text-sm font-medium", isTop1 && "font-semibold")}>{displayName}</p>
                      {member.status === "pending" && (
                        <p className="truncate text-xs text-amber-600 dark:text-amber-400">Pending approval</p>
                      )}
                      {lbEntry && (
                        <p className="truncate text-[10px] text-muted-foreground">
                          {lbEntry.exact > 0 && <span className="text-green-600 dark:text-green-400">{lbEntry.exact} exact</span>}
                          {lbEntry.exact > 0 && lbEntry.close > 0 && <span> · </span>}
                          {lbEntry.close > 0 && <span className="text-blue-600 dark:text-blue-400">{lbEntry.close} close</span>}
                          {lbEntry.close > 0 && lbEntry.slam > 0 && <span> · </span>}
                          {lbEntry.slam > 0 && <span className="text-gold">{lbEntry.slam} outcome</span>}
                          {lbEntry.exact === 0 && lbEntry.close === 0 && lbEntry.slam === 0 && <span>No points yet</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={cn(
                        "num font-display text-lg font-bold",
                        isTop1 ? "text-gold" : "text-foreground",
                      )}>
                        {typeof pts === "number" ? pts.toLocaleString() : "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">pts</p>
                    </div>
                    {showApproveDecline && member.status === "pending" && (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs text-green-600 border-green-500/30 hover:bg-green-500/10"
                          disabled={actingMemberId === member._id}
                          onClick={() => handleMemberStatus(member._id!, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
                          disabled={actingMemberId === member._id}
                          onClick={() => handleMemberStatus(member._id!, "declined")}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                    {isJoined && member.userId !== currentUserId && member.user?._id !== currentUserId && member.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => openChallengeSheet(member)}
                      >
                        Challenge
                      </Button>
                    )}
                    {isPoolCreator && member.userId !== currentUserId && member.user?._id !== currentUserId && member.status === "approved" && (
                      confirmRemoveId === member._id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2 text-xs"
                            disabled={removingMemberId === member._id}
                            onClick={() => handleRemoveMember(member._id!)}
                          >
                            {removingMemberId === member._id ? "…" : "Confirm"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => setConfirmRemoveId(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => setConfirmRemoveId(member._id!)}
                        >
                          Remove
                        </Button>
                      )
                    )}
                  </div>
                </div>
              )})
            ) : (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No members yet. Be the first to join.
              </p>
            )}
          </Card>
          )}

          {/* H2H Challenges Tab */}
          {activeTab === "h2h" && (
          <Card className="mt-4 gap-0 overflow-hidden p-0 shadow-[var(--shadow-card)]">
            {challengesLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : challenges && challenges.length > 0 ? (
              <ul className="divide-y divide-border">
                {challenges.map((c) => {
                  const isChallenger = c.challengerId === currentUserId;
                  const isPending = c.status === "pending";
                  const isIncoming = isPending && !isChallenger;
                  const durationLabel = `${c.durationDays}d`;
                  const statusColors: Record<string, string> = {
                    pending: "text-amber-600 dark:text-amber-400",
                    accepted: "text-blue-600 dark:text-blue-400",
                    declined: "text-muted-foreground",
                    resolved: c.winnerId === currentUserId ? "text-green-600 dark:text-green-400" : c.winnerId === "tie" ? "text-muted-foreground" : "text-destructive",
                  };
                  return (
                    <li key={c._id} className="flex items-center justify-between gap-3 px-5 py-4">
                      <div>
                        <p className="text-sm font-medium">
                          {isChallenger ? "You challenged" : "Incoming challenge"} · ₦{c.wager.toLocaleString("en-NG")} wager · {durationLabel}
                        </p>
                        {c.status === "resolved" && (
                          <p className="text-xs text-muted-foreground">
                            {c.winnerId === "tie" ? "Tied — refunded" : c.winnerId === currentUserId ? "You won" : "Opponent won"}{" "}
                            · You: {c.challengerPoints ?? c.opponentPoints ?? 0} pts
                          </p>
                        )}
                        {(c.status === "accepted") && c.endDate && (
                          <p className="text-xs text-muted-foreground">
                            Ends {new Date(c.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </p>
                        )}
                        <p className={cn("text-xs font-semibold capitalize", statusColors[c.status])}>
                          {c.status}
                        </p>
                      </div>
                      {isIncoming && (
                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-green-600 border-green-500/30 hover:bg-green-500/10"
                            disabled={respondingId === c._id}
                            onClick={() => handleRespond(c._id, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
                            disabled={respondingId === c._id}
                            onClick={() => handleRespond(c._id, "declined")}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-muted-foreground">No challenges yet.</p>
                <p className="mt-1 text-xs text-muted-foreground">Go to the Members tab and hit "Challenge" on any player.</p>
              </div>
            )}
          </Card>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold">Pool rules</h2>
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
                <span className="font-semibold text-foreground">Correct outcome:</span> 1 point
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
              {isMonetized && pool.prizeDistribution && pool.prizeDistribution.length > 0 && (
                <li>
                  <span className="font-semibold text-foreground">Prize split:</span>{" "}
                  {pool.prizeDistribution.map((d, i) => (
                    <span key={d.position}>
                      {i > 0 && " · "}
                      {["1st", "2nd", "3rd", "4th", "5th"][d.position - 1] ?? `#${d.position}`} gets {d.percentage}%
                    </span>
                  ))}.
                </li>
              )}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary">No late entries after matchweek 5</Badge>
              <Badge variant="secondary">Refunds if the pool does not fill</Badge>
            </div>
          </Card>
        </section>
      </div>

      {/* Prize distribution display — only for monetized pools with distribution set */}
      {isMonetized && pool.prizeDistribution && pool.prizeDistribution.length > 0 && (
        <Card className="mt-6 gap-0 p-5 shadow-[var(--shadow-card)] border-gold/20">
          <h3 className="text-sm font-semibold text-gold uppercase tracking-wider">Prize Distribution</h3>
          <p className="mt-1 text-xs text-muted-foreground">How winnings are shared at the end of the season.</p>
          <div className="mt-4 space-y-2">
            {pool.prizeDistribution.map((d) => {
              const payout = Math.round((prizePoolAfterFee * d.percentage) / 100);
              return (
                <div key={d.position} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold shrink-0">
                    {d.position}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {["1st place", "2nd place", "3rd place", "4th place", "5th place"][d.position - 1] ?? `Position ${d.position}`}
                      </span>
                      <span className="font-semibold text-gold">{formatNaira(payout)}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${d.percentage}%` }} />
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{d.percentage}% of prize pool</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Challenge Sheet */}
      <Sheet open={challengeSheetOpen} onOpenChange={setChallengeSheetOpen}>
        <SheetContent side="right" className="w-80 p-0 flex flex-col">
          <SheetTitle className="sr-only">Send H2H Challenge</SheetTitle>
          <div className="border-b border-border px-5 py-5">
            <p className="font-semibold">Challenge {challengeTarget?.username ?? challengeTarget?.firstName ?? "this player"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Whoever scores more prediction points from matches during the challenge period wins. 90% goes to the winner, 10% platform fee.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Wager Amount (₦)
              </label>
              <input
                type="number"
                min={1}
                value={challengeWager}
                onChange={(e) => setChallengeWager(e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">This amount will be debited from your wallet immediately.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
                Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([7, 14, 21, 30] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setChallengeDuration(d)}
                    className={cn(
                      "rounded-xl border py-2.5 text-sm font-medium transition-colors",
                      challengeDuration === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {d === 7 ? "1 Week" : d === 14 ? "2 Weeks" : d === 21 ? "3 Weeks" : "1 Month"}
                  </button>
                ))}
              </div>
            </div>
            {challengeWager && Number(challengeWager) > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your wager</span>
                  <span className="font-semibold">₦{Number(challengeWager).toLocaleString("en-NG")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">If you win, you get</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ₦{Math.round(Number(challengeWager) * 2 * 0.9).toLocaleString("en-NG")}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Platform fee (10%)</span>
                  <span>₦{Math.round(Number(challengeWager) * 2 * 0.1).toLocaleString("en-NG")}</span>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-border p-5">
            <Button
              className="w-full"
              disabled={challengeSending || !challengeWager || Number(challengeWager) <= 0}
              onClick={handleSendChallenge}
            >
              {challengeSending ? "Sending…" : "Send Challenge"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
