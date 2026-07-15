import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import {
  FileText,
  UserCheck,
  ShieldCheck,
  Plane,
  CreditCard,
  RefreshCw,
  Sparkles,
  Globe,
  Copyright,
  MessageSquare,
  AlertTriangle,
  Scale,
  LogOut,
  Bell,
  Mail,
  Printer,
  ChevronRight,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS = [
  { id: "acceptance",      label: "Acceptance of Terms",          icon: FileText },
  { id: "eligibility",     label: "Eligibility",                  icon: UserCheck },
  { id: "account",         label: "Account Registration",         icon: ShieldCheck },
  { id: "permitted-use",   label: "Permitted & Prohibited Use",   icon: Ban },
  { id: "bookings",        label: "Bookings & Reservations",      icon: Plane },
  { id: "pricing",         label: "Pricing, Fees & Payment",      icon: CreditCard },
  { id: "cancellations",   label: "Cancellations & Refunds",      icon: RefreshCw },
  { id: "ai-content",      label: "AI-Generated Content",         icon: Sparkles },
  { id: "third-party",     label: "Third-Party Services",         icon: Globe },
  { id: "ip",              label: "Intellectual Property",        icon: Copyright },
  { id: "user-content",    label: "User Content",                 icon: MessageSquare },
  { id: "disclaimers",     label: "Disclaimers & Liability",      icon: AlertTriangle },
  { id: "indemnification", label: "Indemnification",              icon: ShieldCheck },
  { id: "disputes",        label: "Disputes & Governing Law",     icon: Scale },
  { id: "termination",     label: "Termination",                  icon: LogOut },
  { id: "changes",         label: "Changes to Terms",             icon: Bell },
  { id: "contact",         label: "Contact Us",                   icon: Mail },
];

const LAST_UPDATED = "July 1, 2026";
const VERSION = "1.3";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({
  id,
  icon: Icon,
  children,
}: {
  id: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
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
  return (
    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  );
}

function Callout({
  icon: Icon = AlertTriangle,
  variant = "default",
  children,
}: {
  icon?: React.ElementType;
  variant?: "default" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    default: "border-primary/20 bg-primary/5 text-muted-foreground",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  }[variant];
  const iconColor = {
    default: "text-primary",
    warning: "text-amber-500",
    info: "text-blue-500",
  }[variant];

  return (
    <div className={`flex gap-3 p-4 rounded-xl border text-sm leading-relaxed mt-4 ${styles}`}>
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
      <div>{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: (string | [string, string])[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          {Array.isArray(item) ? (
            <span>
              <span className="font-medium text-foreground">{item[0]}:</span> {item[1]}
            </span>
          ) : (
            <span>{item}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function HighlightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState("acceptance");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* ── Hero ── */}
      <section className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-card border text-xs font-medium px-3 py-1 rounded-full mb-3 text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Version {VERSION}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Terms of Service
              </h1>
              <p className="text-muted-foreground">
                Last updated:{" "}
                <span className="font-medium text-foreground">{LAST_UPDATED}</span>
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

          {/* Key points bar */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "You must be 18 or older",
                sub: "Or have parental consent to use GetawayHub.",
              },
              {
                label: "Bookings are binding",
                sub: "Confirmed reservations are subject to supplier cancellation policies.",
              },
              {
                label: "AI content is informational",
                sub: "AI-generated packages are suggestions, not guaranteed offers.",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="container mx-auto px-4 md:px-6 py-14">
        <div className="flex gap-12">

          {/* Sticky TOC */}
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

            {/* 1. Acceptance */}
            <section>
              <SectionHeading id="acceptance" icon={FileText}>
                Acceptance of Terms
              </SectionHeading>
              <Prose>
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement between
                  you and <span className="font-medium text-foreground">GetawayHub</span>, operated
                  by The Dev Architects ("we", "us", or "our"), governing your access to and use of
                  the GetawayHub website and all related services (collectively, the "Services").
                </p>
                <p>
                  By accessing or using our Services — including browsing the site, creating an
                  account, searching for travel, or completing a booking — you confirm that you have
                  read, understood, and agree to be bound by these Terms and our{" "}
                  <Link href="/privacy">
                    <span className="text-primary underline underline-offset-2 cursor-pointer">
                      Privacy Policy
                    </span>
                  </Link>
                  , which is incorporated herein by reference.
                </p>
                <p>
                  If you do not agree to these Terms, you must immediately discontinue use of the
                  Services.
                </p>
              </Prose>
            </section>

            {/* 2. Eligibility */}
            <section>
              <SectionHeading id="eligibility" icon={UserCheck}>
                Eligibility
              </SectionHeading>
              <Prose>
                <p>To use our Services you must:</p>
                <BulletList
                  items={[
                    "Be at least 18 years of age, or the age of majority in your jurisdiction.",
                    "Have the legal capacity to enter into a binding contract.",
                    "Not be prohibited from using the Services under any applicable law.",
                    "Provide accurate, current, and complete information when registering or booking.",
                  ]}
                />
                <p className="mt-3">
                  Users between 16 and 18 years of age may use the Services with the verifiable
                  consent of a parent or legal guardian, who assumes full responsibility for the
                  minor's use and any transactions made.
                </p>
              </Prose>
              <Callout icon={AlertTriangle} variant="warning">
                Providing false information about your age or identity to bypass eligibility
                requirements may result in immediate account termination and cancellation of any
                associated bookings without refund.
              </Callout>
            </section>

            {/* 3. Account */}
            <section>
              <SectionHeading id="account" icon={ShieldCheck}>
                Account Registration & Security
              </SectionHeading>
              <Prose>
                <p>
                  Certain features of our Services, including completing bookings, require you to
                  create an account. You agree to:
                </p>
                <BulletList
                  items={[
                    "Provide accurate and complete registration information and keep it up to date.",
                    "Choose a strong, unique password and not share it with any third party.",
                    "Notify us immediately at security@getawayhub.com if you suspect unauthorized account access.",
                    "Accept full responsibility for all activity occurring under your account.",
                    "Not create more than one account per person without prior written consent.",
                  ]}
                />
                <p className="mt-3">
                  We reserve the right to suspend or terminate accounts that violate these Terms,
                  display suspicious activity, or remain inactive for more than 24 consecutive
                  months.
                </p>
              </Prose>
            </section>

            {/* 4. Permitted & Prohibited Use */}
            <section>
              <SectionHeading id="permitted-use" icon={Ban}>
                Permitted & Prohibited Use
              </SectionHeading>
              <Prose>
                <p className="font-medium text-foreground">You may use GetawayHub to:</p>
                <BulletList
                  items={[
                    "Search for and compare travel options including flights, hotels, and attractions.",
                    "Book travel on behalf of yourself or other travelers with their consent.",
                    "Access AI-generated vacation package suggestions for planning purposes.",
                    "Manage, view, and cancel existing bookings through your account.",
                    "Contact our support team via the Help Center.",
                  ]}
                />
                <p className="font-medium text-foreground mt-4">You may not:</p>
                <BulletList
                  items={[
                    "Use automated tools, bots, scrapers, or crawlers to access our Services without prior written authorization.",
                    "Attempt to reverse engineer, decompile, or extract source code from our platform.",
                    "Use the Services for any unlawful purpose, including fraudulent bookings or identity theft.",
                    "Resell, sublicense, or commercially exploit access to our Services without authorization.",
                    "Impersonate any person, entity, or GetawayHub employee.",
                    "Upload or transmit malicious code, viruses, or any content that disrupts our Services.",
                    "Circumvent, disable, or interfere with security features of the Services.",
                    "Harvest or collect user data from the platform.",
                  ]}
                />
              </Prose>
              <Callout icon={AlertTriangle} variant="warning">
                Violations of prohibited use may result in immediate termination, legal action, and
                reporting to relevant authorities.
              </Callout>
            </section>

            {/* 5. Bookings */}
            <section>
              <SectionHeading id="bookings" icon={Plane}>
                Bookings & Reservations
              </SectionHeading>
              <Prose>
                <p>
                  GetawayHub operates as a <span className="font-medium text-foreground">travel intermediary</span>.
                  We facilitate bookings on your behalf with third-party travel suppliers (airlines, hotel
                  chains, and property managers). The following terms apply to all bookings:
                </p>
                <BulletList
                  items={[
                    ["Booking confirmation", "A booking is confirmed only upon receipt of a confirmation email and successful payment. Displaying search results does not constitute a reservation."],
                    ["Supplier terms", "Each booking is subject to the individual supplier's own terms, conditions, and cancellation policies, which are displayed at checkout."],
                    ["Traveler accuracy", "You are responsible for ensuring all traveler names, dates, and details are accurate. Name changes after booking may not be possible and may incur fees."],
                    ["Travel documents", "You are solely responsible for holding valid passports, visas, travel insurance, and any entry requirements for your destination."],
                    ["Third-party systems", "Flight and hotel availability is sourced from live third-party systems. In rare cases, a confirmed booking may be cancelled by the supplier. We will notify you and facilitate a refund or alternative."],
                    ["Group bookings", "Bookings for 10 or more travelers may require direct coordination with our support team and may be subject to separate pricing."],
                  ]}
                />
              </Prose>
              <Callout icon={AlertTriangle} variant="info">
                GetawayHub is not the airline, hotel, or attraction operator. We are not liable for
                service failures by travel suppliers, including flight delays, hotel overbookings, or
                attraction closures.
              </Callout>
            </section>

            {/* 6. Pricing & Payment */}
            <section>
              <SectionHeading id="pricing" icon={CreditCard}>
                Pricing, Fees & Payment
              </SectionHeading>
              <Prose>
                <p>
                  All prices displayed are in the currency shown at the time of search and include
                  applicable taxes and fees unless explicitly stated otherwise.
                </p>
                <BulletList
                  items={[
                    ["Price accuracy", "Prices are sourced from live third-party systems and may change between your initial search and checkout. The final price shown at payment is the binding price."],
                    ["Service fees", "GetawayHub may charge a platform service fee, which will be clearly disclosed before payment is finalized."],
                    ["Currency", "Payments are processed in the currency displayed at checkout. Your bank or card issuer may apply additional conversion fees."],
                    ["Authorization", "By completing a booking, you authorize GetawayHub to charge your payment method for the full amount shown."],
                    ["Failed payments", "If a payment fails, the booking will not be confirmed. You may retry with a different payment method."],
                    ["Promotional pricing", "Promotional or discounted rates are subject to specific conditions and availability. Misuse of promotional codes may result in cancellation."],
                  ]}
                />
                <p className="mt-3">
                  All payments are processed securely through{" "}
                  <span className="font-medium text-foreground">Stripe, Inc.</span> (PCI-DSS Level 1).
                  GetawayHub does not store full card details. See our{" "}
                  <Link href="/privacy">
                    <span className="text-primary underline underline-offset-2 cursor-pointer">Privacy Policy</span>
                  </Link>{" "}
                  for details.
                </p>
              </Prose>
            </section>

            {/* 7. Cancellations & Refunds */}
            <section>
              <SectionHeading id="cancellations" icon={RefreshCw}>
                Cancellations, Changes & Refunds
              </SectionHeading>
              <Prose>
                <p>
                  Cancellation and change policies vary by booking type and supplier. The applicable
                  policy is always shown before checkout and in your confirmation email.
                </p>
                <div className="mt-4 overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="px-4 py-3 font-medium text-foreground">Booking type</th>
                        <th className="px-4 py-3 font-medium text-foreground">Cancellation</th>
                        <th className="px-4 py-3 font-medium text-foreground">Refund timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        ["Free cancellation (hotel)", "Cancel up to 24–48 hrs before check-in", "5–10 business days"],
                        ["Non-refundable (hotel)", "No refund after booking confirmed", "N/A"],
                        ["Flexible fare (flight)", "Cancel before departure for full or partial refund", "5–10 business days"],
                        ["Non-refundable fare (flight)", "No refund; changes may incur airline fees", "N/A"],
                        ["Supplier cancellation", "Full refund issued automatically", "5–10 business days"],
                        ["Force majeure", "Handled case-by-case; contact support", "Varies"],
                      ].map(([type, policy, timeline]) => (
                        <tr key={type} className="bg-card hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{type}</td>
                          <td className="px-4 py-3 text-muted-foreground">{policy}</td>
                          <td className="px-4 py-3 text-muted-foreground">{timeline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">
                  To cancel or modify a booking, visit My Trips in your account or contact our
                  support team via the{" "}
                  <Link href="/help">
                    <span className="text-primary underline underline-offset-2 cursor-pointer">Help Center</span>
                  </Link>
                  .
                </p>
              </Prose>
            </section>

            {/* 8. AI Content */}
            <section>
              <SectionHeading id="ai-content" icon={Sparkles}>
                AI-Generated Content
              </SectionHeading>
              <Prose>
                <p>
                  GetawayHub uses artificial intelligence (DeepSeek, OpenAI) to generate personalized
                  vacation package suggestions, itineraries, and travel recommendations.
                </p>
                <BulletList
                  items={[
                    "AI-generated content is provided for informational and planning purposes only.",
                    "AI suggestions do not constitute confirmed bookings, guaranteed pricing, or guaranteed availability.",
                    "Prices, availability, and itinerary details must be verified at checkout before purchase.",
                    "We do not guarantee the accuracy, completeness, or suitability of AI-generated suggestions for your specific travel needs.",
                    "You should not rely solely on AI-generated recommendations when making travel decisions involving significant cost or personal risk.",
                  ]}
                />
              </Prose>
              <Callout icon={Sparkles} variant="info">
                AI responses may occasionally contain inaccuracies. Always confirm destination entry
                requirements, health advisories, and travel restrictions through official government
                sources before booking.
              </Callout>
            </section>

            {/* 9. Third-Party Services */}
            <section>
              <SectionHeading id="third-party" icon={Globe}>
                Third-Party Services
              </SectionHeading>
              <Prose>
                <p>
                  Our platform integrates third-party services to deliver its functionality. Your use
                  of these services is subject to their own terms and privacy policies:
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      name: "Stripe",
                      role: "Payment processing",
                      url: "stripe.com/terms",
                      detail: "Handles all payment card data. GetawayHub never stores card numbers.",
                    },
                    {
                      name: "Duffel",
                      role: "Flight booking API",
                      url: "duffel.com/legal/terms",
                      detail: "Provides real-time flight inventory and booking capabilities.",
                    },
                    {
                      name: "LiteAPI",
                      role: "Hotel booking API",
                      url: "liteapi.travel/terms",
                      detail: "Provides hotel availability, rates, and reservation management.",
                    },
                    {
                      name: "Google Places",
                      role: "Destination autocomplete & maps",
                      url: "policies.google.com/terms",
                      detail: "Powers destination search suggestions and place details.",
                    },
                    {
                      name: "Mapbox",
                      role: "Interactive maps",
                      url: "mapbox.com/legal/tos",
                      detail: "Renders interactive destination maps within the platform.",
                    },
                    {
                      name: "DeepSeek / OpenAI",
                      role: "AI vacation packages",
                      url: "openai.com/policies",
                      detail: "Generates AI travel suggestions. Anonymized context only; no PII sent.",
                    },
                  ].map((item) => (
                    <div key={item.name} className="flex gap-3 p-3 rounded-lg border bg-card">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground text-sm">{item.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({item.role})</span>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4">
                  GetawayHub is not responsible for the availability, accuracy, or content of
                  third-party services. Links to third-party sites are provided for convenience and
                  do not constitute endorsement.
                </p>
              </Prose>
            </section>

            {/* 10. Intellectual Property */}
            <section>
              <SectionHeading id="ip" icon={Copyright}>
                Intellectual Property
              </SectionHeading>
              <Prose>
                <p>
                  All content, software, design, logos, trademarks, and materials on the GetawayHub
                  platform ("Platform Content") are owned by or licensed to The Dev Architects and
                  are protected by applicable intellectual property laws.
                </p>
                <BulletList
                  items={[
                    "You may not reproduce, distribute, modify, or create derivative works of Platform Content without our express written permission.",
                    "You may not use our trademarks, logos, or brand elements without prior written consent.",
                    "Scraping, data mining, or bulk extraction of Platform Content for commercial use is strictly prohibited.",
                    "Feedback or suggestions you provide to us may be used to improve our Services without obligation or compensation to you.",
                  ]}
                />
                <p className="mt-3">
                  The GetawayHub name, logo, and all related marks are trademarks of The Dev
                  Architects. Nothing in these Terms grants you any right or licence to use them.
                </p>
              </Prose>
            </section>

            {/* 11. User Content */}
            <section>
              <SectionHeading id="user-content" icon={MessageSquare}>
                User Content
              </SectionHeading>
              <Prose>
                <p>
                  If you submit reviews, ratings, feedback, or other content through our platform
                  ("User Content"), you grant GetawayHub a non-exclusive, royalty-free, worldwide,
                  sublicensable licence to use, reproduce, modify, and display that content in
                  connection with our Services.
                </p>
                <p>You represent and warrant that:</p>
                <BulletList
                  items={[
                    "You own or have the rights to submit the User Content.",
                    "The User Content does not infringe any third-party intellectual property, privacy, or other rights.",
                    "The User Content is accurate, not misleading, and complies with applicable law.",
                    "The User Content does not contain offensive, discriminatory, defamatory, or harmful material.",
                  ]}
                />
                <p className="mt-3">
                  We reserve the right to remove User Content that violates these Terms or that
                  we determine, in our sole discretion, is harmful or inappropriate.
                </p>
              </Prose>
            </section>

            {/* 12. Disclaimers & Liability */}
            <section>
              <SectionHeading id="disclaimers" icon={AlertTriangle}>
                Disclaimers & Limitation of Liability
              </SectionHeading>
              <Prose>
                <p className="font-medium text-foreground uppercase text-xs tracking-wide">
                  Disclaimer of warranties
                </p>
                <p>
                  The Services are provided on an "as is" and "as available" basis without any
                  warranties of any kind, either express or implied, including warranties of
                  merchantability, fitness for a particular purpose, or non-infringement.
                </p>
                <p>
                  We do not warrant that the Services will be uninterrupted, error-free, or free
                  from viruses. Travel information, prices, and availability are sourced from
                  third parties and may be inaccurate or outdated.
                </p>
                <p className="font-medium text-foreground uppercase text-xs tracking-wide mt-4">
                  Limitation of liability
                </p>
                <p>
                  To the fullest extent permitted by applicable law, The Dev Architects and its
                  officers, directors, employees, and agents shall not be liable for:
                </p>
                <BulletList
                  items={[
                    "Any indirect, incidental, special, consequential, or punitive damages.",
                    "Loss of profits, data, goodwill, or other intangible losses.",
                    "Service failures, delays, or errors caused by third-party travel suppliers.",
                    "Any travel disruption, injury, illness, loss, or damage arising from a trip booked through our platform.",
                    "Unauthorized access to or alteration of your data by third parties.",
                  ]}
                />
                <p className="mt-3">
                  Our total aggregate liability to you for any claim arising out of or relating to
                  these Terms or your use of the Services shall not exceed the greater of (a) the
                  total amount you paid to GetawayHub in the 12 months preceding the claim, or (b)
                  CAD $100.
                </p>
              </Prose>
              <Callout icon={AlertTriangle} variant="warning">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation
                of liability, so some of the above may not apply to you. Your rights may vary by
                location.
              </Callout>
            </section>

            {/* 13. Indemnification */}
            <section>
              <SectionHeading id="indemnification" icon={ShieldCheck}>
                Indemnification
              </SectionHeading>
              <Prose>
                <p>
                  You agree to defend, indemnify, and hold harmless The Dev Architects, its
                  affiliates, officers, employees, and agents from and against any claims,
                  liabilities, damages, losses, and expenses — including reasonable legal fees —
                  arising out of or in any way connected with:
                </p>
                <BulletList
                  items={[
                    "Your access to or use of the Services.",
                    "Your violation of any provision of these Terms.",
                    "Your infringement of any third-party right, including intellectual property, privacy, or proprietary rights.",
                    "Any fraudulent, negligent, or unlawful act by you in connection with the Services.",
                    "Any User Content you submit to the platform.",
                  ]}
                />
              </Prose>
            </section>

            {/* 14. Disputes & Governing Law */}
            <section>
              <SectionHeading id="disputes" icon={Scale}>
                Dispute Resolution & Governing Law
              </SectionHeading>
              <Prose>
                <p>
                  These Terms are governed by and construed in accordance with the laws of the
                  Province of{" "}
                  <span className="font-medium text-foreground">Ontario, Canada</span>, without
                  regard to its conflict of law provisions.
                </p>
                <p>
                  Before initiating any formal legal proceedings, you agree to first contact us at{" "}
                  <a
                    href="mailto:legal@getawayhub.com"
                    className="text-primary underline underline-offset-2"
                  >
                    legal@getawayhub.com
                  </a>{" "}
                  and allow us a reasonable period (no less than 30 days) to resolve the dispute
                  informally.
                </p>
                <p>
                  If informal resolution fails, any dispute shall be submitted to binding
                  arbitration under the rules of the{" "}
                  <span className="font-medium text-foreground">
                    ADR Institute of Canada
                  </span>, with proceedings to be held in Toronto, Ontario.
                </p>
                <BulletList
                  items={[
                    "You waive any right to a jury trial or to participate in a class-action lawsuit.",
                    "Claims must be brought within 1 year of the event giving rise to the claim.",
                    "The arbitrator's award shall be final and binding, enforceable in any court of competent jurisdiction.",
                  ]}
                />
              </Prose>
              <Callout icon={AlertTriangle} variant="info">
                If you are a consumer in the European Union, you may also have the right to submit a
                complaint to your local consumer protection authority or use the EU Online Dispute
                Resolution platform at{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  ec.europa.eu/consumers/odr
                </a>
                .
              </Callout>
            </section>

            {/* 15. Termination */}
            <section>
              <SectionHeading id="termination" icon={LogOut}>
                Termination
              </SectionHeading>
              <Prose>
                <p>
                  Either party may terminate the relationship under these Terms at any time.
                </p>
                <p className="font-medium text-foreground">By you:</p>
                <BulletList
                  items={[
                    "You may stop using the Services at any time.",
                    "You may request account deletion by contacting privacy@getawayhub.com. Active or upcoming bookings must be resolved before deletion is finalized.",
                  ]}
                />
                <p className="font-medium text-foreground mt-3">By GetawayHub:</p>
                <BulletList
                  items={[
                    "We may suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms.",
                    "We may discontinue or modify the Services at any time with reasonable notice.",
                    "We may terminate accounts with confirmed fraudulent or high-risk activity immediately without notice.",
                  ]}
                />
                <p className="mt-3">
                  Upon termination, your right to access the Services ceases immediately. Sections
                  covering intellectual property, disclaimers, liability, indemnification, and
                  governing law survive termination.
                </p>
              </Prose>
            </section>

            {/* 16. Changes */}
            <section>
              <SectionHeading id="changes" icon={Bell}>
                Changes to Terms
              </SectionHeading>
              <Prose>
                <p>
                  We may update these Terms from time to time to reflect changes in our Services,
                  legal requirements, or business practices. When we make material changes we will:
                </p>
                <BulletList
                  items={[
                    'Update the "Last updated" date at the top of this page.',
                    "Send an email notification to registered users at least 14 days before the changes take effect.",
                    "Display a prominent notice on the platform.",
                  ]}
                />
                <p className="mt-3">
                  Your continued use of the Services after the effective date of the revised Terms
                  constitutes your acceptance of the changes. If you do not agree to the revised
                  Terms, you must stop using the Services before the effective date.
                </p>
                <p>
                  Previous versions of these Terms are available on request by emailing{" "}
                  <a
                    href="mailto:legal@getawayhub.com"
                    className="text-primary underline underline-offset-2"
                  >
                    legal@getawayhub.com
                  </a>
                  .
                </p>
              </Prose>
            </section>

            {/* 17. Contact */}
            <section>
              <SectionHeading id="contact" icon={Mail}>
                Contact Us
              </SectionHeading>
              <Prose>
                <p>
                  For questions, concerns, or legal notices regarding these Terms, please contact us:
                </p>
              </Prose>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: "General & Legal Enquiries",
                    email: "legal@getawayhub.com",
                    detail: "Terms questions, compliance, and legal notices",
                  },
                  {
                    title: "Booking Support",
                    email: "support@getawayhub.com",
                    detail: "Cancellations, refunds, and booking issues",
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

              <div className="mt-4 p-5 rounded-xl border bg-card">
                <p className="text-sm font-semibold text-foreground mb-1">Registered address</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Dev Architects<br />
                  Toronto, Ontario, Canada
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/privacy">
                  <span className="inline-flex items-center gap-1.5 text-sm text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                    Privacy Policy
                  </span>
                </Link>
                <Link href="/help">
                  <span className="inline-flex items-center gap-1.5 text-sm text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                    Help Center
                  </span>
                </Link>
                <a
                  href="mailto:legal@getawayhub.com"
                  className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:brightness-95 transition"
                >
                  <Mail className="h-4 w-4" />
                  Email Legal Team
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
