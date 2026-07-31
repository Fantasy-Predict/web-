import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact Support — Fantasy Predict",
  description:
    "Get in touch with the Fantasy Predict team for account help, payment issues, league support, and more.",
  openGraph: {
    title: "Contact Support — Fantasy Predict",
    description:
      "Get in touch with the Fantasy Predict team for account help, payment issues, league support, and more.",
  },
};

// ============================================================
// DATA
// ============================================================

const CONTACT_OPTIONS = [
  {
    title: "Email Support",
    description: "Get assistance through email support.",
    detail: "support@fantasypredict.com",
    action: "Send Email",
    href: "mailto:support@fantasypredict.com",
  },
  {
    title: "Live Chat",
    description: "Get quick answers from our support team.",
    status: "Available",
    statusColor: "bg-success",
    action: "Start Chat",
    href: "#",
  },
  {
    title: "Help Center",
    description: "Find quick answers to common questions.",
    action: "Visit Help Center",
    href: "/help",
  },
  {
    title: "Community Support",
    description: "Connect with other Fantasy Predict users.",
    action: "Join Community",
    href: "#",
  },
];

const SUPPORT_INFO = [
  {
    title: "Response Time",
    description: "We usually respond within 24 hours.",
  },
  {
    title: "Secure Support",
    description: "Your account information is handled securely.",
  },
  {
    title: "Football Community",
    description: "We're committed to creating the best prediction experience for football fans.",
  },
];

const SUBJECT_OPTIONS = [
  "Account Issue",
  "Payment Issue",
  "League Support",
  "Prediction Issue",
  "Technical Problem",
  "Feedback",
  "Other",
];

// ============================================================
// PAGE COMPONENT
// ============================================================

export default function ContactPage() {
  return (
    <PublicLayout>
      {/* =============================================================
          HERO — Minimal, welcoming
          ============================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center sm:py-20 lg:py-24 lg:px-8">
          <Badge variant="outline" className="border-primary/40 text-primary">Contact Us</Badge>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            We're Here To Help
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-muted-foreground">
            Whether you need help with your account, payments, leagues, or anything else,
            our support team is ready to assist you.
          </p>
        </div>
      </section>

      {/* =============================================================
          CONTACT OPTIONS
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Ways To Reach Us</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Choose the option that works best for you.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_OPTIONS.map((option, i) => (
              <Card
                key={option.title}
                className="gap-0 border-border p-6 text-center shadow-[var(--shadow-card)] transition-all hover:border-primary/30 hover:shadow-[var(--shadow-elevated)]"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <h3 className="text-base font-semibold">{option.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                {option.detail && (
                  <p className="mt-1 text-sm font-medium text-primary">{option.detail}</p>
                )}
                {option.status && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${option.statusColor}`} />
                    <span className="text-xs text-muted-foreground">{option.status}</span>
                  </div>
                )}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                >
                  <Link href={option.href}>{option.action}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          CONTACT FORM
          ============================================================= */}
      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <div className="text-center" data-aos="fade-up">
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Get In Touch</p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Send Us A Message</h2>
          <p className="mt-2 max-w-xl mx-auto text-sm text-muted-foreground">
            Fill in the form below and our team will get back to you as soon as possible.
          </p>
        </div>

        <form className="mt-8 space-y-5" data-aos="fade-up" data-aos-delay="100">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium">
              Subject
            </label>
            <select
              id="subject"
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select a subject</option>
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              placeholder="Tell us how we can help…"
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Submit Request
          </Button>
        </form>
      </section>

      {/* =============================================================
          SUPPORT INFORMATION
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Why Trust Us</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Support You Can Count On</h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {SUPPORT_INFO.map((item, i) => (
              <Card
                key={item.title}
                className="gap-0 border-border p-6 text-center shadow-[var(--shadow-card)]"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          FAQ REDIRECT
          ============================================================= */}
      <section className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <Card
          className="gap-0 border-gold/20 bg-card p-10 text-center shadow-[var(--shadow-card)] sm:p-12"
          data-aos="zoom-in"
        >
          <h2 className="text-2xl font-bold sm:text-3xl">Looking For Quick Answers?</h2>
          <p className="mt-3 max-w-xl mx-auto text-sm text-muted-foreground">
            Visit our Help Center for guides and frequently asked questions.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/help">Visit Help Center</Link>
          </Button>
        </Card>
      </section>

      {/* =============================================================
          FINAL CTA
          ============================================================= */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
          <Card
            className="items-center gap-0 border-primary/30 bg-card p-10 text-center sm:p-14"
            data-aos="zoom-in"
          >
            <h2 className="max-w-xl mx-auto text-2xl font-bold sm:text-3xl">
              Ready To Join The Competition?
            </h2>
            <p className="mt-3 max-w-lg mx-auto text-sm leading-relaxed text-muted-foreground">
              Create your league or join an existing one today.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
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