import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, Users } from "lucide-react";
import Header from "@/components/Header";

export default function BookFlight() {
  const [, setLocation] = useLocation();
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const searchData = {
    destination: urlParams.get('destination') || 'Paris',
    departureAirport: urlParams.get('departureAirport') || 'JFK',
    arrivalAirport: urlParams.get('arrivalAirport') || 'CDG',
    startDate: urlParams.get('startDate'),
    endDate: urlParams.get('endDate'),
    people: urlParams.get('people') || '2',
    hotelId: urlParams.get('hotelId')
  };

  const flights = [
    {
      id: '1',
      airline: 'SkyLine Airways',
      departure: '08:30',
      arrival: '14:45',
      duration: '8h 15m',
      price: 599,
      stops: 'Direct',
      class: 'Economy'
    },
    {
      id: '2',
      airline: 'Global Express',
      departure: '14:20',
      arrival: '22:10',
      duration: '9h 50m',
      price: 449,
      stops: '1 Stop',
      class: 'Economy'
    },
    {
      id: '3',
      airline: 'Premium Air',
      departure: '10:15',
      arrival: '16:30',
      duration: '8h 15m',
      price: 899,
      stops: 'Direct',
      class: 'Business'
    }
  ];

  const handleContinue = () => {
    const params = new URLSearchParams(searchData);
    if (selectedFlight) {
      params.set('flightId', selectedFlight);
    }
    setLocation(`/payment?${params.toString()}`);
  };

  const handleSkip = () => {
    const params = new URLSearchParams(searchData);
    setLocation(`/payment?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Flight</h1>
            <p className="text-gray-600">
              Select flights for your trip to {searchData.destination}
            </p>
          </div>

          {/* Flight Route Info */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-semibold">{searchData.departureAirport}</p>
                    <p className="text-sm text-gray-600">Departure</p>
                  </div>
                  <Plane className="h-5 w-5 text-blue-500" />
                  <div className="text-center">
                    <p className="font-semibold">{searchData.arrivalAirport}</p>
                    <p className="text-sm text-gray-600">Arrival</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{searchData.people} passengers</p>
                  <p className="text-sm text-gray-600">
                    {searchData.startDate ? new Date(searchData.startDate).toLocaleDateString() : 'Flexible date'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flights List */}
          <div className="space-y-4 mb-8">
            {flights.map((flight) => (
              <Card 
                key={flight.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedFlight === flight.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedFlight(flight.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="font-semibold text-lg">{flight.airline}</p>
                        <p className="text-sm text-gray-600">{flight.class}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-bold text-xl">{flight.departure}</p>
                          <p className="text-sm text-gray-600">{searchData.departureAirport}</p>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="w-16 h-px bg-gray-300"></div>
                            <Plane className="h-4 w-4 text-gray-400" />
                            <div className="w-16 h-px bg-gray-300"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">{flight.duration}</span>
                          </div>
                          <p className="text-xs text-gray-500">{flight.stops}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="font-bold text-xl">{flight.arrival}</p>
                          <p className="text-sm text-gray-600">{searchData.arrivalAirport}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold">${flight.price}</p>
                      <p className="text-sm text-gray-600">per person</p>
                      {selectedFlight === flight.id && (
                        <Badge className="bg-blue-500 mt-2">Selected</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleContinue}
              size="lg" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!selectedFlight}
            >
              Continue with Selected Flight
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleSkip}
            >
              Skip Flight Booking
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
