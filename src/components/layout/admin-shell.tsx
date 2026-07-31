"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "../../app/lib/utils";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/leagues", label: "Leagues" },
  { to: "/admin/results", label: "Fixtures & results" },
  { to: "/admin/payments", label: "Payments" },
] as const;

function isActive(pathname: string, to: string) {
  return to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
}

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="px-5 py-5">
          <Link href="/" aria-label="Fantasy Predict home">
            <Logo />
          </Link>
          <Badge variant="outline" className="mt-3 border-gold/50 text-gold">
            Admin console
          </Badge>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive(pathname, item.to)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="mt-4 block rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            ← Back to player app
          </Link>
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <ThemeToggle className="w-full justify-between" />
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
            <Link href="/" className="lg:hidden" aria-label="Fantasy Predict home">
              <Logo variant="mark" />
            </Link>
            <nav className="hidden gap-1 overflow-x-auto sm:flex lg:hidden">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap",
                    isActive(pathname, item.to) ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-navy text-xs font-semibold text-navy-foreground">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="animate-rise px-5 pt-8 pb-24 lg:px-8 lg:pb-14">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
                {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
              </div>
              {actions}
            </div>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur sm:hidden">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={cn(
              "px-1 py-3 text-center text-[10px] font-semibold",
              isActive(pathname, item.to) ? "text-primary" : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function AdminTable({
  columns,
  children,
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <table className="w-full min-w-[42rem] text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
            {columns.map((c) => (
              <th key={c} className="px-5 py-3 text-left font-semibold last:text-right">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}