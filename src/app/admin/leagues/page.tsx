"use client";

import { toast } from "sonner";
import { AdminShell, AdminTable } from "../../../components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNaira, leagues } from "../../../app/lib/mock-data";
import { cn } from "../../../app/lib/utils";

// Helper to display poolFor label
const poolForLabels: Record<string, string> = {
  office: "Office",
  "friends-family": "Friends/Family",
  open: "Open",
  "media-blog": "Media/Blog",
  business: "Business",
  other: "Other",
};

export default function AdminLeagues() {
  return (
    <AdminShell title="Leagues" description="Every room on the platform, with entry fees and prize pools.">
      <AdminTable
        columns={[
          "League",
          "Type",
          "Pool For",
          "Prize Type",
          "Competition",
          "Entry fee",
          "Members",
          "Prize pool",
          "Platform Fee",
          "Action",
        ]}
      >
        {leagues.map((l) => {
          const isFree = l.type === "free";
          const hasPrize = l.prizeType === "prizes";
          const totalPot = l.entryFee * l.maxPlayers;
          const platformFee = isFree ? 0 : Math.round(totalPot * 0.1);

          return (
            <tr key={l.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3.5">
                <p className="font-semibold">{l.name}</p>
                <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                  {l.privacy}
                </Badge>
              </td>

              {/* League Type (Free / Monetized) */}
              <td className="px-5 py-3.5">
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
              </td>

              {/* Pool For */}
              <td className="px-5 py-3.5 text-muted-foreground">
                {poolForLabels[l.poolFor] || l.poolFor}
              </td>

              {/* Prize Type */}
              <td className="px-5 py-3.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    hasPrize
                      ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {hasPrize ? "Prizes" : "Fun"}
                </Badge>
              </td>

              <td className="px-5 py-3.5 text-muted-foreground">{l.competition}</td>
              <td className="num px-5 py-3.5">{formatNaira(l.entryFee)}</td>
              <td className="num px-5 py-3.5">
                {l.players}/{l.maxPlayers}
              </td>
              <td className="num px-5 py-3.5 font-semibold">{formatNaira(l.prizePool)}</td>

              {/* Platform Fee */}
              <td className="num px-5 py-3.5 text-gold font-semibold">
                {isFree ? "—" : formatNaira(platformFee)}
              </td>

              <td className="px-5 py-3.5 text-right">
                <Button size="sm" variant="outline" onClick={() => toast.success(`${l.name} closed to new entries`)}>
                  Close entries
                </Button>
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </AdminShell>
  );
}