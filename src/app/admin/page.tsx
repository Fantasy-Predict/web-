import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "../../components/layout/admin-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "../../components/app/card";
import { adminActivity, adminPayouts, adminStats } from "../../app/lib/admin-data";
import { formatNaira } from "../../app/lib/mock-data";

export const metadata: Metadata = {
  title: "Admin Overview — Fantasy Predict",
  description:
    "Platform overview for Fantasy Predict administrators: users, leagues, predictions, deposits and pending payouts.",
  openGraph: {
    title: "Admin Overview — Fantasy Predict",
    description: "Users, leagues, predictions and payments at a glance.",
  },
};

export default function AdminOverview() {
  return (
    <AdminShell
      title="Platform overview"
      description="Everything happening across Fantasy Predict this matchweek."
      actions={
        <Button asChild>
          <Link href="/admin/results">Settle results</Link>
        </Button>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={adminStats.totalUsers.toLocaleString()} hint={`${adminStats.activeUsers.toLocaleString()} active this week`} />
        <StatCard label="Active leagues" value={adminStats.totalLeagues.toLocaleString()} accent="primary" hint="Public and private" />
        <StatCard label="Predictions this week" value={adminStats.predictionsThisWeek.toLocaleString()} accent="gold" hint="Across all competitions" />
        <StatCard label="Platform revenue" value={formatNaira(adminStats.platformRevenue)} accent="success" hint="Commission this month" />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <StatCard label="Deposits this month" value={formatNaira(adminStats.depositsThisMonth)} hint="Paystack settled" />
        <StatCard label="Withdrawals this month" value={formatNaira(adminStats.withdrawalsThisMonth)} hint="Paid to bank accounts" />
        <StatCard label="Pending payouts" value={String(adminStats.pendingPayouts)} accent="gold" hint="Awaiting review" />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Payouts awaiting review</h2>
            <Link href="/admin/payments" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              All payments
            </Link>
          </div>
          <Card className="mt-4 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
            {adminPayouts
              .filter((p) => p.status === "awaiting review")
              .map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.user}</p>
                    <p className="text-xs text-muted-foreground">{p.method} · {p.requested}</p>
                  </div>
                  <span className="num text-sm font-bold">{formatNaira(p.amount)}</span>
                </div>
              ))}
          </Card>
        </section>
        <section>
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Card className="mt-4 gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
            {adminActivity.map(([title, body, time]) => (
              <div key={body} className="px-5 py-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">{time}</p>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </AdminShell>
  );
}