"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../../components/ui/button";
import { cn } from "../../app/lib/utils";

const NAV = [
  { to: "/about", label: "About" },
  { to: "/help", label: "Help" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex items-center justify-between gap-4 py-3.5 lg:px-36 px-5">
        <div className="flex items-center min-w-fit">
          <Link href="/" aria-label="Fantasy Predict home" className="flex shrink-0 items-center">
            <div className="relative h-10 w-[190px]">
              <Image
                src="/logos.png"
                alt="Fantasy Predict"
                fill
                priority
                className="object-contain block dark:hidden"
                style={{ objectPosition: 'left center' }}
              />
              <Image
                src="/logos-white.png"
                alt="Fantasy Predict"
                fill
                priority
                className="object-contain hidden dark:block"
                style={{ objectPosition: 'left center' }}
              />
            </div>
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-7 md:flex">
          {NAV.map((item) => {
            const isActive = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2 min-w-fit">
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Create account</Link>
            </Button>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <nav className="grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between gap-2">
            <ThemeToggle />
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register" onClick={() => setOpen(false)}>
                  Create account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}