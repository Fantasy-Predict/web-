"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "../theme-toggle";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { currentUser } from "../../app/lib/mock-data";
import { cn } from "../../app/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dashboard/fixtures", label: "Fixtures" },
  { to: "/dashboard/predict", label: "Predict" },
  { to: "/dashboard/leagues", label: "Leagues" },
  { to: "/dashboard/leaderboard", label: "Leaderboard" },
  { to: "/dashboard/wallet", label: "Wallet" },
  { to: "/dashboard/profile", label: "Profile" },
  { to: "/dashboard/settings", label: "Settings" },
] as const;

const MOBILE_NAV = NAV.filter((n) =>
  ["/dashboard", "/dashboard/predict", "/dashboard/leagues", "/dashboard/wallet", "/dashboard/profile"].includes(n.to),
);

export function AppShell({
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
            <Logo className="justify-start" />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <ThemeToggle className="w-full justify-between" />
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" className="lg:hidden" aria-label="Fantasy Predict home">
                <Logo variant="mark" />
              </Link>
              <div className="relative hidden w-full max-w-xs sm:block">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search leagues, players"
                  className="h-9 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                aria-label="Notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-accent"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
              </button>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {currentUser.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="animate-rise px-5 pt-8 pb-28 lg:px-8 lg:pb-14">
          {/* Wider content area: max-w-5xl → max-w-7xl */}
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
                {description && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {actions}
            </div>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        {MOBILE_NAV.map((item) => {  
          const isActive = pathname === item.to;
          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "py-3 text-center text-[11px] font-semibold",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}