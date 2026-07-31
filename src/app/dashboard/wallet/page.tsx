"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { StatCard } from "../../../components/app/card";
import { currentUser, formatNaira, transactions } from "../../lib/mock-data";

export default function WalletPage() {
  return (
    <AppShell title="Wallet" description="Deposits and withdrawals are processed securely by Paystack.">
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Available balance" value={formatNaira(currentUser.balance)} hint="Ready for entry fees" />
        <StatCard label="In active leagues" value={formatNaira(17000)} accent="primary" hint="Locked until season end" />
        <StatCard label="Season winnings" value={formatNaira(32500)} accent="gold" hint="Paid out to date" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <MoneyDialog mode="deposit" trigger={<Button size="lg">Deposit</Button>} />
        <MoneyDialog
          mode="withdraw"
          trigger={
            <Button size="lg" variant="outline">
              Withdraw
            </Button>
          }
        />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Transaction history</h2>
        <Card className="mt-4 gap-0 overflow-hidden p-0 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-[minmax(0,1fr)_6rem_6rem] gap-3 border-b border-border px-5 py-3 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase sm:grid-cols-[minmax(0,1fr)_8rem_7rem_7rem]">
            <span>Type</span>
            <span className="hidden sm:block">Date</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-[minmax(0,1fr)_6rem_6rem] items-center gap-3 border-b border-border px-5 py-3.5 text-sm last:border-0 sm:grid-cols-[minmax(0,1fr)_8rem_7rem_7rem]"
            >
              <span className="truncate font-medium">{tx.type}</span>
              <span className="hidden text-muted-foreground sm:block">{tx.date}</span>
              <span className="num text-right font-semibold">{formatNaira(tx.amount)}</span>
              <span className="flex justify-end">
                <Badge
                  variant="outline"
                  className={
                    tx.status === "successful"
                      ? "border-success/40 text-success"
                      : tx.status === "pending"
                        ? "border-gold/50 text-gold"
                        : "border-destructive/40 text-destructive"
                  }
                >
                  {tx.status}
                </Badge>
              </span>
            </div>
          ))}
        </Card>
      </section>
    </AppShell>
  );
}

function MoneyDialog({ mode, trigger }: { mode: "deposit" | "withdraw"; trigger: ReactNode }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  function confirm() {
    const value = Number(amount);
    if (!value || value < 500) {
      toast.error("Enter an amount of ₦500 or more");
      return;
    }
    setLoading(true);
    // Backend integration point: POST /wallet/deposit or /wallet/withdraw
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      setAmount("");
      toast.success(
        mode === "deposit"
          ? "Redirecting to Paystack to complete your deposit"
          : "Withdrawal request submitted for processing",
      );
    }, 700);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "deposit" ? "Deposit funds" : "Withdraw funds"}</DialogTitle>
          <DialogDescription>
            {mode === "deposit"
              ? "You will be redirected to Paystack to complete this payment securely."
              : "Withdrawals are reviewed and paid to your saved bank account within 24 hours."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount (NGN)</Label>
          <Input
            id="amount"
            inputMode="numeric"
            value={amount}
            placeholder="5000"
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={loading}>
            {loading ? "Processing…" : mode === "deposit" ? "Continue to Paystack" : "Request withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}