// Vite dev server API routes (not used by PaymentPage today).
//
// POST /api/create-checkout-session — Stripe Checkout redirect flow (legacy).
// PaymentPage uses client-side Elements instead.
import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const {
        destination,
        people,
        rooms,
        hotelId,
        flightId,
        total,
      } = req.body;

      const amount = Math.round(Number(total) * 100);

      if (!amount || amount < 50) {
        return res.status(400).json({
          message: "Invalid payment amount",
        });
      }

      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: [
          {
            price_data: {
              currency: "cad",
              product_data: {
                name: `Getaway Hub Trip to ${destination || "your destination"}`,
                description: `Travelers: ${people || "1"}, Rooms: ${rooms || "1"}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],

        metadata: {
          destination: destination || "",
          people: people || "",
          rooms: rooms || "",
          hotelId: hotelId || "",
          flightId: flightId || "",
        },

        success_url: `${clientUrl}/booking-success?total=${total}&destination=${encodeURIComponent(
          destination || ""
        )}&people=${people || ""}&rooms=${rooms || ""}&hotelId=${hotelId || ""}&flightId=${flightId || ""}&session_id={CHECKOUT_SESSION_ID}`,

        cancel_url: `${clientUrl}/payment?destination=${encodeURIComponent(
          destination || ""
        )}&people=${people || ""}&rooms=${rooms || ""}&hotelId=${hotelId || ""}&flightId=${flightId || ""}`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({
        message: error.message || "Failed to create checkout session",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}