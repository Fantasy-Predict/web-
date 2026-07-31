"use client";

import { toast } from "sonner";
import { AdminShell, AdminTable } from "../../../components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNaira, leagues } from "../../../app/lib/mock-data";

export default function AdminLeagues() {
  return (
    <AdminShell title="Leagues" description="Every room on the platform, with entry fees and prize pools.">
      <AdminTable columns={["League", "Competition", "Entry fee", "Members", "Prize pool", "Action"]}>
        {leagues.map((l) => (
          <tr key={l.id} className="border-b border-border last:border-0">
            <td className="px-5 py-3.5">
              <p className="font-semibold">{l.name}</p>
              <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                {l.privacy}
              </Badge>
            </td>
            <td className="px-5 py-3.5 text-muted-foreground">{l.competition}</td>
            <td className="num px-5 py-3.5">{formatNaira(l.entryFee)}</td>
            <td className="num px-5 py-3.5">
              {l.players}/{l.maxPlayers}
            </td>
            <td className="num px-5 py-3.5 font-semibold">{formatNaira(l.prizePool)}</td>
            <td className="px-5 py-3.5 text-right">
              <Button size="sm" variant="outline" onClick={() => toast.success(`${l.name} closed to new entries`)}>
                Close entries
              </Button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  );
}