"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================================
// TABLE OF CONTENTS
// ============================================================

const TOC = [
  { id: "introduction", label: "Introduction" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts", label: "Account Registration" },
  { id: "platform-usage", label: "Platform Usage" },
  { id: "predictions-scoring", label: "Predictions & Scoring" },
  { id: "leagues", label: "Leagues & Competitions" },
  { id: "payments-wallet", label: "Payments & Wallet" },
  { id: "rewards", label: "Rewards & Prize Distribution" },
  { id: "user-responsibilities", label: "User Responsibilities" },
  { id: "prohibited-activities", label: "Prohibited Activities" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "privacy", label: "Privacy & Data Protection" },
  { id: "service-availability", label: "Service Availability" },
  { id: "termination", label: "Account Suspension & Termination" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "changes", label: "Changes To Terms" },
  { id: "contact", label: "Contact Information" },
];

// ============================================================
// CLIENT COMPONENT
// ============================================================

export default function TermsClient() {
  const [activeId, setActiveId] = useState<string>(TOC[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Intersection Observer to track visible sections
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    TOC.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(id);
            }
          });
        },
        {
          rootMargin: "-20% 0px -60% 0px", // Adjust to trigger when section is near top
          threshold: 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Smooth scroll to section when TOC link is clicked
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PublicLayout>
      {/* =============================================================
          HERO — Dark, authoritative, premium
          ============================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy via-navy to-primary/10">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(244,180,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(244,180,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:py-20 lg:py-24 lg:px-8">
          <Badge variant="outline" className="border-gold/40 text-gold">Legal</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-white/70">
            Please read these terms carefully before using Fantasy Predict. By creating an account
            or using our services, you agree to these terms.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="text-white/50">Last Updated: <span className="text-white/80">July 2026</span></span>
            <span className="hidden text-white/20 sm:inline">|</span>
            <span className="text-white/50">Effective Date: <span className="text-white/80">1 July 2026</span></span>
          </div>
        </div>
      </section>

      {/* =============================================================
          MAIN CONTENT — Two-column layout with active TOC
          ============================================================= */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sticky Table of Contents with Active Highlight */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold tracking-[0.14em] text-gold uppercase">
                Contents
              </p>
              <nav className="mt-4 space-y-0.5">
                {TOC.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${isActive
                        ? "bg-gold/10 text-gold font-semibold border-l-2 border-gold pl-4"
                        : "text-muted-foreground hover:bg-gold/5 hover:text-gold"
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Legal Content */}
          <div className="space-y-10">
            {/* 1. INTRODUCTION */}
            <section id="introduction" data-aos="fade-up">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">01</span>
                <h2 className="text-xl font-bold">Introduction</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict provides a football prediction competition platform where users
                  compete by submitting predictions on match outcomes.
                </p>
                <p>
                  By creating an account or using our services, you agree to be bound by these
                  Terms & Conditions. If you do not agree with any part of these terms, you must
                  not use the platform.
                </p>
                <p>
                  These terms govern your use of the Fantasy Predict platform, including all
                  features, leagues, predictions, and payment services.
                </p>
              </div>
            </section>

            {/* 2. ELIGIBILITY */}
            <section id="eligibility" data-aos="fade-up" data-aos-delay="40">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">02</span>
                <h2 className="text-xl font-bold">Eligibility Requirements</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  You must be 18 years or older to create an account on Fantasy Predict.
                </p>
                <p>
                  Users must meet the minimum age requirements applicable in their location
                  before participating in competitions involving entry fees or rewards.
                </p>
                <p>
                  You are responsible for ensuring that your participation in Fantasy Predict
                  complies with all applicable laws in your jurisdiction.
                </p>
              </div>
            </section>

            {/* 3. ACCOUNT REGISTRATION */}
            <section id="accounts" data-aos="fade-up" data-aos-delay="80">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">03</span>
                <h2 className="text-xl font-bold">Account Registration</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  You are responsible for maintaining the security of your account credentials.
                </p>
                <p>
                  You must provide accurate and complete information when creating your account
                  and keep this information up to date.
                </p>
                <p>
                  Each user is permitted to have only one active account on the platform.
                </p>
                <p>
                  You are responsible for all activities that occur under your account.
                </p>
              </div>
            </section>

            {/* 4. PLATFORM USAGE */}
            <section id="platform-usage" data-aos="fade-up" data-aos-delay="120">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">04</span>
                <h2 className="text-xl font-bold">Platform Usage</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict allows users to create and join leagues, submit predictions on
                  football matches, view rankings, and participate in competitions.
                </p>
                <p>
                  Users must use the platform fairly and follow all competition rules published
                  within each league.
                </p>
                <p>
                  The platform is provided for entertainment and competitive purposes only.
                </p>
              </div>
            </section>

            {/* 5. PREDICTIONS & SCORING */}
            <section id="predictions-scoring" data-aos="fade-up" data-aos-delay="160">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">05</span>
                <h2 className="text-xl font-bold">Predictions & Scoring System</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Predictions must be submitted before the official kickoff time of each match.
                  Predictions submitted after the deadline will not be accepted.
                </p>
                <p>
                  Once a match locks, predictions cannot be edited, modified, or withdrawn.
                </p>
                <p>
                  Points are awarded based on prediction accuracy using the following system:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong className="text-foreground">Exact score:</strong> 5 points</li>
                  <li><strong className="text-foreground">Close (correct goal margin):</strong> 3 points</li>
                  <li><strong className="text-foreground">Correct outcome:</strong> 2 points</li>
                  <li><strong className="text-foreground">Wrong:</strong> 0 points</li>
                </ul>
                <p>
                  Full scoring rules are published within each league. Fantasy Predict reserves the right to define and update scoring systems where necessary, with reasonable notice to users.
                </p>
              </div>
            </section>

            {/* 6. LEAGUES */}
            <section id="leagues" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">06</span>
                <h2 className="text-xl font-bold">Leagues & Competitions</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict may provide different types of leagues, including free leagues,
                  public monetized leagues, and private leagues created by users.
                </p>
                <p>
                  <strong className="text-foreground">Public Monetized Leagues:</strong> Public
                  monetized leagues are created and managed by Fantasy Predict. Entry fees,
                  prize structures, and participation requirements are determined by the platform.
                </p>
                <p>
                  <strong className="text-foreground">Private Leagues:</strong> Users may create
                  private leagues where they can define participation settings, including entry
                  fees and prize distribution, subject to Fantasy Predict's platform guidelines
                  and rules.
                </p>
                <p>
                  League creators are responsible for managing their leagues in accordance with
                  platform rules.
                </p>
              </div>
            </section>

            {/* 7. PAYMENTS & WALLET */}
            <section id="payments-wallet" data-aos="fade-up" data-aos-delay="240">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">07</span>
                <h2 className="text-xl font-bold">Payments & Wallet Services</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Payments are only required when users participate in leagues that require
                  an entry fee. Account registration and access to the Fantasy Predict
                  dashboard do not require payment.
                </p>
                <p>
                  Entry fees for paid leagues are charged from your wallet at the point of
                  joining a league.
                </p>
                <p>
                  Payments are processed through approved third-party payment providers
                  integrated with the platform.
                </p>
                <p>
                  Your wallet balance can be used for league entry fees and may receive
                  prize winnings. Withdrawals are subject to platform withdrawal rules.
                </p>
                <p>
                  Fantasy Predict is not a financial institution and does not provide
                  banking or financial services.
                </p>
              </div>
            </section>

            {/* 8. REWARDS */}
            <section id="rewards" data-aos="fade-up" data-aos-delay="280">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">08</span>
                <h2 className="text-xl font-bold">Rewards & Prize Distribution</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Users earn rewards by performing well in eligible leagues based on the
                  announced prize structure.
                </p>
                <p>
                  Prize information is displayed within the league details before participation.
                </p>
                <p>
                  Prize distribution happens after the league concludes and results are verified.
                  Winners are determined according to the rules published in each league.
                </p>
                <p>
                  Fantasy Predict reserves the right to verify results and eligibility before
                  processing prize distributions.
                </p>
              </div>
            </section>

            {/* 9. USER RESPONSIBILITIES */}
            <section id="user-responsibilities" data-aos="fade-up" data-aos-delay="320">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">09</span>
                <h2 className="text-xl font-bold">User Responsibilities</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>Users agree not to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Manipulate results or attempt to influence match outcomes</li>
                  <li>Create fraudulent accounts or impersonate others</li>
                  <li>Abuse the platform or its features</li>
                  <li>Attempt unauthorized access to the platform or other users' accounts</li>
                  <li>Engage in any activity that disrupts the platform's operation</li>
                </ul>
              </div>
            </section>

            {/* 10. PROHIBITED ACTIVITIES */}
            <section id="prohibited-activities" data-aos="fade-up" data-aos-delay="360">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">10</span>
                <h2 className="text-xl font-bold">Prohibited Activities</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>The following activities are strictly prohibited on Fantasy Predict:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Cheating or collusion with other users to manipulate outcomes</li>
                  <li>Automated prediction submission using bots or scripts</li>
                  <li>Fraudulent transactions or money laundering</li>
                  <li>Harassment, abuse, or offensive behavior toward other users</li>
                  <li>Illegal activities of any kind</li>
                </ul>
                <p>
                  Violation of these prohibitions may result in immediate account suspension
                  and forfeiture of entries and prizes.
                </p>
              </div>
            </section>

            {/* 11. INTELLECTUAL PROPERTY */}
            <section id="intellectual-property" data-aos="fade-up" data-aos-delay="400">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">11</span>
                <h2 className="text-xl font-bold">Intellectual Property Rights</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict owns all intellectual property rights relating to the platform,
                  including but not limited to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Platform design and interface</li>
                  <li>Branding, logos, and trademarks</li>
                  <li>Content and software elements</li>
                </ul>
                <p>
                  Users may not reproduce, distribute, or create derivative works from platform
                  materials without explicit permission from Fantasy Predict.
                </p>
              </div>
            </section>

            {/* 12. PRIVACY */}
            <section id="privacy" data-aos="fade-up" data-aos-delay="440">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">12</span>
                <h2 className="text-xl font-bold">Privacy & Data Protection</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  User information is collected, stored, and processed in accordance with our
                  Privacy Policy.
                </p>
                <p>
                  By using the platform, you consent to the collection and use of your
                  information as described in the Privacy Policy.
                </p>
                <p>
                  <Link href="/privacy" className="text-gold hover:underline">
                    View our Privacy Policy
                  </Link>
                </p>
              </div>
            </section>

            {/* 13. SERVICE AVAILABILITY */}
            <section id="service-availability" data-aos="fade-up" data-aos-delay="480">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">13</span>
                <h2 className="text-xl font-bold">Service Availability</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict strives to maintain high service availability, but does not
                  guarantee uninterrupted access.
                </p>
                <p>
                  The platform may experience downtime due to maintenance, updates, or technical
                  issues beyond our control.
                </p>
                <p>
                  Users will be notified of planned maintenance where possible.
                </p>
              </div>
            </section>

            {/* 14. TERMINATION */}
            <section id="termination" data-aos="fade-up" data-aos-delay="520">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">14</span>
                <h2 className="text-xl font-bold">Account Suspension & Termination</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict reserves the right to suspend or terminate accounts that
                  violate these terms.
                </p>
                <p>
                  Accounts may be suspended for:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Violating these Terms & Conditions</li>
                  <li>Suspected fraud or abuse</li>
                  <li>Illegal or prohibited activities</li>
                </ul>
                <p>
                  Suspension may result in forfeiture of entry fees and prizes.
                </p>
              </div>
            </section>

            {/* 15. LIABILITY */}
            <section id="liability" data-aos="fade-up" data-aos-delay="560">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">15</span>
                <h2 className="text-xl font-bold">Limitation of Liability</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict is not responsible for:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>External service failures (payment providers, data feeds, etc.)</li>
                  <li>Internet connectivity or network issues</li>
                  <li>Third-party provider interruptions</li>
                  <li>Any indirect or consequential damages</li>
                </ul>
                <p>
                  The platform is provided "as is" and users participate at their own risk.
                </p>
              </div>
            </section>

            {/* 16. CHANGES */}
            <section id="changes" data-aos="fade-up" data-aos-delay="600">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">16</span>
                <h2 className="text-xl font-bold">Changes To Terms</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict reserves the right to update these Terms & Conditions as the
                  platform evolves.
                </p>
                <p>
                  Users will be notified of significant changes where required by applicable law.
                </p>
                <p>
                  Continued use of the platform after changes constitutes acceptance of the
                  updated terms.
                </p>
              </div>
            </section>

            {/* 17. CONTACT */}
            <section id="contact" data-aos="fade-up" data-aos-delay="640">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">17</span>
                <h2 className="text-xl font-bold">Contact Information</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  If you have any questions about these terms, please contact us:
                </p>
                <p>
                  <a
                    href="mailto:support@fantasypredict.com"
                    className="text-gold hover:underline"
                  >
                    support@fantasypredict.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* =============================================================
          FINAL CTA
          ============================================================= */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Need Help Understanding Our Terms?</h2>
          <p className="mt-3 max-w-xl mx-auto text-sm text-muted-foreground">
            Our support team is here to help clarify any questions you may have.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/help">Visit Help Center</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}