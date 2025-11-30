// // client/src/pages/PaymentPage.tsx
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements } from "@stripe/react-stripe-js";
// import Payment from "./Payment";

// const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// console.log("Stripe publishable key from env:", publishableKey);

// if (!publishableKey) {
//   console.error(
//     "VITE_STRIPE_PUBLISHABLE_KEY is missing. Make sure it's set in frontend/.env and you restarted npm run dev."
//   );
// }

// const stripePromise = publishableKey
//   ? loadStripe(publishableKey)
//   : Promise.resolve(null as any);

// export default function PaymentPage() {
//   if (!publishableKey) {
//     return (
//       <div className="p-6 text-red-600">
//         Stripe publishable key is missing.
//         <br />
//         Add <code>VITE_STRIPE_PUBLISHABLE_KEY=...</code> to{" "}
//         <code>frontend/.env</code> and restart <code>npm run dev</code>.
//       </div>
//     );
//   }

//   return (
//     <Elements stripe={stripePromise}>
//       <Payment />
//     </Elements>
//   );
// }
