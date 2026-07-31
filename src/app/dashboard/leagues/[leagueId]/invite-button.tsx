"use client";

import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";

export function InviteButton({ leagueId }: { leagueId: string }) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        navigator.clipboard?.writeText(`https://fantasypredict.app/join/${leagueId}`);
        toast.success("Invitation link copied");
      }}
    >
      Invite friends
    </Button>
  );
}