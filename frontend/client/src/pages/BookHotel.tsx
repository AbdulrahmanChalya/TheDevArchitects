import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Wifi, Car, Coffee, MapPin } from "lucide-react";
import Header from "@/components/Header";

export default function BookHotel() {
  const [, setLocation] = useLocation();
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const searchData = {
    destination: urlParams.get('destination') || 'Paris',
    startDate: urlParams.get('startDate'),
    endDate: urlParams.get('endDate'),
    people: urlParams.get('people') || '2',
    rooms: urlParams.get('rooms') || '1'
  };

  const hotels = [
    {
      id: '1',
      name: 'Grand Palace Hotel',
      rating: 4.8,
      price: 299,
      image: '/api/placeholder/300/200',
      amenities: ['Free WiFi', 'Parking', 'Breakfast'],
      location: 'City Center'
    },
    {
      id: '2', 
      name: 'Boutique Resort & Spa',
      rating: 4.6,
      price: 199,
      image: '/api/placeholder/300/200',
      amenities: ['Free WiFi', 'Spa', 'Pool'],
      location: 'Downtown'
    },
    {
      id: '3',
      name: 'Business Hotel',
      rating: 4.4,
      price: 149,
      image: '/api/placeholder/300/200', 
      amenities: ['Free WiFi', 'Gym', 'Business Center'],
      location: 'Business District'
    }
  ];

  const handleContinue = () => {
    const params = new URLSearchParams(searchData);
    if (selectedHotel) {
      params.set('hotelId', selectedHotel);
    }
    setLocation(`/book-flight?${params.toString()}`);
  };

  const handleSkip = () => {
    const params = new URLSearchParams(searchData);
    setLocation(`/book-flight?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Hotel</h1>
            <p className="text-gray-600">
              Select accommodation for your stay in {searchData.destination}
            </p>
          </div>

          {/* Trip Info */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6 text-sm">
                <span><strong>Destination:</strong> {searchData.destination}</span>
                <span><strong>Dates:</strong> {searchData.startDate && searchData.endDate 
                  ? `${new Date(searchData.startDate).toLocaleDateString()} - ${new Date(searchData.endDate).toLocaleDateString()}`
                  : 'Flexible dates'
                }</span>
                <span><strong>Guests:</strong> {searchData.people} guests, {searchData.rooms} room(s)</span>
              </div>
            </CardContent>
          </Card>

          {/* Hotels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {hotels.map((hotel) => (
              <Card 
                key={hotel.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedHotel === hotel.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedHotel(hotel.id)}
              >
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{hotel.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{hotel.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span className="text-sm">{hotel.location}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {hotel.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold">${hotel.price}</span>
                      <span className="text-gray-600 text-sm">/night</span>
                    </div>
                    {selectedHotel === hotel.id && (
                      <Badge className="bg-blue-500">Selected</Badge>
                    )}
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
              disabled={!selectedHotel}
            >
              Continue with Selected Hotel
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleSkip}
            >
              Skip Hotel Booking
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
