"use client";

import { useEffect, useState } from "react";
import { Swords, ChevronRight, CheckCircle, XCircle, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  getMyFplChallenges,
  respondToFplChallenge,
  getFplCurrentGameweek,
  type FplChallenge,
  type FplGameweek,
} from "@/app/lib/api/endpoints";
import { FplShell } from "@/components/layout/fpl-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/app/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "text-warning" },
  accepted: { label: "Active", icon: CheckCircle, color: "text-success" },
  declined: { label: "Declined", icon: XCircle, color: "text-destructive" },
  resolved: { label: "Resolved", icon: Trophy, color: "text-gold" },
} as const;

function ChallengeCard({
  challenge,
  myUserId,
  onRespond,
}: {
  challenge: FplChallenge;
  myUserId: string | null;
  onRespond: (id: string, action: "accepted" | "declined") => Promise<void>;
}) {
  const isChallenger = challenge.challengerId === myUserId;
  const cfg = STATUS_CONFIG[challenge.status];
  const StatusIcon = cfg.icon;
  const [responding, setResponding] = useState(false);

  const myTeamName = isChallenger ? challenge.challengerTeamName : (challenge.opponentTeamName ?? "—");
  const theirTeamName = isChallenger ? (challenge.opponentTeamName ?? "Awaiting acceptance") : challenge.challengerTeamName;

  async function handleRespond(action: "accepted" | "declined") {
    setResponding(true);
    try {
      await onRespond(challenge._id, action);
    } finally {
      setResponding(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("flex items-center gap-1 text-xs font-semibold", cfg.color)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {cfg.label}
          </span>
          <span className="text-xs text-muted-foreground">
            · GW{challenge.startGwId}{challenge.endGwId !== challenge.startGwId ? `–GW${challenge.endGwId}` : ""}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(challenge.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Duel display */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 text-right">
          <p className="text-sm font-semibold truncate">{myTeamName}</p>
          {challenge.status === "resolved" && (
            <p className="text-lg font-bold">{isChallenger ? challenge.challengerPoints ?? "—" : challenge.opponentPoints ?? "—"}</p>
          )}
        </div>
        <div className="flex items-center justify-center">
          <Swords className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold truncate">{theirTeamName}</p>
          {challenge.status === "resolved" && (
            <p className="text-lg font-bold">{isChallenger ? challenge.opponentPoints ?? "—" : challenge.challengerPoints ?? "—"}</p>
          )}
        </div>
      </div>

      {/* Incoming pending challenge — show accept/decline */}
      {!isChallenger && challenge.status === "pending" && (
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            className="flex-1 bg-primary text-white hover:bg-primary/90 text-xs"
            onClick={() => handleRespond("accepted")}
            disabled={responding}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => handleRespond("declined")}
            disabled={responding}
          >
            Decline
          </Button>
        </div>
      )}

      {/* Result badge */}
      {challenge.status === "resolved" && challenge.winnerId && (
        <p className={cn(
          "mt-2 text-center text-xs font-semibold",
          challenge.winnerId === myUserId ? "text-success" : "text-destructive"
        )}>
          {challenge.winnerId === myUserId ? "You won!" : "You lost"}
        </p>
      )}
      {challenge.status === "resolved" && !challenge.winnerId && (
        <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">Draw</p>
      )}
    </div>
  );
}

function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = sessionStorage.getItem("fp_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload._id ?? payload.id ?? null;
  } catch {
    return null;
  }
}

export default function FplChallengesPage() {
  const [challenges, setChallenges] = useState<FplChallenge[]>([]);
  const [currentGw, setCurrentGw] = useState<FplGameweek | null>(null);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "incoming" | "sent">("all");

  useEffect(() => {
    setMyUserId(getUserId());
    Promise.all([getMyFplChallenges(), getFplCurrentGameweek()]).then(([ch, gw]) => {
      setChallenges(ch);
      setCurrentGw(gw);
    }).catch(err => {
      toast.error(err instanceof Error ? err.message : "Failed to load challenges");
    }).finally(() => setLoading(false));
  }, []);

  async function handleRespond(id: string, action: "accepted" | "declined") {
    try {
      const updated = await respondToFplChallenge(id, action);
      setChallenges(prev => prev.map(c => c._id === id ? { ...c, ...updated } : c));
      toast.success(action === "accepted" ? "Challenge accepted!" : "Challenge declined");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to respond");
    }
  }

  const filtered = challenges.filter(c => {
    if (tab === "incoming") return c.opponentId === myUserId;
    if (tab === "sent") return c.challengerId === myUserId;
    return true;
  });

  const incomingPending = challenges.filter(c => c.opponentId === myUserId && c.status === "pending").length;

  return (
    <FplShell title="Challenges">
      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {(["all", "incoming", "sent"] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-colors",
              tab === t ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "incoming" && incomingPending > 0
              ? `Incoming (${incomingPending})`
              : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* How it works info */}
      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <Swords className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div className="text-sm">
            <p className="font-semibold">How GW Challenges work</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Challenge any FPL player to a head-to-head duel. Choose 1 GW, several consecutive GWs, or the rest of the season — points accumulate, and the winner is decided when the last GW ends.
              To send a challenge, go to any league standings page and tap a member&apos;s name.
              {currentGw ? ` Current gameweek: GW${currentGw.fplId}.` : ""}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
            <Swords className="h-8 w-8" />
            <p>
              {tab === "incoming" ? "No incoming challenges." :
               tab === "sent" ? "You haven't sent any challenges yet." :
               "No challenges yet. Challenge a player from any league standings page."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <ChallengeCard
              key={c._id}
              challenge={c}
              myUserId={myUserId}
              onRespond={handleRespond}
            />
          ))}
        </div>
      )}
    </FplShell>
  );
}
