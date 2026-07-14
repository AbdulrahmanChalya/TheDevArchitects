import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import {
  Search,
  CreditCard,
  Plane,
  Hotel,
  RefreshCw,
  Shield,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    icon: Plane,
    title: "Flights",
    description: "Booking, changes, and baggage policies.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Hotel,
    title: "Hotels",
    description: "Reservations, check-in, and amenities.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Charges, invoices, and payment methods.",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: RefreshCw,
    title: "Cancellations & Refunds",
    description: "Policies, timelines, and how to cancel.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Shield,
    title: "Account & Security",
    description: "Password, login, and personal data.",
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    icon: MessageCircle,
    title: "Contact Support",
    description: "Reach our team via chat or email.",
    color: "text-sky-500",
    bg: "bg-sky-50",
  },
];

const faqs = [
  {
    question: "How do I cancel or change my booking?",
    answer:
      "You can cancel or modify your booking from your account dashboard under 'My Trips'. Select the booking you'd like to change and follow the on-screen steps. Cancellation policies vary by provider — free cancellation options are clearly labeled at checkout.",
  },
  {
    question: "When will I receive my refund?",
    answer:
      "Refunds are typically processed within 5–10 business days depending on your bank or card issuer. Once we initiate the refund you'll receive a confirmation email. If you haven't heard back after 10 business days, please contact our support team.",
  },
  {
    question: "Can I book for someone else?",
    answer:
      "Yes. When entering traveler details during checkout you can enter the name and information of another person. Just make sure the details exactly match their government-issued ID.",
  },
  {
    question: "How do I add extra baggage to my flight?",
    answer:
      "Baggage can be added during the checkout process on the flight details step. If you've already booked, go to your booking in 'My Trips' and select 'Manage Extras' to purchase additional baggage allowance where available.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes. All payments are processed through Stripe, a PCI-DSS Level 1 certified provider. We never store your full card details on our servers. All data is transmitted using TLS encryption.",
  },
  {
    question: "What do I do if my flight is delayed or cancelled by the airline?",
    answer:
      "In the event of an airline-initiated cancellation or significant delay, you are entitled to a full refund or free rebooking under most jurisdictions. Contact the airline directly for immediate rebooking, then reach out to our support team to initiate a refund if needed.",
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(
    (faq) =>
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How can we help?
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Search our help articles or browse by topic below.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-13 text-base rounded-xl shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
          Browse by topic
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-6 rounded-xl border bg-card hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className={`p-3 rounded-lg ${bg} shrink-0`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 md:px-6 pb-20">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
          Frequently asked questions
        </h2>

        {filteredFaqs.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No results for "{searchQuery}". Try a different search term or{" "}
            <a href="mailto:support@getawayhub.com" className="text-primary underline">
              contact us
            </a>
            .
          </p>
        ) : (
          <div className="divide-y border rounded-xl overflow-hidden">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-card">
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/40 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 ml-4" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="bg-primary/5 border-t">
        <div className="container mx-auto px-4 md:px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Still need help?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our support team is available 7 days a week.
          </p>
          <a
            href="mailto:support@getawayhub.com"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-3 rounded-lg hover:brightness-95 transition"
          >
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
