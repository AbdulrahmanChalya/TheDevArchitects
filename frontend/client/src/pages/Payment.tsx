import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, MapPin, Plane, Hotel } from "lucide-react";
import Header from "@/components/Header";

export default function Payment() {
  const [, setLocation] = useLocation();
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: '',
    phone: ''
  });

  const urlParams = new URLSearchParams(window.location.search);
  const bookingData = {
    destination: urlParams.get('destination') || 'Paris',
    startDate: urlParams.get('startDate'),
    endDate: urlParams.get('endDate'),
    people: parseInt(urlParams.get('people') || '2'),
    rooms: parseInt(urlParams.get('rooms') || '1'),
    hotelId: urlParams.get('hotelId'),
    flightId: urlParams.get('flightId')
  };

  // Calculate pricing
  const hotelPrice = bookingData.hotelId ? 299 : 0;
  const flightPrice = bookingData.flightId ? 599 * bookingData.people : 0;
  const subtotal = hotelPrice + flightPrice;
  const taxes = subtotal * 0.12;
  const total = subtotal + taxes;

  const handlePayment = () => {
    // Simulate payment processing
    const params = new URLSearchParams(bookingData);
    params.set('total', total.toString());
    setLocation(`/booking-success?${params.toString()}`);
  };

  const getDaysBetween = () => {
    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Secure Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={paymentData.email}
                          onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={paymentData.phone}
                          onChange={(e) => setPaymentData({...paymentData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Information */}
                  <div>
                    <h3 className="font-semibold mb-4">Payment Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={paymentData.cardName}
                          onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={paymentData.cardNumber}
                            onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                            className="pl-10"
                          />
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={paymentData.expiryDate}
                            onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentData.cvv}
                            onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trip Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">{bookingData.destination}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {bookingData.startDate && bookingData.endDate 
                          ? `${new Date(bookingData.startDate).toLocaleDateString()} - ${new Date(bookingData.endDate).toLocaleDateString()}`
                          : 'Flexible dates'
                        }
                      </p>
                      <p>{bookingData.people} travelers • {bookingData.rooms} room(s)</p>
                      <p>{getDaysBetween()} nights</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Services */}
                  <div className="space-y-3">
                    {bookingData.hotelId && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hotel className="h-4 w-4 text-blue-500" />
                          <span>Hotel Accommodation</span>
                        </div>
                        <span className="font-semibold">${hotelPrice}</span>
                      </div>
                    )}
                    
                    {bookingData.flightId && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4 text-blue-500" />
                          <span>Flight ({bookingData.people} passengers)</span>
                        </div>
                        <span className="font-semibold">${flightPrice}</span>
                      </div>
                    )}

                    {!bookingData.hotelId && !bookingData.flightId && (
                      <div className="text-center py-4 text-gray-500">
                        <p>Trip planning service</p>
                        <p className="text-sm">Destination information and recommendations</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Fees</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePayment}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    Complete Payment
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Your payment is secured with 256-bit SSL encryption
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
