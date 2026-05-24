import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);

  const bookingData = {
    destination: urlParams.get("destination") || "Paris",
    people: urlParams.get("people") || "2",
    rooms: urlParams.get("rooms") || "1",
    hotelId: urlParams.get("hotelId"),
    flightId: urlParams.get("flightId"),
  };

  const hotelPrices: Record<string, number> = {
    "1": 299,
    "2": 199,
    "3": 149,
  };

  const flightPrices: Record<string, number> = {
    "1": 599,
    "2": 449,
    "3": 899,
  };

  const hotelTotal = bookingData.hotelId
    ? hotelPrices[bookingData.hotelId] || 0
    : 0;

  const flightTotal = bookingData.flightId
    ? flightPrices[bookingData.flightId] || 0
    : 0;

  const serviceFee = 49;

  const peopleCount = Number(bookingData.people) || 1;

  const total = hotelTotal + flightTotal * peopleCount + serviceFee;

  const handleCheckout = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingData,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not start payment");
      }

      window.location.href = data.url;
    } catch (error: any) {
      alert(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Review and Pay</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p>
                <strong>Destination:</strong> {bookingData.destination}
              </p>
              <p>
                <strong>Travelers:</strong> {bookingData.people}
              </p>
              <p>
                <strong>Rooms:</strong> {bookingData.rooms}
              </p>
            </div>

            <div className="border-t pt-4 space-y-2">
              <p>Hotel: ${hotelTotal.toFixed(2)}</p>
              <p>Flight: ${(flightTotal * peopleCount).toFixed(2)}</p>
              <p>Trip planning service fee: ${serviceFee.toFixed(2)}</p>

              <p className="text-xl font-bold pt-3">
                Total: ${total.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Redirecting..." : "Pay with Stripe"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}