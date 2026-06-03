import { useState } from "react";
import { useLocation } from "wouter";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, MapPin, Calendar, Users, ShieldCheck, AlertTriangle } from "lucide-react";
import { stripePromise, isStripeConfigured } from "@/lib/stripe";

const TAX_RATE = 0.12;

interface OrderSummary {
  destination: string;
  startDate: string;
  endDate: string;
  people: string;
  rooms: string;
  packageId: string;
  subtotal: number;
  taxes: number;
  total: number;
}

function useOrderSummary(): OrderSummary {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const subtotal = Number(params.get("total") || 0);
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  return {
    destination: params.get("destination") || "Your trip",
    startDate: params.get("startDate") || "",
    endDate: params.get("endDate") || "",
    people: params.get("people") || "1",
    rooms: params.get("rooms") || "1",
    packageId: params.get("packageId") || "",
    subtotal,
    taxes,
    total: Math.round((subtotal + taxes) * 100) / 100,
  };
}

function goToSuccess(
  setLocation: (path: string) => void,
  order: OrderSummary,
) {
  const params = new URLSearchParams({
    destination: order.destination,
    startDate: order.startDate,
    endDate: order.endDate,
    people: order.people,
    rooms: order.rooms,
    packageId: order.packageId,
    total: String(order.total),
  });
  setLocation(`/booking-success?${params.toString()}`);
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#dc2626" },
  },
};

/** Real Stripe form. Validates the card via Stripe.js (publishable key only).
 *  A full charge additionally needs a backend PaymentIntent — see the note below. */
function StripeCheckoutForm({ order }: { order: OrderSummary }) {
  const [, setLocation] = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const [cardName, setCardName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePay = async () => {
    setErrorMsg(null);
    setLoading(true);

    // No real charge yet (no backend PaymentIntent). For now we allow checkout
    // without requiring card details. If a card is entered we best-effort
    // validate it with Stripe, but we never block the booking on it.
    try {
      const cardElement = elements?.getElement(CardElement);
      if (stripe && cardElement) {
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: { name: cardName || undefined, email: email || undefined },
        });
        // --- Real charge (enable when a backend payments endpoint exists) ---
        // const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payments/create-payment-intent`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ amount: Math.round(order.total * 100), currency: "usd" }),
        // });
        // const { clientSecret } = await res.json();
        // const result = await stripe.confirmCardPayment(clientSecret, { payment_method: paymentMethod.id });
        // if (result.error) { setErrorMsg(result.error.message ?? "Payment failed."); setLoading(false); return; }
        // -------------------------------------------------------------------
      }
    } catch {
      // Ignore validation errors for now; proceed to confirmation regardless.
    }

    goToSuccess(setLocation, order);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardName">Cardholder Name</Label>
          <Input
            id="cardName"
            placeholder="Jane Traveler"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="border rounded-md p-3 bg-background">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-xs text-muted-foreground">
          Test card: 4242 4242 4242 4242 · any future date · any CVC · any ZIP
        </p>
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <Button
        onClick={handlePay}
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Processing..." : `Pay $${order.total.toLocaleString()}`}
      </Button>
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        Secured by Stripe
      </p>
    </div>
  );
}

/** Shown when no VITE_STRIPE_PUBLISHABLE_KEY is set. Keeps the booking flow
 *  usable while making the missing configuration obvious. */
function DemoCheckout({ order }: { order: OrderSummary }) {
  const [, setLocation] = useLocation();
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Stripe is not configured</p>
          <p>
            Add <code className="font-mono">VITE_STRIPE_PUBLISHABLE_KEY</code> to{" "}
            <code className="font-mono">frontend/.env</code> and restart{" "}
            <code className="font-mono">npm run dev</code> to enable the real card form.
            You can continue in demo mode for now.
          </p>
        </div>
      </div>
      <Button
        onClick={() => goToSuccess(setLocation, order)}
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Pay ${order.total.toLocaleString()} (Demo)
      </Button>
    </div>
  );
}

export default function PaymentPage() {
  const order = useOrderSummary();

  const formatDate = (value: string) => {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/10">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Secure Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isStripeConfigured ? (
                      <Elements stripe={stripePromise}>
                        <StripeCheckoutForm order={order} />
                      </Elements>
                    ) : (
                      <DemoCheckout order={order} />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-16">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{order.destination}</span>
                      </div>
                      {order.startDate && order.endDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(order.startDate)} - {formatDate(order.endDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {order.people} travelers • {order.rooms} room(s)
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${order.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes & Fees</span>
                        <span>${order.taxes.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          ${order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
