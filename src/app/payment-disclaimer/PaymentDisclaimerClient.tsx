"use client";

import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================================
// DATA
// ============================================================

const INFO_CARDS = [
  {
    title: "Typical Processing Time",
    description: "Instant in most cases. Occasionally delayed due to banking or provider issues.",
  },
  {
    title: "Typical Processing Time",
    description: "Within 24 business hours after approval.",
    variant: "withdrawal" as const,
  },
];

// ============================================================
// PAGE COMPONENT
// ============================================================

export default function PaymentDisclaimerClient() {
  return (
    <PublicLayout>
      {/* =============================================================
          HERO — Trust-focused, financial feel
          ============================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy via-navy to-primary/15">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(244,180,0,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(244,180,0,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:py-20 lg:py-24 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="outline" className="border-gold/40 text-gold">Payment Disclaimer</Badge>
            <Badge variant="outline" className="border-gold/30 text-gold/80 text-[10px]">
              Secured
            </Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Payment Disclaimer
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-white/70">
            We are committed to providing a secure, transparent, and reliable payment experience.
            Please review the information below regarding deposits, withdrawals, transaction
            processing, and payment responsibilities.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="text-white/50">Last Updated: <span className="text-white/80">July 2026</span></span>
            <span className="hidden text-white/20 sm:inline">|</span>
            <span className="text-white/50">Payments via <span className="text-gold font-semibold">Paystack</span></span>
          </div>
        </div>
      </section>

      {/* =============================================================
          PAYMENT OVERVIEW
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div data-aos="fade-up">
          <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
            <span className="text-xs font-bold tracking-[0.18em] text-gold">01</span>
            <h2 className="text-xl font-bold">How Payments Work</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Fantasy Predict does not charge users for account registration or dashboard access.
              Payments apply only to eligible leagues that require participation fees.
            </p>
            <p>
              Fantasy Predict allows users to participate in eligible leagues that may require
              entry fees. All payments are processed through secure third-party payment providers,
              and users are encouraged to review transaction details before confirming any payment.
            </p>
            <p>
              Your wallet balance serves as the central hub for all financial activity on the
              platform, including deposits, entry fees, and prize distributions.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================================
          ACCEPTED PAYMENT METHODS
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
          <div data-aos="fade-up">
            <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
              <span className="text-xs font-bold tracking-[0.18em] text-gold">02</span>
              <h2 className="text-xl font-bold">Supported Payment Methods</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {["Debit Cards", "Bank Transfers", "Wallet Balance"].map((method) => (
                <div
                  key={method}
                  className="rounded-xl border border-border bg-card p-4 text-center shadow-[var(--shadow-card)]"
                >
                  <p className="text-sm font-semibold">{method}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground/70 italic">
              Available payment methods may vary over time as the platform expands.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================================
          DEPOSITS
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div data-aos="fade-up">
          <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
            <span className="text-xs font-bold tracking-[0.18em] text-gold">03</span>
            <h2 className="text-xl font-bold">Making a Deposit</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc pl-5 space-y-2">
              <li>Deposits are processed securely through approved payment providers.</li>
              <li>Users should verify payment details before confirming any transaction.</li>
              <li>Successful deposits are reflected in your wallet balance immediately.</li>
              <li>Processing time may vary depending on the payment provider.</li>
            </ul>
          </div>
          <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm">
            <p className="font-medium text-gold">Typical Processing Time</p>
            <p className="text-muted-foreground">
              Instant in most cases. Occasionally delayed due to banking or provider issues.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================================
          WITHDRAWALS
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
          <div data-aos="fade-up">
            <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
              <span className="text-xs font-bold tracking-[0.18em] text-gold">04</span>
              <h2 className="text-xl font-bold">Withdrawals</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <ul className="list-disc pl-5 space-y-2">
                <li>Withdrawals are subject to verification where required.</li>
                <li>Requests are reviewed before processing.</li>
                <li>Processing may take up to the stated business period.</li>
                <li>
                  Delays caused by banks or payment providers are outside Fantasy Predict's
                  control.
                </li>
              </ul>
            </div>
            <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm">
              <p className="font-medium text-gold">Typical Processing Time</p>
              <p className="text-muted-foreground">
                Within 24 business hours after approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          FEES & CHARGES
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div data-aos="fade-up">
          <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
            <span className="text-xs font-bold tracking-[0.18em] text-gold">05</span>
            <h2 className="text-xl font-bold">Fees & Charges</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Fantasy Predict aims to be transparent about all payment-related charges.
              </li>
              <li>
                Third-party processing fees, where applicable, will be displayed before users
                confirm a transaction.
              </li>
              <li>No hidden fees.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* =============================================================
          TRANSACTION ISSUES
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
          <div data-aos="fade-up">
            <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
              <span className="text-xs font-bold tracking-[0.18em] text-gold">06</span>
              <h2 className="text-xl font-bold">Transaction Issues</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>If any of the following occur:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Payment fails</li>
                <li>Duplicate payment occurs</li>
                <li>Wallet balance doesn't update</li>
                <li>Withdrawal is delayed</li>
              </ul>
              <p>Users should:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Keep the payment reference number</li>
                <li>Contact support immediately</li>
                <li>Include all transaction details</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          REFUND POLICY
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div data-aos="fade-up">
          <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
            <span className="text-xs font-bold tracking-[0.18em] text-gold">07</span>
            <h2 className="text-xl font-bold">Refunds</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Refund eligibility depends on several factors, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>League rules and participation status</li>
              <li>Payment status and verification</li>
              <li>Transaction verification</li>
            </ul>
            <p>
              Not every payment automatically qualifies for a refund. Each request is reviewed
              on a case-by-case basis.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================================
          FRAUD PREVENTION
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
          <div data-aos="fade-up">
            <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
              <span className="text-xs font-bold tracking-[0.18em] text-gold">08</span>
              <h2 className="text-xl font-bold">Keeping Payments Secure</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Fantasy Predict may perform verification checks to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Prevent fraudulent activity</li>
                <li>Protect users and their accounts</li>
                <li>Comply with legal and regulatory obligations</li>
                <li>Secure user accounts</li>
              </ul>
              <p>
                Suspicious transactions may be delayed or declined pending review to ensure
                the security of all users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          USER RESPONSIBILITIES
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div data-aos="fade-up">
          <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
            <span className="text-xs font-bold tracking-[0.18em] text-gold">09</span>
            <h2 className="text-xl font-bold">Your Responsibility</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>Users should:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Verify payment amounts before confirming any transaction</li>
              <li>Use only payment methods they are authorized to use</li>
              <li>Keep payment receipts and references for their records</li>
              <li>Report any payment issues promptly to support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* =============================================================
          NEED HELP WITH A PAYMENT?
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
          <Card
            className="gap-0 border-gold/20 bg-card p-10 text-center shadow-[var(--shadow-card)] sm:p-12"
            data-aos="zoom-in"
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              Need Assistance
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Need Help With A Payment?</h2>
            <p className="mt-3 max-w-xl mx-auto text-sm leading-relaxed text-muted-foreground">
              If you experience any payment-related issue, our support team is here to help.
              Contact us and we will get back to you as soon as possible.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/help">Visit Help Center</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* =============================================================
          IMPORTANT NOTICE
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div
          className="rounded-xl border border-gold/30 bg-gold/5 p-6 text-center sm:p-8"
          data-aos="fade-up"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
            Important Notice
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Fantasy Predict facilitates participation in football prediction competitions.
            Payment processing is handled through approved third-party providers. While we
            strive to provide fast and reliable processing, transaction times may vary
            depending on your financial institution and payment provider.
          </p>
        </div>
      </section>

      {/* =============================================================
          FINAL CTA
          ============================================================= */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <Card
            className="items-center gap-0 border-primary/30 bg-gradient-to-br from-card to-card/80 p-10 text-center sm:p-14"
            data-aos="zoom-in"
          >
            <h2 className="max-w-xl mx-auto text-2xl font-bold sm:text-3xl">
              Ready To Start Predicting?
            </h2>
            <p className="mt-3 max-w-lg mx-auto text-sm leading-relaxed text-muted-foreground">
              Join thousands of fans already competing. Create your league or join an existing
              one today.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
                <Link href="/dashboard/leagues/create">Create League</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard/leagues">Join League</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}