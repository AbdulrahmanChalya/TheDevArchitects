import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Publishable key (pk_test_... / pk_live_...) from frontend/.env
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as
  | string
  | undefined;

export const isStripeConfigured = Boolean(publishableKey);

// Only initialize Stripe.js when a key is present. With just a publishable
// key we can mount Elements and validate/tokenize cards client-side; charging
// a real payment additionally requires a backend PaymentIntent (see PaymentPage).
export const stripePromise: Promise<Stripe | null> | null = publishableKey
  ? loadStripe(publishableKey)
  : null;
