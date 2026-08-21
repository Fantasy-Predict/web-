"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
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
import { createWithdrawal, getBankAccount, getProfile, getTransactions, getWallet, getPayUrl, type BankAccount } from "../../lib/api/endpoints";
import { formatNaira, type Transaction } from "../../lib/mock-data";

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [wallet, history, profile] = await Promise.all([getWallet(), getTransactions(), getProfile()]);
        if (!active) return;
        setBalance(wallet.balance);
        setTransactions(history);
        setUserEmail(profile?.email ?? "");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load your wallet");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell title="Wallet" description="Deposits and withdrawals are processed securely by Paystack.">
      <div className="grid gap-5 sm:grid-cols-3">
        {loading ? (
          <>
            <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-4 h-7 w-32" />
            </Card>
            <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-4 h-7 w-32" />
            </Card>
            <Card className="gap-0 p-5 shadow-[var(--shadow-card)]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-4 h-7 w-32" />
            </Card>
          </>
        ) : (
          <>
            <StatCard label="Available balance" value={formatNaira(balance ?? 0)} hint="Ready for entry fees" />
            <StatCard label="Total deposited" value={formatNaira(0)} hint="Lifetime deposits" />
            <StatCard label="Total withdrawn" value={formatNaira(0)} hint="Lifetime withdrawals" />
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <MoneyDialog mode="deposit" trigger={<Button size="lg">Deposit</Button>} userEmail={userEmail} />
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
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="grid grid-cols-[minmax(0,1fr)_6rem_6rem] gap-3 border-b border-border px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_8rem_7rem_7rem]">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="hidden h-4 w-16 sm:block" />
                  <Skeleton className="h-4 w-14 justify-self-end" />
                  <Skeleton className="h-4 w-16 justify-self-end" />
                </div>
              ))
            : transactions.map((tx) => (
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

function MoneyDialog({ mode, trigger, userEmail }: { mode: "deposit" | "withdraw"; trigger: ReactNode; userEmail?: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [linkedBank, setLinkedBank] = useState<BankAccount | null>(null);
  const [checkingBank, setCheckingBank] = useState(false);

  async function onOpenChange(next: boolean) {
    setOpen(next);
    if (next && mode === "withdraw") {
      setCheckingBank(true);
      try {
        const account = await getBankAccount();
        setLinkedBank(account);
      } catch {
        setLinkedBank(null);
      } finally {
        setCheckingBank(false);
      }
    }
  }

  async function confirm() {
    const value = Number(amount);
    if (!value || value < 500) {
      toast.error("Enter an amount of ₦500 or more");
      return;
    }

    setLoading(true);
    try {
      if (mode === "deposit") {
        if (!userEmail) {
          toast.error("Unable to determine your email. Please try again.");
          return;
        }
        const payUrl = getPayUrl(userEmail, value);
        window.location.href = payUrl;
        return;
      } else {
        if (!linkedBank) {
          toast.error("Link a bank account in Settings → Payments first");
          return;
        }
        await createWithdrawal({
          amount: value,
          bankCode: linkedBank.bankCode,
          accountNumber: linkedBank.accountNumber,
          accountName: linkedBank.accountName,
          bankName: linkedBank.bankName,
        });
        toast.success("Withdrawal request submitted for processing");
      }
      setOpen(false);
      setAmount("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "deposit" ? "Deposit funds" : "Withdraw funds"}</DialogTitle>
          <DialogDescription>
            {mode === "deposit"
              ? "You will be redirected to Paystack to complete this payment securely."
              : "Withdrawals are paid to your linked bank account within 24 hours."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
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
          {mode === "withdraw" && (
            <>
              {checkingBank ? (
                <Skeleton className="h-10 w-full" />
              ) : linkedBank ? (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm font-medium">{linkedBank.bankName}</p>
                  <p className="text-xs text-muted-foreground">
                    {linkedBank.accountNumber} — {linkedBank.accountName}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-3 text-center">
                  <p className="text-sm text-muted-foreground">No bank account linked</p>
                  <Button
                    variant="link"
                    className="mt-1 h-auto p-0 text-sm"
                    onClick={() => { setOpen(false); router.push("/dashboard/settings"); }}
                  >
                    Link one in Settings
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={loading || !amount || Number(amount) < 500 || (mode === "withdraw" && !linkedBank)}
          >
            {loading ? "Processing…" : mode === "deposit" ? "Continue to Paystack" : "Request withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
