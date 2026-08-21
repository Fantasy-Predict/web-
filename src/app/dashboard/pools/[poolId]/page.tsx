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
import { formatNaira, type Pool } from "../../../lib/mock-data";
import { getPool, getPoolMembers, getProfile, joinPool, updatePoolMemberStatus, type PoolMember } from "../../../lib/api/endpoints";
import { addJoinedPoolId } from "../../../lib/api/session";
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
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [actingMemberId, setActingMemberId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
        setPool(poolData ?? null);
        setMembers(poolMembers ?? []);
        setCurrentUserId(profile?._id ?? null);
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
      addJoinedPoolId(pool.id);
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
              <p className="mt-2 text-xs text-muted-foreground">
                The prize pool is distributed among winners based on the pool&apos;s prize distribution rules.
              </p>
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
          <h2 className="text-lg font-semibold">Members</h2>
          <Card className="mt-4 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
            {members.length ? (
              members.map((member, index) => {
                const displayName = member.username || "Member";
                const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                <div key={member._id ?? index} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                  <span className="num text-sm font-bold text-muted-foreground">{member.position ?? index + 1}</span>
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-muted text-[10px] font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{displayName}</p>
                      {member.status === "pending" && (
                        <p className="truncate text-xs text-muted-foreground">Pending approval</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof member.points === "number" && (
                      <span className="num text-sm font-bold">{member.points.toLocaleString()}</span>
                    )}
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
                  </div>
                </div>
              )})
            ) : (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No members yet. Be the first to join.
              </p>
            )}
          </Card>
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
              <Badge variant="secondary">Refunds if the pool does not fill</Badge>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
