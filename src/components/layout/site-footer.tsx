import Link from "next/link";
import Image from "next/image";

const GROUPS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
      { to: "/dashboard/leaderboard", label: "Leaderboard" },
      { to: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/help", label: "Help Centre" },
      { to: "/contact", label: "Contact Support" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms of Service" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/responsible-gaming", label: "Responsible Gaming" },
      { to: "/payment-disclaimer", label: "Payment Disclaimer" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            {/* Logo – adapts to light/dark mode like the navbar */}
            <div className="relative h-12 w-[200px]">
              <Image
                src="/logos.png"
                alt="Fantasy Predict"
                fill
                priority
                className="object-contain block dark:hidden"
              />
              <Image
                src="/logos-white.png"
                alt="Fantasy Predict"
                fill
                priority
                className="object-contain hidden dark:block"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A prediction platform for football fans who want a fair, transparent and competitive
              season-long contest.
            </p>
          </div>
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {group.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      href={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fantasy Predict. All rights reserved.</p>
          <p>18+. Play responsibly. Payments processed securely via Paystack.</p>
        </div>
      </div>
    </footer>
  );
}