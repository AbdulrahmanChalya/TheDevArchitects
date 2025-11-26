import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MapPin, Calendar, Users, Download, Mail } from "lucide-react";
import Header from "@/components/Header";

export default function BookingSuccess() {
  const [, setLocation] = useLocation();
  
  const urlParams = new URLSearchParams(window.location.search);
  const bookingData = {
    destination: urlParams.get('destination') || 'Paris',
    startDate: urlParams.get('startDate'),
    endDate: urlParams.get('endDate'),
    people: urlParams.get('people') || '2',
    rooms: urlParams.get('rooms') || '1',
    total: urlParams.get('total') || '0',
    hotelId: urlParams.get('hotelId'),
    flightId: urlParams.get('flightId')
  };

  const bookingReference = `GH${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
            <p className="text-xl text-gray-600">
              Your trip to {bookingData.destination} has been successfully booked
            </p>
          </div>

          {/* Booking Details */}
          <Card className="mb-8 text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Trip Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Reference:</span>
                      <span className="font-mono font-semibold">{bookingReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span>{bookingData.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dates:</span>
                      <span>
                        {bookingData.startDate && bookingData.endDate 
                          ? `${new Date(bookingData.startDate).toLocaleDateString()} - ${new Date(bookingData.endDate).toLocaleDateString()}`
                          : 'Flexible dates'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Travelers:</span>
                      <span>{bookingData.people} guests, {bookingData.rooms} room(s)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Services Booked</h3>
                  <div className="space-y-2 text-sm">
                    {bookingData.hotelId && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Hotel Accommodation</span>
                      </div>
                    )}
                    {bookingData.flightId && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Flight Booking</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Trip Planning Service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>24/7 Customer Support</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Paid:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${parseFloat(bookingData.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8 text-left">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Confirmation Email</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive a detailed confirmation email within 5 minutes
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Trip Preparation</h3>
                  <p className="text-sm text-gray-600">
                    We'll send you travel tips and recommendations before your trip
                  </p>
                </div>
                
                <div className="text-center p-4">
                  <Download className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Mobile App</h3>
                  <p className="text-sm text-gray-600">
                    Download our app to manage your booking on the go
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => setLocation('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Plan Another Trip
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Confirmation
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Need help? Contact our 24/7 support team at support@getawayhub.com or call +1 (555) 123-4567
          </p>
        </div>
      </main>
    </div>
  );
}
