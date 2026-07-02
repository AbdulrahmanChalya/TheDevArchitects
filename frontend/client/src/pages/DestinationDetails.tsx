// DestinationDetails (/destination/:destination)
//
// Route param :destination is the destination id (e.g. "paris-france").
// Optional query params (destination, dates, people, rooms) come from
// SearchBar or a prior navigation — shown in "Your Trip Summary".
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PlaceImage, PlaceImageBackground, parseDestinationLabel } from "@/components/PlaceImage";
import { fetchLiveAttractions } from "@/lib/liveData";

export default function DestinationDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/destination/:destination");

  const destination = params?.destination || "Paris";
  const urlParams = new URLSearchParams(window.location.search);

  const searchData = {
    destination: urlParams.get("destination") || destination,
    startDate: urlParams.get("startDate") || "",
    endDate: urlParams.get("endDate") || "",
    people: urlParams.get("people") || "2",
    rooms: urlParams.get("rooms") || "1",
  };

  const imageLookup = parseDestinationLabel(searchData.destination);
  const cityQuery = imageLookup.name;
  const routeId = params?.destination ?? "";

  const { data: destinations } = useQuery({
    queryKey: ["/api/destinations"],
    queryFn: async () => {
      const response = await fetch("/backend/destinations.json");
      return response.json() as Promise<
        { id: string; name: string; country: string; imageUrl?: string }[]
      >;
    },
  });

  const matchedDestination =
    destinations?.find((entry) => entry.id === routeId) ??
    destinations?.find(
      (entry) =>
        entry.name.toLowerCase() === imageLookup.name.toLowerCase() &&
        (!imageLookup.country ||
          entry.country.toLowerCase() === imageLookup.country.toLowerCase()),
    );

  const { data: liveAttractions } = useQuery({
    queryKey: ["live-attractions", cityQuery],
    queryFn: () => fetchLiveAttractions(cityQuery, parseInt(searchData.people, 10)),
    enabled: Boolean(cityQuery),
    staleTime: 1000 * 60 * 30,
  });

  const handleBookNow = () => {
    const nextParams = new URLSearchParams(searchData);
    setLocation(`/search?${nextParams.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <PlaceImageBackground
        name={matchedDestination?.name ?? imageLookup.name}
        country={matchedDestination?.country ?? imageLookup.country}
        imageUrl={matchedDestination?.imageUrl}
        type="destination"
        className="relative h-64 md:h-80"
      >
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
              {searchData.destination}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
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
        </div>
      </PlaceImageBackground>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
                        : "Select dates"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Travelers</p>
                    <p className="text-sm text-gray-600">
                      {searchData.people} guests, {searchData.rooms} room(s)
                    </p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">About {searchData.destination}</h2>
              <p className="text-gray-600 mb-4">
                Discover the magic of {searchData.destination}, a world-renowned destination offering
                incredible experiences, rich culture, and unforgettable memories. From historic
                landmarks to modern attractions, this destination has something for every traveler.
              </p>
              <div className="space-y-3">
                <h3 className="font-semibold">Popular Attractions:</h3>
                {liveAttractions?.attractions?.length ? (
                  liveAttractions.attractions.slice(0, 6).map((attraction) => (
                    <div key={attraction.id} className="flex items-center gap-3">
                      {attraction.image ? (
                        <img
                          src={attraction.image}
                          alt={attraction.name ?? "Attraction"}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <PlaceImage
                          name={attraction.name ?? cityQuery}
                          country={cityQuery}
                          type="attraction"
                          alt={attraction.name ?? "Attraction"}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-sm">{attraction.name}</p>
                        {attraction.address && (
                          <p className="text-xs text-gray-500">{attraction.address}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Historic city center</li>
                    <li>World-class museums</li>
                    <li>Local cuisine experiences</li>
                    <li>Cultural landmarks</li>
                  </ul>
                )}
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

          <div className="flex gap-4">
            <Button
              onClick={handleBookNow}
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              View Trip Packages
            </Button>
            <Button variant="outline" size="lg" onClick={() => setLocation("/")}>
              Back to Search
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
