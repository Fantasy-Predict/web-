"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "../../../components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminResults } from "../../lib/admin-data";

export default function AdminResults() {
  return (
    <AdminShell
      title="Fixtures & results"
      description="Enter final scores to settle a match and score every prediction in one pass."
    >
      <div className="grid gap-4">
        {adminResults.map((r) => (
          <ResultRow key={r.id} fixture={r.fixture} kickoff={r.kickoff} score={r.score} status={r.status} />
        ))}
      </div>
    </AdminShell>
  );
}

function ResultRow({
  fixture,
  kickoff,
  score,
  status,
}: {
  fixture: string;
  kickoff: string;
  score?: string;
  status: "scheduled" | "awaiting result" | "settled";
}) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const settled = status === "settled";

  return (
    <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{fixture}</p>
          <p className="mt-1 text-xs text-muted-foreground">{kickoff}</p>
        </div>
        <Badge
          variant="outline"
          className={
            settled
              ? "border-success/40 text-success"
              : status === "awaiting result"
                ? "border-gold/50 text-gold"
                : "border-border text-muted-foreground"
          }
        >
          {status}
        </Badge>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {settled ? (
          <p className="num text-sm font-bold">{score}</p>
        ) : (
          <>
            <Input
              value={home}
              onChange={(e) => setHome(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="0"
              aria-label={`${fixture} home score`}
              className="num h-10 w-16 text-center"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              value={away}
              onChange={(e) => setAway(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="0"
              aria-label={`${fixture} away score`}
              className="num h-10 w-16 text-center"
            />
            <Button
              size="sm"
              onClick={() => {
                if (home === "" || away === "") {
                  toast.error("Enter both scores before settling");
                  return;
                }
                toast.success(`${fixture} settled ${home}-${away}. Predictions scored.`);
              }}
            >
              Settle match
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}