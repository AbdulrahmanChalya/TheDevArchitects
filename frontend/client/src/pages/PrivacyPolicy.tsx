import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import {
  Shield,
  Database,
  Share2,
  CreditCard,
  Cookie,
  Clock,
  UserCheck,
  Lock,
  Baby,
  RefreshCw,
  Mail,
  Printer,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS = [
  { id: "introduction",        label: "Introduction",                icon: Shield },
  { id: "information",         label: "Information We Collect",      icon: Database },
  { id: "usage",               label: "How We Use Your Information", icon: UserCheck },
  { id: "sharing",             label: "Sharing Your Information",    icon: Share2 },
  { id: "payments",            label: "Payment Data",                icon: CreditCard },
  { id: "cookies",             label: "Cookies & Tracking",          icon: Cookie },
  { id: "retention",           label: "Data Retention",              icon: Clock },
  { id: "rights",              label: "Your Rights",                 icon: UserCheck },
  { id: "security",            label: "Data Security",               icon: Lock },
  { id: "children",            label: "Children's Privacy",          icon: Baby },
  { id: "changes",             label: "Policy Changes",              icon: RefreshCw },
  { id: "contact",             label: "Contact Us",                  icon: Mail },
];

const LAST_UPDATED = "July 1, 2026";
const VERSION = "2.1";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ id, icon: Icon, children }: { id: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-foreground mb-4 scroll-mt-24"
    >
      <span className="p-2 rounded-lg bg-primary/10 shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </span>
      {children}
    </h2>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>;
}

function InfoTable({ rows }: { rows: { category: string; examples: string; purpose: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border mt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium text-foreground w-1/4">Category</th>
            <th className="px-4 py-3 font-medium text-foreground w-2/5">Examples</th>
            <th className="px-4 py-3 font-medium text-foreground">Purpose</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.category} className="bg-card hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{r.category}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.examples}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm text-muted-foreground leading-relaxed mt-4">
      <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

function RightsBadge({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-foreground text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("introduction");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Highlight TOC entry as sections scroll into view
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-card border text-xs font-medium px-3 py-1 rounded-full mb-3 text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Version {VERSION}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground">
                Last updated: <span className="font-medium text-foreground">{LAST_UPDATED}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 self-start md:self-auto"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>

          {/* Quick summary bar */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "We never sell your data", sub: "Your information is not sold to third parties." },
              { label: "You control your data", sub: "Request access, correction, or deletion anytime." },
              { label: "Payments are secure", sub: "All payments are handled by Stripe (PCI-DSS Level 1)." },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-6 py-14">
        <div className="flex gap-12">

          {/* Sticky TOC — hidden on mobile */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                On this page
              </p>
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    activeSection === id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          {/* Article */}
          <article className="flex-1 min-w-0 space-y-14 max-w-3xl">

            {/* 1. Introduction */}
            <section>
              <SectionHeading id="introduction" icon={Shield}>Introduction</SectionHeading>
              <Prose>
                <p>
                  GetawayHub ("we", "us", or "our") operates the travel booking platform accessible at{" "}
                  <span className="font-medium text-foreground">getawayhub.com</span>. This Privacy
                  Policy explains what personal information we collect, why we collect it, and how
                  you can exercise your rights over it.
                </p>
                <p>
                  By using our services you agree to the practices described in this policy. If you
                  do not agree, please discontinue use of our platform.
                </p>
                <p>
                  This policy applies to all users of the GetawayHub website and mobile experience,
                  including visitors who browse without an account, registered users, and travelers
                  who complete a booking through our platform.
                </p>
              </Prose>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <SectionHeading id="information" icon={Database}>Information We Collect</SectionHeading>
              <Prose>
                <p>We collect information you provide directly, data generated by your use of our services, and information from trusted third parties.</p>
              </Prose>
              <InfoTable
                rows={[
                  {
                    category: "Account Data",
                    examples: "Full name, email address, password (hashed), profile photo",
                    purpose: "Create and manage your account, authenticate sign-ins",
                  },
                  {
                    category: "Booking Data",
                    examples: "Traveler names, passport/ID details, travel dates, room/seat preferences",
                    purpose: "Complete and manage reservations with airlines and hotels",
                  },
                  {
                    category: "Payment Data",
                    examples: "Card last four digits, billing address, transaction ID",
                    purpose: "Process payments securely via Stripe",
                  },
                  {
                    category: "Usage Data",
                    examples: "Pages visited, search queries, destination clicks, session duration",
                    purpose: "Improve product features and personalize recommendations",
                  },
                  {
                    category: "Device & Technical Data",
                    examples: "IP address, browser type, OS, device ID, timezone",
                    purpose: "Fraud prevention, security, and compatibility",
                  },
                  {
                    category: "Communications",
                    examples: "Support messages, feedback forms, email correspondence",
                    purpose: "Resolve support requests and improve service quality",
                  },
                ]}
              />
              <Callout>
                We collect only the information necessary to provide our services. We do not collect
                sensitive categories of personal data (e.g. health, religion, ethnicity) unless you
                explicitly provide it for a specific travel requirement.
              </Callout>
            </section>

            {/* 3. How We Use Your Information */}
            <section>
              <SectionHeading id="usage" icon={UserCheck}>How We Use Your Information</SectionHeading>
              <Prose>
                <p>We use personal data for the following purposes, each with a lawful basis under applicable privacy law:</p>
                <ul className="space-y-2 mt-2">
                  {[
                    ["Service delivery", "Processing bookings, sending confirmation emails, enabling account access."],
                    ["Personalization", "Showing relevant destination recommendations and tailoring search results based on your history."],
                    ["AI-powered features", "Our AI assistant uses your search context (not stored long-term) to generate vacation package suggestions."],
                    ["Customer support", "Responding to inquiries and resolving issues you raise through our Help Center or contact form."],
                    ["Security & fraud prevention", "Detecting suspicious activity, protecting accounts, and complying with legal obligations."],
                    ["Marketing (opt-in only)", "Sending travel inspiration and special offers via email if you have subscribed. You can unsubscribe at any time."],
                    ["Analytics & improvement", "Understanding how users interact with our product to improve features and fix issues."],
                  ].map(([title, desc]) => (
                    <li key={title as string} className="flex gap-2">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span><span className="font-medium text-foreground">{title}:</span> {desc}</span>
                    </li>
                  ))}
                </ul>
              </Prose>
            </section>

            {/* 4. Sharing */}
            <section>
              <SectionHeading id="sharing" icon={Share2}>Sharing Your Information</SectionHeading>
              <Prose>
                <p>
                  We do not sell, rent, or trade your personal information. We share data only as
                  necessary to deliver our services or when legally required.
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      name: "Travel Suppliers",
                      detail: "Airlines and hotels receive traveler names and booking details to fulfill your reservation.",
                    },
                    {
                      name: "Stripe",
                      detail: "Our payment processor receives billing information to authorize and capture payments securely.",
                    },
                    {
                      name: "Oxylabs",
                      detail: "Our data provider is used to fetch live hotel and flight availability from Expedia. No personal data is sent.",
                    },
                    {
                      name: "Google Places & Mapbox",
                      detail: "Used to render maps and autocomplete destination searches. Only location query strings are shared.",
                    },
                    {
                      name: "DeepSeek / OpenAI",
                      detail: "AI models receive anonymized search context to generate vacation package suggestions. No PII is included.",
                    },
                    {
                      name: "Law Enforcement",
                      detail: "We may disclose data when required by a court order, subpoena, or applicable law.",
                    },
                  ].map((item) => (
                    <div key={item.name} className="flex gap-3 p-3 rounded-lg border bg-card">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground text-sm">{item.name}: </span>
                        <span className="text-sm text-muted-foreground">{item.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Prose>
            </section>

            {/* 5. Payment Data */}
            <section>
              <SectionHeading id="payments" icon={CreditCard}>Payment Data</SectionHeading>
              <Prose>
                <p>
                  All payment transactions are processed by{" "}
                  <span className="font-medium text-foreground">Stripe, Inc.</span>, a PCI-DSS
                  Level 1 certified payment processor. GetawayHub never receives, stores, or
                  transmits your full card number, CVV, or PIN.
                </p>
                <p>
                  We retain only a tokenized reference (e.g., last four digits, card brand,
                  expiry month/year) for displaying your saved payment methods. This token cannot
                  be used to initiate a charge without your explicit authorization.
                </p>
                <p>
                  For details on how Stripe handles your data, see{" "}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    stripe.com/privacy
                  </a>
                  .
                </p>
              </Prose>
              <Callout>
                Every payment page on GetawayHub uses HTTPS (TLS 1.3). Look for the padlock icon in
                your browser's address bar before entering card details.
              </Callout>
            </section>

            {/* 6. Cookies */}
            <section>
              <SectionHeading id="cookies" icon={Cookie}>Cookies & Tracking</SectionHeading>
              <Prose>
                <p>We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how you use our platform.</p>
                <div className="mt-4 overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="px-4 py-3 font-medium text-foreground">Type</th>
                        <th className="px-4 py-3 font-medium text-foreground">Purpose</th>
                        <th className="px-4 py-3 font-medium text-foreground">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        ["Essential", "Authentication, session management, CSRF protection", "Session"],
                        ["Functional", "Saved search preferences, currency/language settings", "1 year"],
                        ["Analytics", "Page view tracking, feature usage (anonymized)", "13 months"],
                        ["Marketing (opt-in)", "Personalized travel offers via email campaigns", "6 months"],
                      ].map(([type, purpose, duration]) => (
                        <tr key={type} className="bg-card hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{type}</td>
                          <td className="px-4 py-3 text-muted-foreground">{purpose}</td>
                          <td className="px-4 py-3 text-muted-foreground">{duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">
                  You can control cookies in your browser settings. Disabling essential cookies
                  will prevent you from staying signed in and may affect booking functionality.
                </p>
              </Prose>
            </section>

            {/* 7. Retention */}
            <section>
              <SectionHeading id="retention" icon={Clock}>Data Retention</SectionHeading>
              <Prose>
                <p>We retain personal data only for as long as necessary:</p>
                <ul className="space-y-2 mt-2">
                  {[
                    ["Account data", "Kept while your account is active. Deleted within 30 days of an account deletion request."],
                    ["Booking records", "Retained for 7 years to comply with tax and financial regulations."],
                    ["Payment records", "Transaction metadata retained for 7 years. Card tokens deleted when you remove a payment method."],
                    ["Support communications", "Retained for 3 years to resolve follow-up issues."],
                    ["Usage & analytics data", "Anonymized after 13 months. Aggregated data may be kept indefinitely."],
                  ].map(([type, detail]) => (
                    <li key={type as string} className="flex gap-2">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span><span className="font-medium text-foreground">{type}:</span> {detail}</span>
                    </li>
                  ))}
                </ul>
              </Prose>
            </section>

            {/* 8. Rights */}
            <section>
              <SectionHeading id="rights" icon={UserCheck}>Your Rights</SectionHeading>
              <Prose>
                <p>
                  Depending on your location, you may have the following rights under GDPR, CCPA,
                  or other applicable privacy laws. To exercise any of these rights, contact us at{" "}
                  <a href="mailto:privacy@getawayhub.com" className="text-primary underline underline-offset-2">
                    privacy@getawayhub.com
                  </a>
                  . We will respond within 30 days.
                </p>
              </Prose>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <RightsBadge label="Right to Access" description="Request a copy of all personal data we hold about you." />
                <RightsBadge label="Right to Rectification" description="Correct inaccurate or incomplete personal data." />
                <RightsBadge label="Right to Erasure" description="Request deletion of your data ('right to be forgotten')." />
                <RightsBadge label="Right to Portability" description="Receive your data in a structured, machine-readable format." />
                <RightsBadge label="Right to Object" description="Object to processing based on legitimate interests or for marketing." />
                <RightsBadge label="Right to Restrict" description="Limit how we use your data while a dispute is resolved." />
                <RightsBadge label="Opt out of Marketing" description="Unsubscribe from promotional emails at any time via the link in any email." />
                <RightsBadge label="California Rights (CCPA)" description="California residents may opt out of the sale of personal data (we do not sell data) and request disclosure of data categories collected." />
              </div>
            </section>

            {/* 9. Security */}
            <section>
              <SectionHeading id="security" icon={Lock}>Data Security</SectionHeading>
              <Prose>
                <p>
                  We implement industry-standard technical and organizational measures to protect
                  your data against unauthorized access, loss, or disclosure:
                </p>
                <ul className="space-y-2 mt-2">
                  {[
                    "All data in transit is encrypted using TLS 1.3.",
                    "Passwords are hashed using bcrypt with a unique salt per user.",
                    "Access to production databases is restricted to authorized personnel only, via role-based access controls.",
                    "We perform regular security reviews and dependency audits.",
                    "Payment data is never stored on our servers — Stripe handles all card data.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3">
                  No system is 100% secure. If you believe your account has been compromised, please
                  contact us immediately at{" "}
                  <a href="mailto:security@getawayhub.com" className="text-primary underline underline-offset-2">
                    security@getawayhub.com
                  </a>
                  .
                </p>
              </Prose>
            </section>

            {/* 10. Children */}
            <section>
              <SectionHeading id="children" icon={Baby}>Children's Privacy</SectionHeading>
              <Prose>
                <p>
                  GetawayHub is not directed at children under the age of 16. We do not knowingly
                  collect personal information from children. If you believe a child has provided
                  us with personal data, please contact us at{" "}
                  <a href="mailto:privacy@getawayhub.com" className="text-primary underline underline-offset-2">
                    privacy@getawayhub.com
                  </a>{" "}
                  and we will delete it promptly.
                </p>
                <p>
                  When booking on behalf of a minor traveler, the adult account holder is
                  responsible for providing consent for the use of the minor's data.
                </p>
              </Prose>
            </section>

            {/* 11. Changes */}
            <section>
              <SectionHeading id="changes" icon={RefreshCw}>Policy Changes</SectionHeading>
              <Prose>
                <p>
                  We may update this Privacy Policy from time to time. When we make material
                  changes we will notify you by:
                </p>
                <ul className="space-y-1.5 mt-2">
                  <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Sending an email to your registered address</span></li>
                  <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Displaying a banner on the website at least 14 days before the change takes effect</span></li>
                  <li className="flex gap-2"><ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>Updating the "Last updated" date at the top of this page</span></li>
                </ul>
                <p className="mt-3">
                  Continued use of GetawayHub after the effective date constitutes acceptance of the
                  revised policy. Previous versions are available on request.
                </p>
              </Prose>
            </section>

            {/* 12. Contact */}
            <section>
              <SectionHeading id="contact" icon={Mail}>Contact Us</SectionHeading>
              <Prose>
                <p>
                  For any questions, data requests, or privacy concerns, please reach out to our
                  Privacy team:
                </p>
              </Prose>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "General Privacy Enquiries",
                    email: "privacy@getawayhub.com",
                    detail: "Data access, deletion, and policy questions",
                  },
                  {
                    title: "Security Issues",
                    email: "security@getawayhub.com",
                    detail: "Report a vulnerability or suspected breach",
                  },
                ].map((item) => (
                  <div key={item.title} className="p-5 rounded-xl border bg-card space-y-1">
                    <p className="font-semibold text-foreground text-sm">{item.title}</p>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-primary text-sm underline underline-offset-2 block"
                    >
                      {item.email}
                    </a>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-5 rounded-xl border bg-card">
                <p className="text-sm font-semibold text-foreground mb-1">Postal address</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  GetawayHub Privacy Team<br />
                  The Dev Architects<br />
                  Toronto, Ontario, Canada
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/help">
                  <span className="inline-flex items-center gap-1.5 text-sm text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                    Visit Help Center
                  </span>
                </Link>
                <a
                  href="mailto:privacy@getawayhub.com"
                  className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:brightness-95 transition"
                >
                  <Mail className="h-4 w-4" />
                  Email Privacy Team
                </a>
              </div>
            </section>

          </article>
        </div>
      </div>

      <Footer />
    </div>
  );
}
