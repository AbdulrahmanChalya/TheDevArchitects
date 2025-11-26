import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DestinationDetails() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/destination/:destination");
  
  const destination = params?.destination || "Paris";
  const urlParams = new URLSearchParams(window.location.search);
  
  const searchData = {
    destination: urlParams.get('destination') || destination,
    startDate: urlParams.get('startDate'),
    endDate: urlParams.get('endDate'),
    people: urlParams.get('people') || '2',
    rooms: urlParams.get('rooms') || '1'
  };

  const handleBookNow = () => {
    const params = new URLSearchParams(searchData);
    setLocation(`/book-hotel?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Destination Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{searchData.destination}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Popular Destination</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 (2,341 reviews)</span>
              </div>
            </div>
          </div>

          {/* Trip Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Trip Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Dates</p>
                    <p className="text-sm text-gray-600">
                      {searchData.startDate && searchData.endDate 
                        ? `${new Date(searchData.startDate).toLocaleDateString()} - ${new Date(searchData.endDate).toLocaleDateString()}`
                        : 'Select dates'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Travelers</p>
                    <p className="text-sm text-gray-600">{searchData.people} guests, {searchData.rooms} room(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Destination</p>
                    <p className="text-sm text-gray-600">{searchData.destination}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destination Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">About {searchData.destination}</h2>
              <p className="text-gray-600 mb-4">
                Discover the magic of {searchData.destination}, a world-renowned destination offering 
                incredible experiences, rich culture, and unforgettable memories. From historic landmarks 
                to modern attractions, this destination has something for every traveler.
              </p>
              <div className="space-y-2">
                <h3 className="font-semibold">Popular Attractions:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Historic city center</li>
                  <li>World-class museums</li>
                  <li>Local cuisine experiences</li>
                  <li>Cultural landmarks</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="font-semibold mb-4">What's Included</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Hotel accommodation options</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Flight booking assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">24/7 customer support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Flexible booking options</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleBookNow}
              size="lg" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Start Booking Process
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setLocation('/')}
            >
              Back to Search
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
