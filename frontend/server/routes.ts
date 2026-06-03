import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import OpenAI from "openai";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY,});

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
  app.post("/api/assistant/chat", async (req, res) => {
    try {
      const { message, pageContext } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          message: "Message is required",
        });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          message: "OPENAI_API_KEY is missing",
        });
      }

      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        instructions:
          `You are GetawayHub's AI Travel Assistant.
          Your job:
          - Help users plan trips, compare destinations, understand travel options, and think through budgets.
          - Keep answers practical, clear, and not too long.
          - Ask one short follow-up question when the user's request is missing important details.
          - Prefer structured answers with short sections or bullet points.
          - Keep itinerary answers compact unless the user asks for more detail.

          Website navigation help:
          - If the user asks what to do next, use the current website context to guide them.
          - On the homepage, tell users to fill in destination, airports, dates, guests, rooms, and budget, then click "Find My Perfect Getaway".
          - On the search results page, tell users to choose a destination card.
          - On the hotel page, tell users to choose a hotel.
          - On the flight page, tell users to choose a flight.
          - On the payment page, tell users to review the booking and continue to Stripe Checkout.
          - On the booking success page, tell users the payment flow is complete.

          Important rules:
          - Do not guarantee live prices, hotel availability, flight availability, visa rules, safety rules, or entry requirements.
          - Remind users to verify important booking, visa, safety, and pricing details before making final plans.
          - Do not claim you can directly book flights or hotels.
          - Do not ask for sensitive personal information.
          - If the user asks something unrelated to travel, politely redirect back to travel help.

          Tone:
          - Friendly, concise, helpful, and beginner-friendly.

          Format:
          - Use plain text.
          - Avoid long markdown tables.
          - Keep most answers under 180 words unless the user asks for a full plan.`,
          input: `
          User message:
          ${message}

          Current website context:
          ${JSON.stringify(pageContext, null, 2)}
          `,
          max_output_tokens: 450,
      });

      res.json({
        reply: response.output_text,
      });
    } catch (error: any) {
      console.error("AI assistant error:", error);
      res.status(500).json({
        message: error.message || "Failed to get assistant response",
      });
    }
  });
  return httpServer;
}