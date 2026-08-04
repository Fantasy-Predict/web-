"use client";

import { toast } from "sonner";
import { AdminShell, AdminTable } from "../../../components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "../../../components/app/card";
import { adminPayouts, adminStats } from "../../../app/lib/admin-data";
import { formatNaira, transactions, leagues } from "../../../app/lib/mock-data";

// Calculate total platform fees (mock)
const totalPlatformFees = leagues
  .filter((l) => l.type === "monetized")
  .reduce((sum, l) => sum + Math.round(l.entryFee * l.maxPlayers * 0.1), 0);

// Mock platform fee transactions (for display)
const feeTransactions = leagues
  .filter((l) => l.type === "monetized")
  .map((l) => ({
    league: l.name,
    amount: Math.round(l.entryFee * l.maxPlayers * 0.1),
    date: "2026-08-04", // mock date
  }));

export default function AdminPayments() {
  return (
    <AdminShell title="Payments" description="Deposits settle automatically; withdrawals need manual approval.">
      <div className="grid gap-5 sm:grid-cols-4">
        <StatCard label="Deposits this month" value={formatNaira(adminStats.depositsThisMonth)} hint="Paystack settled" />
        <StatCard label="Withdrawals this month" value={formatNaira(adminStats.withdrawalsThisMonth)} accent="primary" hint="Paid to bank accounts" />
        <StatCard label="Pending payouts" value={String(adminStats.pendingPayouts)} accent="gold" hint="Awaiting your review" />
        {/* NEW: Platform fees collected */}
        <StatCard
          label="Platform fees collected"
          value={formatNaira(totalPlatformFees)}
          accent="gold"
          hint="10% from monetized leagues"
        />
      </div>

      {/* Platform Fee Transactions Section */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Platform fee collections</h2>
        <div className="mt-4">
          <AdminTable columns={["League", "Amount", "Date"]}>
            {feeTransactions.map((fee, idx) => (
              <tr key={idx} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 font-semibold">{fee.league}</td>
                <td className="num px-5 py-3.5 text-gold font-semibold">{formatNaira(fee.amount)}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{fee.date}</td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </section>

      {/* Withdrawal requests */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Withdrawal requests</h2>
        <div className="mt-4">
          <AdminTable columns={["User", "Method", "Requested", "Amount", "Status", "Action"]}>
            {adminPayouts.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 font-semibold">{p.user}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{p.method}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{p.requested}</td>
                <td className="num px-5 py-3.5 font-semibold">{formatNaira(p.amount)}</td>
                <td className="px-5 py-3.5">
                  <Badge
                    variant="outline"
                    className={
                      p.status === "approved"
                        ? "border-success/40 text-success"
                        : p.status === "awaiting review"
                          ? "border-gold/50 text-gold"
                          : "border-destructive/40 text-destructive"
                    }
                  >
                    {p.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {p.status === "awaiting review" ? (
                    <div className="inline-flex gap-2">
                      <Button size="sm" onClick={() => toast.success(`Payout to ${p.user} approved`)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast(`Payout to ${p.user} rejected`)}>
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No action</span>
                  )}
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </section>

      {/* Recent transactions */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recent transactions</h2>
        <div className="mt-4">
          <AdminTable columns={["Type", "Date", "Amount", "Status"]}>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 font-medium">{t.type}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{t.date}</td>
                <td className="num px-5 py-3.5 font-semibold">{formatNaira(t.amount)}</td>
                <td className="px-5 py-3.5 text-right">
                  <Badge
                    variant="outline"
                    className={
                      t.status === "successful"
                        ? "border-success/40 text-success"
                        : t.status === "pending"
                          ? "border-gold/50 text-gold"
                          : "border-destructive/40 text-destructive"
                    }
                  >
                    {t.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      </section>
    </AdminShell>
  );
}