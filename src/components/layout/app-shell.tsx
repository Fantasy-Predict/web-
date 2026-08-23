"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "../theme-toggle";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { getProfile } from "../../app/lib/api/endpoints";
import { clearSession } from "../../app/lib/api/session";
import { useNotifications, markAllRead } from "../../app/lib/notifications";
import { cn } from "../../app/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dashboard/fixtures", label: "Fixtures" },
  { to: "/dashboard/predict", label: "Predict" },
  { to: "/dashboard/results", label: "Results" },
  { to: "/dashboard/pools", label: "Pools" },
  { to: "/dashboard/leaderboard", label: "Leaderboard" },
  { to: "/dashboard/wallet", label: "Wallet" },
  { to: "/dashboard/profile", label: "Profile" },
  { to: "/dashboard/settings", label: "Settings" },
] as const;

const MOBILE_NAV = NAV.filter((n) =>
  ["/dashboard", "/dashboard/predict", "/dashboard/results", "/dashboard/pools", "/dashboard/wallet", "/dashboard/profile"].includes(n.to),
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initials, setInitials] = useState("FP");
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>(null);
  const { notifications, unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    getProfile()
      .then((profile) => {
        if (!active) return;
        const name = profile?.firstName || profile?.username || profile?.email;
        setInitials(name ? name.slice(0, 2).toUpperCase() : "FP");
      })
      .catch(() => {
        if (active) setInitials("FP");
      });
    return () => {
      active = false;
    };
  }, []);

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
        <div className="border-t border-sidebar-border p-4 space-y-2">
          <ThemeToggle className="w-full justify-between" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-3.5 lg:px-8">
            <div className="flex items-center gap-3">
              {/* Logo mark – only visible on mobile (lg:hidden) */}
              <Link href="/" className="lg:hidden" aria-label="Fantasy Predict home">
                <Logo variant="mark" />
              </Link>
              <div className="relative hidden w-full max-w-xs sm:block">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (searchDebounce.current) clearTimeout(searchDebounce.current);
                    if (e.target.value.trim()) {
                      searchDebounce.current = setTimeout(() => {
                        router.push(`/dashboard/pools?q=${encodeURIComponent(e.target.value.trim())}`);
                      }, 500);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      if (searchDebounce.current) clearTimeout(searchDebounce.current);
                      router.push(`/dashboard/pools?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  placeholder="Search pools, players"
                  className="h-9 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <div className="relative" ref={notifRef}>
                <button
                  aria-label="Notifications"
                  onClick={() => {
                    setShowNotifications((prev) => !prev);
                    if (unreadCount > 0) markAllRead();
                  }}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-accent"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                    <div className="border-b border-border px-4 py-3">
                      <p className="text-sm font-semibold">Notifications</p>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={cn(
                              "border-b border-border px-4 py-3 last:border-0",
                              !n.read && "bg-primary/5",
                            )}
                          >
                            <p className="text-sm font-semibold">{n.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="animate-rise px-5 pt-8 pb-28 lg:px-8 lg:pb-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
                {description && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex-shrink-0">{actions}</div>
              )}
            </div>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-7 border-t border-border bg-background/95 backdrop-blur lg:hidden">
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
        <button
          onClick={handleLogout}
          className="py-3 text-center text-[11px] font-semibold text-muted-foreground"
        >
          <LogOut className="mx-auto mb-0.5 h-4 w-4" />
          Log out
        </button>
      </nav>
    </div>
  );
}