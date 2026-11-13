"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconSvgObject = any;
import {
  Home09Icon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";
import {
  ArrowLeftRight,
  BarChart2,
  BookOpen,
  Calendar,
  CircleUser,
  Layers,
  LogOut,
  Settings,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "../theme-toggle";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "../../components/ui/sheet";
import { getProfile } from "../../app/lib/api/endpoints";
import { clearSession } from "../../app/lib/api/session";
import { useNotifications } from "../../app/lib/notifications";
import { cn } from "../../app/lib/utils";

function formatNotifTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " + time;
}

type NavItem =
  | { to: string; label: string; kind: "huge"; icon: IconSvgObject }
  | { to: string; label: string; kind: "lucide"; Icon: typeof LogOut };

const FPL_NAV: NavItem[] = [
  { to: "/fpl", label: "Home", kind: "huge", icon: Home09Icon },
  { to: "/fpl/squad", label: "My Squad", kind: "lucide", Icon: Users },
  { to: "/fpl/picks", label: "Picks", kind: "lucide", Icon: Layers },
  { to: "/fpl/transfers", label: "Transfers", kind: "lucide", Icon: ArrowLeftRight },
  { to: "/fpl/fixtures", label: "Fixtures", kind: "lucide", Icon: Calendar },
  { to: "/fpl/leagues", label: "Leagues", kind: "lucide", Icon: Trophy },
  { to: "/fpl/challenges", label: "Challenges", kind: "lucide", Icon: Swords },
  { to: "/fpl/history", label: "History", kind: "lucide", Icon: BarChart2 },
  { to: "/fpl-guide", label: "Guide", kind: "lucide", Icon: BookOpen },
  { to: "/fpl/settings", label: "Settings", kind: "lucide", Icon: Settings },
];

const FPL_BOTTOM: Array<
  | { to: string; label: string; kind: "huge"; icon: IconSvgObject }
  | { to: string; label: string; kind: "lucide"; Icon: typeof LogOut }
> = [
  { to: "/fpl", label: "Home", kind: "huge", icon: Home09Icon },
  { to: "/fpl/squad", label: "Squad", kind: "lucide", Icon: Users },
  { to: "/fpl/transfers", label: "Transfers", kind: "lucide", Icon: ArrowLeftRight },
  { to: "/fpl/leagues", label: "Leagues", kind: "lucide", Icon: Trophy },
  { to: "/fpl/fixtures", label: "Fixtures", kind: "lucide", Icon: Calendar },
];

function NavIcon({ item }: { item: NavItem }) {
  if (item.kind === "lucide") return <item.Icon size={18} strokeWidth={1.5} className="shrink-0" />;
  return <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} className="shrink-0" />;
}

export function FplShell({
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
  const [initials, setInitials] = useState("FP");
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile sheet sidebar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">FPL Navigation</SheetTitle>
          <div className="flex items-center gap-3 px-5 py-5">
            <Link href="/" aria-label="Fantasy Predict home" onClick={() => setSheetOpen(false)}>
              <Logo className="justify-start" />
            </Link>
            <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gold">
              XI
            </span>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {FPL_NAV.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <NavIcon item={item} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-4 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setSheetOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <ArrowLeftRight size={16} strokeWidth={1.5} />
              Switch to FP mode
            </Link>
            <ThemeToggle className="w-full justify-between" />
            <button
              onClick={() => { setSheetOpen(false); handleLogout(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut size={16} strokeWidth={1.5} />
              Log out
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
          <div className="flex items-center gap-3 px-5 py-5">
            <Link href="/" aria-label="Fantasy Predict home">
              <Logo className="justify-start" />
            </Link>
            <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gold">
              XI
            </span>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {FPL_NAV.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <NavIcon item={item} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sidebar-border p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <ArrowLeftRight size={16} strokeWidth={1.5} />
              Switch to FP mode
            </Link>
            <ThemeToggle className="w-full justify-between" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut size={16} strokeWidth={1.5} />
              Log out
            </button>
          </div>
        </aside>

        <div className="lg:pl-60">
          <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex items-center justify-between px-5 py-3.5 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  aria-label="Open menu"
                  onClick={() => setSheetOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border lg:hidden"
                >
                  <CircleUser className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-base font-semibold truncate max-w-[180px] sm:max-w-xs">{title}</h1>
                  {description && (
                    <p className="text-xs text-muted-foreground leading-tight">{description}</p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* FP/FPL mode switcher */}
                <div className="hidden sm:flex items-center rounded-xl border border-border bg-card text-xs font-semibold overflow-hidden">
                  <Link
                    href="/dashboard"
                    className="px-3 py-1.5 text-muted-foreground hover:bg-accent transition-colors"
                  >
                    FP
                  </Link>
                  <span className="px-3 py-1.5 bg-gold/15 text-gold">
                    Fantasy XI
                  </span>
                </div>

                <ThemeToggle />

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    aria-label="Notifications"
                    onClick={() => {
                      setShowNotifications((prev) => !prev);
                      if (unreadCount > 0) markAllRead();
                    }}
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-accent"
                  >
                    <HugeiconsIcon icon={Notification03Icon} size={16} strokeWidth={1.5} />
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
                          <p className="px-4 py-6 text-center text-xs text-muted-foreground">No notifications yet</p>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n.id}
                              className={cn("border-b border-border px-4 py-3 last:border-0", !n.read && "bg-primary/5")}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">{n.title}</p>
                                <span className="text-[10px] tabular-nums text-muted-foreground">{formatNotifTime(n.timestamp)}</span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="animate-rise px-5 pt-8 pb-24 lg:px-8 lg:pb-14">
            <div className="mx-auto max-w-7xl">
              {actions && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div />
                  <div className="flex-shrink-0">{actions}</div>
                </div>
              )}
              {children}
            </div>
          </main>

          {/* Mobile bottom nav */}
          <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
            {FPL_BOTTOM.map((item) => {
              const isActive = pathname === item.to || (item.to !== "/fpl" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                    isActive ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  {item.kind === "huge" ? (
                    <HugeiconsIcon
                      icon={item.icon}
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                      className={cn("shrink-0", isActive && "text-gold")}
                    />
                  ) : (
                    <item.Icon
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                      className={cn("shrink-0", isActive && "text-gold")}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
