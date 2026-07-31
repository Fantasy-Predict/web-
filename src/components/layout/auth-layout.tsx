import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="surface-navy hidden flex-col justify-between p-12 lg:flex">
        <Link href="/" aria-label="Fantasy Predict home">
          <Logo />
        </Link>
        <div>
          <h2 className="max-w-md font-display text-4xl leading-tight font-bold">
            Every matchweek is a chance to prove your judgement.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-foreground/65">
            Transparent scoring, published prize pools and leaderboards that update as the results
            come in.
          </p>
        </div>
        <p className="text-xs text-navy-foreground/50">
          18+. Play responsibly. Payments secured by Paystack.
        </p>
      </div>
      <div className="flex flex-col justify-center px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md animate-rise">
          <Link href="/" className="lg:hidden" aria-label="Fantasy Predict home">
            <Logo />
          </Link>
          <h1 className="mt-8 text-2xl font-bold sm:text-3xl lg:mt-0">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-input bg-card text-sm font-semibold transition-colors hover:bg-accent"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"
        />
        <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"
        />
      </svg>
      {label}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}