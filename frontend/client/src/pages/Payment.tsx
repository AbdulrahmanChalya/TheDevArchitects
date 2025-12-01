// import { useState } from "react";
// import { useLocation } from "wouter";
// import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { Lock, MapPin, Plane, Hotel } from "lucide-react";
// import Header from "@/components/Header";

// export default function Payment() {
//   const [, setLocation] = useLocation();
//   const stripe = useStripe();
//   const elements = useElements();

//   const [paymentData, setPaymentData] = useState({
//     cardName: "",
//     email: "",
//     phone: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   const urlParams = new URLSearchParams(window.location.search);
//   const bookingData = {
//     destination: urlParams.get("destination") || "Paris",
//     startDate: urlParams.get("startDate"),
//     endDate: urlParams.get("endDate"),
//     people: parseInt(urlParams.get("people") || "2"),
//     rooms: parseInt(urlParams.get("rooms") || "1"),
//     hotelId: urlParams.get("hotelId"),
//     flightId: urlParams.get("flightId"),
//   };

//   // Calculate pricing
//   const hotelPrice = bookingData.hotelId ? 299 : 0;
//   const flightPrice = bookingData.flightId ? 599 * bookingData.people : 0;
//   const subtotal = hotelPrice + flightPrice;
//   const taxes = subtotal * 0.12;
//   const total = subtotal + taxes;

//   const getDaysBetween = () => {
//     if (bookingData.startDate && bookingData.endDate) {
//       const start = new Date(bookingData.startDate);
//       const end = new Date(bookingData.endDate);
//       return Math.ceil(
//         (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
//       );
//     }
//     return 1;
//   };

//   const handlePayment = async () => {
//     setErrorMsg(null);

//     if (!stripe || !elements) {
//       setErrorMsg("Stripe has not loaded yet. Please wait a moment and try again.");
//       return;
//     }

//     setLoading(true);

//     try {
//       // 1️⃣ Ask backend to create a PaymentIntent
//       const res = await fetch(
//         "http://localhost:8000/api/payments/create-payment-intent",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             amount: Math.round(total * 100), // Stripe uses cents
//             currency: "usd",
//           }),
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Failed to create payment intent");
//       }

//       const data = await res.json();

//       const cardElement = elements.getElement(CardElement);
//       if (!cardElement) {
//         throw new Error("Payment form is not ready. Please refresh and try again.");
//       }

//       // 2️⃣ Confirm the card payment with Stripe.js
//       const result = await stripe.confirmCardPayment(data.clientSecret, {
//         payment_method: {
//           card: cardElement,
//           billing_details: {
//             name: paymentData.cardName || undefined,
//             email: paymentData.email || undefined,
//           },
//         },
//       });

//       if (result.error) {
//         setErrorMsg(result.error.message ?? "Payment failed. Please try again.");
//         setLoading(false);
//         return;
//       }

//       if (result.paymentIntent?.status === "succeeded") {
//         // 3️⃣ On success, redirect to booking-success with all query params + total
//         const params = new URLSearchParams(
//           bookingData as unknown as Record<string, string>
//         );
//         params.set("total", total.toString());
//         setLocation(`/booking-success?${params.toString()}`);
//       } else {
//         setErrorMsg("Unexpected payment status. Please contact support.");
//       }
//     } catch (err: any) {
//       setErrorMsg(err.message ?? "Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />

//       <main className="flex-1 container mx-auto px-4 py-8">
//         <div className="max-w-6xl mx-auto">
//           <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Payment Form */}
//             <div>
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Lock className="h-5 w-5" />
//                     Secure Payment
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   {/* Contact Information */}
//                   <div>
//                     <h3 className="font-semibold mb-4">Contact Information</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <Label htmlFor="email">Email Address</Label>
//                         <Input
//                           id="email"
//                           type="email"
//                           placeholder="your@email.com"
//                           value={paymentData.email}
//                           onChange={(e) =>
//                             setPaymentData({
//                               ...paymentData,
//                               email: e.target.value,
//                             })
//                           }
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="phone">Phone Number</Label>
//                         <Input
//                           id="phone"
//                           type="tel"
//                           placeholder="+1 (555) 123-4567"
//                           value={paymentData.phone}
//                           onChange={(e) =>
//                             setPaymentData({
//                               ...paymentData,
//                               phone: e.target.value,
//                             })
//                           }
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <Separator />

//                   {/* Payment Information */}
//                   <div>
//                     <h3 className="font-semibold mb-4">Payment Information</h3>
//                     <div className="space-y-4">
//                       <div>
//                         <Label htmlFor="cardName">Cardholder Name</Label>
//                         <Input
//                           id="cardName"
//                           placeholder="John Doe"
//                           value={paymentData.cardName}
//                           onChange={(e) =>
//                             setPaymentData({
//                               ...paymentData,
//                               cardName: e.target.value,
//                             })
//                           }
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <Label>Card Details</Label>
//                         <div className="border rounded-md p-3">
//                           <CardElement />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {errorMsg && (
//                     <p className="text-sm text-red-500">{errorMsg}</p>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Booking Summary */}
//             <div>
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Booking Summary</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   {/* Trip Details */}
//                   <div>
//                     <div className="flex items-center gap-2 mb-3">
//                       <MapPin className="h-4 w-4 text-blue-500" />
//                       <span className="font-semibold">
//                         {bookingData.destination}
//                       </span>
//                     </div>
//                     <div className="text-sm text-gray-600 space-y-1">
//                       <p>
//                         {bookingData.startDate && bookingData.endDate
//                           ? `${new Date(
//                               bookingData.startDate
//                             ).toLocaleDateString()} - ${new Date(
//                               bookingData.endDate
//                             ).toLocaleDateString()}`
//                           : "Flexible dates"}
//                       </p>
//                       <p>
//                         {bookingData.people} travelers • {bookingData.rooms}{" "}
//                         room(s)
//                       </p>
//                       <p>{getDaysBetween()} nights</p>
//                     </div>
//                   </div>

//                   <Separator />

//                   {/* Services */}
//                   <div className="space-y-3">
//                     {bookingData.hotelId && (
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <Hotel className="h-4 w-4 text-blue-500" />
//                           <span>Hotel Accommodation</span>
//                         </div>
//                         <span className="font-semibold">${hotelPrice}</span>
//                       </div>
//                     )}

//                     {bookingData.flightId && (
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                           <Plane className="h-4 w-4 text-blue-500" />
//                           <span>
//                             Flight ({bookingData.people} passengers)
//                           </span>
//                         </div>
//                         <span className="font-semibold">${flightPrice}</span>
//                       </div>
//                     )}

//                     {!bookingData.hotelId && !bookingData.flightId && (
//                       <div className="text-center py-4 text-gray-500">
//                         <p>Trip planning service</p>
//                         <p className="text-sm">
//                           Destination information and recommendations
//                         </p>
//                       </div>
//                     )}
//                   </div>

//                   <Separator />

//                   {/* Pricing */}
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span>Subtotal</span>
//                       <span>${subtotal}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Taxes & Fees</span>
//                       <span>${taxes.toFixed(2)}</span>
//                     </div>
//                     <Separator />
//                     <div className="flex justify-between text-lg font-bold">
//                       <span>Total</span>
//                       <span>${total.toFixed(2)}</span>
//                     </div>
//                   </div>

//                   <Button
//                     onClick={handlePayment}
//                     className="w-full bg-green-600 hover:bg-green-700"
//                     size="lg"
//                     disabled={loading || !stripe}
//                   >
//                     {loading ? "Processing..." : "Complete Payment"}
//                   </Button>

//                   <p className="text-xs text-gray-500 text-center">
//                     Your payment is secured with Stripe and 256-bit SSL
//                     encryption
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
