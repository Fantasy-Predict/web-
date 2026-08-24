"use client";

import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";

const SITE_URL = "https://fantasy-predict.com";

export function InviteButton({ poolId, inviteCode }: { poolId: string; inviteCode?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!inviteCode) {
      toast.error("No invite code available for this pool");
      return;
    }
    const inviteUrl = `${SITE_URL}/pools/join?code=${inviteCode}`;
    const text = `Join my pool on Fantasy Predict!\n\n${inviteUrl}`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          toast.success("Invite link copied");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text: string) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy — please copy the link manually");
    }
  }

  if (!inviteCode) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="mr-1.5 h-3.5 w-3.5" />
          Invite friends
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <p className="text-sm font-semibold">Share invite link</p>
          <p className="text-xs text-muted-foreground">
            Share this link with friends so they can join your pool directly.
          </p>
          <div className="rounded-lg border border-input bg-muted px-3 py-2 text-center font-mono text-xs font-bold tracking-wider break-all">
            {`${SITE_URL}/pools/join?code=${inviteCode}`}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-input bg-muted px-3 py-2 text-center font-mono text-sm font-bold tracking-widest">
              {inviteCode}
            </div>
            <Button
              size="icon"
              variant="outline"
              className="shrink-0 h-9 w-9"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Click the copy button to copy both the link and code.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
