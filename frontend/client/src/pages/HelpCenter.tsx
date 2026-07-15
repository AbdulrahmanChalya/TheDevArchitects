import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Mail,
  MessageCircle,
  Phone,
  Clock,
  CheckCircle2,
  Plane,
  CreditCard,
  RefreshCw,
  Shield,
  Hotel,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const FAQ_TABS = [
  { id: "all", label: "All topics" },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "cancellations", label: "Cancellations", icon: RefreshCw },
  { id: "account", label: "Account", icon: Shield },
];

const faqs = [
  {
    category: "flights",
    question: "How do I change or cancel my flight booking?",
    answer:
      "Go to My Trips in your account, find the flight and select Manage Booking. You can change dates, passenger details, or cancel. Fees depend on your fare type — flexible fares are free to change, while non-refundable fares may incur a fee. Free cancellation bookings are clearly marked at checkout.",
  },
  {
    category: "flights",
    question: "How do I add extra baggage to my flight?",
    answer:
      "Baggage can be added during the checkout process on the flight details step. If you've already booked, go to your booking in My Trips and select Manage Extras to purchase additional baggage allowance where the airline supports it.",
  },
  {
    category: "flights",
    question: "What happens if my flight is delayed or cancelled by the airline?",
    answer:
      "If the airline cancels or significantly delays your flight, you're entitled to a full refund or free rebooking under most jurisdictions. Contact the airline for immediate rebooking, then reach our support team to initiate a refund. We'll handle the rest.",
  },
  {
    category: "flights",
    question: "Can I select my seat after booking?",
    answer:
      "Yes — go to My Trips, open your flight booking, and choose Add Seat Selection if the airline supports pre-selection. Some airlines allow this for free; others charge a small fee. Seat maps are shown in real time.",
  },
  {
    category: "hotels",
    question: "What is the check-in and check-out time?",
    answer:
      "Check-in and check-out times vary by property and are clearly listed on the hotel details page. Standard check-in is typically 3 PM and check-out by 11 AM. Early check-in or late check-out can often be requested directly with the hotel — look for the Special Requests field during checkout.",
  },
  {
    category: "hotels",
    question: "Can I book for someone else?",
    answer:
      "Yes. During checkout, enter the guest's name in the Traveler Details section. The name must match the ID they'll present at check-in. You can use your own payment method while booking for another person.",
  },
  {
    category: "hotels",
    question: "Are breakfast and amenities included in the price?",
    answer:
      "Inclusions depend on the room rate you select. Rates that include breakfast or other amenities are labeled at checkout. You can filter search results by Breakfast Included to narrow your options.",
  },
  {
    category: "payments",
    question: "Is my payment information secure?",
    answer:
      "Yes. All payments are processed through Stripe, a PCI-DSS Level 1 certified provider. We never store your full card details on our servers, and all data is transmitted using TLS encryption.",
  },
  {
    category: "payments",
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, Amex), as well as Apple Pay and Google Pay where supported. Payment options are shown at checkout based on your region.",
  },
  {
    category: "payments",
    question: "Why was I charged a different amount than shown?",
    answer:
      "Prices shown include all taxes and fees. If the amount on your statement differs, it may be due to currency conversion by your bank. The charge is made in the currency you selected at checkout. Contact us with your booking reference if you believe there's an error.",
  },
  {
    category: "cancellations",
    question: "When will I receive my refund?",
    answer:
      "Refunds are typically processed within 5–10 business days depending on your bank. Once we initiate the refund you'll receive a confirmation email. If you haven't seen it after 10 business days, please contact our support team with your booking reference.",
  },
  {
    category: "cancellations",
    question: "What is the cancellation policy?",
    answer:
      "Policies vary by booking type and are shown at checkout before you pay. Free cancellation options are clearly labeled. Non-refundable bookings cannot be refunded after purchase unless the provider cancels.",
  },
  {
    category: "cancellations",
    question: "Can I get a refund if I need to cancel due to illness?",
    answer:
      "Refunds for medical reasons are handled on a case-by-case basis. Contact our support team with your booking reference and a supporting document (e.g., medical certificate). We'll work with the provider on your behalf.",
  },
  {
    category: "account",
    question: "How do I reset my password?",
    answer:
      "Click Forgot password on the sign-in page and enter your email. You'll receive a reset link within a few minutes. If you don't see it, check your spam folder. The link expires after 24 hours.",
  },
  {
    category: "account",
    question: "How do I update my personal information?",
    answer:
      "Sign in to your account and go to Profile Settings. From there you can update your name, email, phone number, and travel preferences. Changes take effect immediately.",
  },
  {
    category: "account",
    question: "How do I delete my account?",
    answer:
      "To request account deletion, contact our support team. We'll confirm your identity and remove your data in accordance with our Privacy Policy within 30 days. Note that completed bookings may be retained for legal and financial compliance.",
  },
];

const CONTACT_CHANNELS = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Fastest way to get help. Average wait time under 2 minutes.",
    action: "Start chat",
    availability: "Available now",
    available: true,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send a detailed request and we'll reply within 24 hours.",
    action: "Send email",
    availability: "Replies within 24 hrs",
    available: true,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    href: "mailto:support@getawayhub.com",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak to an agent for urgent booking or travel issues.",
    action: "View number",
    availability: "Mon–Fri, 9 AM–6 PM",
    available: false,
    color: "text-violet-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

type FeedbackMap = Record<number, "up" | "down">;

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMap>({});
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const visibleFaqs = faqs.filter((faq) => {
    const matchesTab = activeTab === "all" || faq.category === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleFeedback = (idx: number, value: "up" | "down") => {
    setFeedback((prev) => ({ ...prev, [idx]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* ── Hero ── */}
      <section className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 md:px-6 py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200 mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" />
            All systems operational
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            How can we help?
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Search our knowledge base or use the contact form below to reach our team.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="e.g. cancel booking, refund, baggage…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveTab("all");
              }}
              className="pl-12 h-12 text-base rounded-xl shadow-sm"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-14 space-y-16">

        {/* ── FAQ ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Frequently asked questions
            </h2>
            <span className="text-sm text-muted-foreground">
              {visibleFaqs.length} article{visibleFaqs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Tabs */}
          {searchQuery === "" && (
            <div className="flex flex-wrap gap-2 mb-6">
              {FAQ_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {visibleFaqs.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-card">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground mb-1 font-medium">No results for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground">
                Try different keywords, or{" "}
                <button
                  className="text-primary underline underline-offset-2"
                  onClick={() => {
                    const el = document.getElementById("contact-form");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  send us a message
                </button>
                .
              </p>
            </div>
          ) : (
            <div className="divide-y border rounded-xl overflow-hidden">
              {visibleFaqs.map((faq, i) => (
                <div key={i} className="bg-card">
                  <button
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/40 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="font-medium text-foreground pr-4">{faq.question}</span>
                    {openFaq === i ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </button>

                  {openFaq === i && (
                    <div className="px-6 pb-5">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {faq.answer}
                      </p>
                      <div className="flex items-center gap-3 border-t pt-4">
                        <span className="text-xs text-muted-foreground">Was this helpful?</span>
                        <button
                          onClick={() => handleFeedback(i, "up")}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            feedback[i] === "up"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "hover:bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Yes
                        </button>
                        <button
                          onClick={() => handleFeedback(i, "down")}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                            feedback[i] === "down"
                              ? "bg-rose-50 text-rose-600 border-rose-200"
                              : "hover:bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          No
                        </button>
                        {feedback[i] && (
                          <span className="text-xs text-muted-foreground ml-1">
                            Thanks for your feedback!
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Contact Channels ── */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
            Get in touch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONTACT_CHANNELS.map((ch) => (
              <div
                key={ch.title}
                className={`relative flex flex-col p-6 rounded-xl border ${ch.border} bg-card`}
              >
                <div className={`p-3 rounded-lg ${ch.bg} w-fit mb-4`}>
                  <ch.icon className={`h-5 w-5 ${ch.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{ch.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{ch.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1 text-xs font-medium ${ch.available ? "text-emerald-600" : "text-muted-foreground"}`}>
                    <Clock className="h-3 w-3" />
                    {ch.availability}
                  </span>
                  {ch.href ? (
                    <a
                      href={ch.href}
                      className="text-xs font-medium text-primary hover:underline underline-offset-2"
                    >
                      {ch.action} →
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        if (ch.title === "Live Chat") {
                          const el = document.getElementById("contact-form");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="text-xs font-medium text-primary hover:underline underline-offset-2"
                    >
                      {ch.action} →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact Form ── */}
        <section id="contact-form">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              Send us a message
            </h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you need? Fill in the form and our team will get back to you within 24 hours.
            </p>

            {submitted ? (
              <div className="flex flex-col items-center text-center py-16 border rounded-xl bg-card">
                <div className="bg-emerald-50 p-4 rounded-full mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Message received!</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Thanks for reaching out. A member of our support team will reply to{" "}
                  <span className="font-medium text-foreground">{form.email}</span> within 24 hours.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5 border rounded-xl p-6 md:p-8 bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="hc-name">
                      Full name
                    </label>
                    <Input
                      id="hc-name"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="hc-email">
                      Email address
                    </label>
                    <Input
                      id="hc-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="hc-subject">
                    Subject
                  </label>
                  <Input
                    id="hc-subject"
                    placeholder="e.g. Refund for booking #12345"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="hc-message">
                    Message
                  </label>
                  <Textarea
                    id="hc-message"
                    placeholder="Describe your issue in as much detail as possible…"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    We typically reply within 24 hours
                  </p>
                  <Button type="submit" className="px-6">
                    Send message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
