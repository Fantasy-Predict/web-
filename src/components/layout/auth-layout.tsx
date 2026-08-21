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
