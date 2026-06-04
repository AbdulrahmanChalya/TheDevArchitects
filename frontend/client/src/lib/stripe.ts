// stripe.ts — load Stripe.js in the browser for PaymentPage.
//
// isStripeConfigured — true when VITE_STRIPE_PUBLISHABLE_KEY is in frontend/.env
// stripePromise        — used by <Elements>; null when key is missing (demo mode)
//
// Real charges need a server PaymentIntent (secret key never goes in the frontend).
import { loadStripe, type Stripe } from "@stripe/stripe-js";

// From frontend/.env — safe to expose in the browser
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
