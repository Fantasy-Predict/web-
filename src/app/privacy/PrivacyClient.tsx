"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================================
// TABLE OF CONTENTS
// ============================================================

const TOC = [
  { id: "introduction", label: "Introduction" },
  { id: "information-collected", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "payments", label: "Payments & Financial Information" },
  { id: "cookies-analytics", label: "Cookies & Analytics" },
  { id: "data-sharing", label: "Data Sharing" },
  { id: "data-security", label: "Data Security" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes", label: "Changes to this Policy" },
  { id: "contact", label: "Contact Us" },
];

// ============================================================
// CLIENT COMPONENT
// ============================================================

export default function PrivacyClient() {
  const [activeId, setActiveId] = useState<string>(TOC[0].id);

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
          rootMargin: "-20% 0px -60% 0px",
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
          HERO — Dark, privacy-focused, premium
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
          <Badge variant="outline" className="border-gold/40 text-gold">Privacy</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-white/70">
            Your privacy matters to us. This Privacy Policy explains what information we collect,
            how we use it, and the choices you have regarding your personal data while using
            Fantasy Predict.
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
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                        isActive
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

          {/* Main Content */}
          <div className="space-y-10">
            {/* 1. INTRODUCTION */}
            <section id="introduction" data-aos="fade-up">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">01</span>
                <h2 className="text-xl font-bold">Introduction</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict is committed to protecting your privacy and handling your
                  personal information responsibly.
                </p>
                <p>
                  This Privacy Policy explains how we collect, use, store, and protect your
                  information when you use the Fantasy Predict platform.
                </p>
                <p>
                  By using Fantasy Predict, you agree to the collection and use of information
                  in accordance with this policy.
                </p>
              </div>
            </section>

            {/* 2. INFORMATION WE COLLECT */}
            <section id="information-collected" data-aos="fade-up" data-aos-delay="40">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">02</span>
                <h2 className="text-xl font-bold">Information We Collect</h2>
              </div>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground">Personal Information</h4>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li>Full Name</li>
                    <li>Email Address</li>
                    <li>Username</li>
                    <li>Country</li>
                    <li>Profile Picture (if applicable)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Account Information</h4>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li>Login credentials and authentication information</li>
                    <li>Notification preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Activity Information</h4>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li>Predictions submitted</li>
                    <li>Pools joined and created</li>
                    <li>Rankings and points</li>
                    <li>Match activity and participation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Device & Technical Information</h4>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1">
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>IP Address</li>
                    <li>Operating System</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. HOW WE USE YOUR INFORMATION */}
            <section id="how-we-use" data-aos="fade-up" data-aos-delay="80">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">03</span>
                <h2 className="text-xl font-bold">How We Use Your Information</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>We use your information to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Create and manage user accounts</li>
                   <li>Process pool participation and predictions</li>
                  <li>Display leaderboards and rankings</li>
                  <li>Improve platform performance and user experience</li>
                  <li>Send important notifications and updates</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Respond to support requests and inquiries</li>
                </ul>
              </div>
            </section>

            {/* 4. PAYMENTS & FINANCIAL INFORMATION */}
            <section id="payments" data-aos="fade-up" data-aos-delay="120">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">04</span>
                <h2 className="text-xl font-bold">Payments & Financial Information</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict does not store sensitive payment card information directly
                  on our servers.
                </p>
                <p>
                  All payments — including deposits, withdrawals, and entry fee payments —
                  are processed securely through approved third-party payment providers.
                </p>
                <p>
                  Payment information is handled in accordance with the security standards
                  of our payment partners.
                </p>
              </div>
            </section>

            {/* 5. COOKIES & ANALYTICS */}
            <section id="cookies-analytics" data-aos="fade-up" data-aos-delay="160">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">05</span>
                <h2 className="text-xl font-bold">Cookies & Analytics</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Keep you signed in to your account</li>
                  <li>Remember your preferences and settings</li>
                  <li>Improve platform performance</li>
                  <li>Understand how users interact with the platform</li>
                </ul>
                <p>
                  You can manage your cookie preferences through your browser settings.
                </p>
              </div>
            </section>

            {/* 6. DATA SHARING */}
            <section id="data-sharing" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">06</span>
                <h2 className="text-xl font-bold">Data Sharing</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                   Fantasy Predict does not sell users&apos; personal information to third parties.
                </p>
                <p>
                  We may share your information with trusted service providers who assist us
                  in operating the platform, including:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Payment processors</li>
                  <li>Authentication services</li>
                  <li>Email service providers</li>
                </ul>
                <p>
                  We may also disclose information when required by law or to protect the
                  rights and safety of Fantasy Predict and its users.
                </p>
              </div>
            </section>

            {/* 7. DATA SECURITY */}
            <section id="data-security" data-aos="fade-up" data-aos-delay="240">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">07</span>
                <h2 className="text-xl font-bold">Data Security</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  We implement industry-standard security measures to protect your
                  information, including:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Secure connections (HTTPS)</li>
                  <li>Authentication protocols</li>
                  <li>Access controls and permissions</li>
                  <li>Regular security reviews and updates</li>
                </ul>
                <p>
                  While we take security seriously, no system is completely secure. We
                  encourage you to protect your account credentials and use strong passwords.
                </p>
              </div>
            </section>

            {/* 8. DATA RETENTION */}
            <section id="data-retention" data-aos="fade-up" data-aos-delay="280">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">08</span>
                <h2 className="text-xl font-bold">Data Retention</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  We retain your information for as long as your account is active or as
                  needed to provide you with our services.
                </p>
                <p>
                  We may also retain certain information for legitimate business purposes
                  or to comply with legal obligations, even after account closure.
                </p>
                <p>
                  You may request deletion of your personal data at any time.
                </p>
              </div>
            </section>

            {/* 9. YOUR RIGHTS */}
            <section id="your-rights" data-aos="fade-up" data-aos-delay="320">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">09</span>
                <h2 className="text-xl font-bold">Your Rights</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Access the personal information we hold about you</li>
                  <li>Update and correct your profile information</li>
                  <li>Request deletion of your account and personal data</li>
                  <li>Manage your communication preferences</li>
                  <li>Withdraw consent for data processing where applicable</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the information
                  provided below.
                </p>
              </div>
            </section>

            {/* 10. THIRD-PARTY SERVICES */}
            <section id="third-party" data-aos="fade-up" data-aos-delay="360">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">10</span>
                <h2 className="text-xl font-bold">Third-Party Services</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict uses trusted third-party services to deliver our platform,
                  including:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Payment processing (Paystack)</li>
                  <li>Authentication services (Google Sign-In)</li>
                  <li>Email delivery providers</li>
                  <li>Sports data providers</li>
                </ul>
                <p>
                  These third-party services have their own privacy policies and terms.
                  We encourage you to review them where applicable.
                </p>
              </div>
            </section>

            {/* 11. CHILDREN'S PRIVACY */}
            <section id="childrens-privacy" data-aos="fade-up" data-aos-delay="400">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">11</span>
                 <h2 className="text-xl font-bold">Children&apos;s Privacy</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Fantasy Predict is not intended for use by children below the minimum
                  age required for participation in competitions involving entry fees or rewards.
                </p>
                <p>
                  We do not knowingly collect personal information from children. If you
                  believe a child has provided us with personal information, please contact
                  us so we can take appropriate action.
                </p>
              </div>
            </section>

            {/* 12. CHANGES TO THIS POLICY */}
            <section id="changes" data-aos="fade-up" data-aos-delay="440">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">12</span>
                <h2 className="text-xl font-bold">Changes to this Privacy Policy</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in
                  our practices or legal requirements.
                </p>
                <p>
                  Users will be notified of significant changes where appropriate, and the
                  updated policy will be posted on this page with a revised date.
                </p>
                <p>
                  We encourage you to review this Privacy Policy periodically.
                </p>
              </div>
            </section>

            {/* 13. CONTACT US */}
            <section id="contact" data-aos="fade-up" data-aos-delay="480">
              <div className="flex items-center gap-4 border-b border-gold/20 pb-3">
                <span className="text-xs font-bold tracking-[0.18em] text-gold">13</span>
                <h2 className="text-xl font-bold">Contact Us</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy
                  Policy or your personal information, please contact us:
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
          FINAL TRUST SECTION — "Your Privacy Matters"
          ============================================================= */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center lg:px-8">
          <Badge variant="outline" className="border-gold/40 text-gold">Trust</Badge>
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Your Privacy Matters</h2>
          <p className="mt-3 max-w-xl mx-auto text-sm leading-relaxed text-muted-foreground">
            We are committed to protecting your information and maintaining a secure,
            transparent, and trustworthy platform for every Fantasy Predict user.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold/90">
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/terms">View Terms & Conditions</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}