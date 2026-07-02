// SearchResults (/search) - trip package listing after sign-in.
//
// SearchBar starts GET /api/search in the background before sign-in; this page
// reuses that React Query cache while still showing packages from JSON.
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar, Plane, Hotel, Sparkles } from "lucide-react";
import {
  fetchTripPackages,
  getCheapestHotel,
  getCheapestFlight,
  computeNights,
  computePackagePricing,
  type TripPackage,
} from "@/lib/tripPackages";
import {
  fetchBackendSearch,
  getBackendSearchQueryKey,
  searchParamsFromUrl,
} from "@/lib/backendSearch";
import { PlaceImage } from "@/components/PlaceImage";

export default function SearchResults() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const destination = searchParams.get("destination") || "";
  const departureAirport = searchParams.get("departureAirport") || "";
  const arrivalAirport = searchParams.get("arrivalAirport") || "";
  const people = searchParams.get("people") || "";
  const budget = searchParams.get("budget") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const rooms = searchParams.get("rooms") || "";

  const formParams = searchParamsFromUrl(searchParams);

  // Track live backend search if SearchBar already started one (never blocks the UI).
  const { isFetching: isBackendSearchRunning } = useQuery({
    queryKey: getBackendSearchQueryKey(formParams),
    queryFn: () => fetchBackendSearch(formParams),
    enabled: false,
    retry: false,
  });

  // Default to 2 travelers and compute the number of nights from the dates.
  const passengers = Math.max(1, parseInt(people || "2", 10));
  const nights = computeNights(startDate, endDate);

  // Load merged packages from tripPackages.ts (four JSON files).
  const { data: packages, isLoading, isError } = useQuery<TripPackage[]>({
    queryKey: ["trip-packages"],
    queryFn: fetchTripPackages,
    retry: 1,
  });

  // Filter packages: destination is a loose substring match; budget is max total.
  const results = (packages ?? []).filter((pkg) => {
    if (destination) {
      const haystack = `${pkg.name} ${pkg.country}`.toLowerCase();
      if (!haystack.includes(destination.toLowerCase())) {
        // Allow partial match on either side (e.g. "Paris, France" vs "Paris")
        const needle = destination.split(",")[0].trim().toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
    }
    if (budget) {
      const { total } = computePackagePricing(pkg, { nights, passengers });
      if (total > parseInt(budget, 10)) return false;
    }
    return true;
  });

  // Open a package's detail page, carrying the current search params along.
  const handleViewPackage = (packageId: string) => {
    const params = new URLSearchParams({
      destination,
      departureAirport,
      arrivalAirport,
      people,
      startDate,
      endDate,
      rooms,
    });
    setLocation(`/package/${packageId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-muted/30 border-b py-6">
        <div className="container mx-auto px-4 md:px-6">
          <SearchBar variant="compact" />
        </div>
      </section>

      <section className="bg-background py-4 border-b">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap gap-2 items-center">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Trip Packages:</span>
            {destination && <Badge variant="secondary">Destination: {destination}</Badge>}
            {departureAirport && <Badge variant="secondary">From: {departureAirport.split(" - ")[0]}</Badge>}
            {arrivalAirport && <Badge variant="secondary">To: {arrivalAirport.split(" - ")[0]}</Badge>}
            {people && <Badge variant="secondary">{people} travelers</Badge>}
            {startDate && endDate && <Badge variant="secondary">{startDate} to {endDate}</Badge>}
            {budget && <Badge variant="secondary">Budget: ${budget}</Badge>}
            {rooms && <Badge variant="secondary">{rooms} rooms</Badge>}
          </div>
        </div>
      </section>

      <section className="py-12 flex-1 bg-muted/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Your Trip Packages
            </h1>
            <p className="text-muted-foreground">
              {isLoading
                ? "Building your getaway packages..."
                : `Found ${results.length} package${results.length === 1 ? "" : "s"} for your trip`}
              {isBackendSearchRunning && !isLoading && (
                <span className="ml-2 text-xs text-primary">(fetching live prices…)</span>
              )}
            </p>
          </div>

          {isError ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  Could not load trip packages
                </p>
                <Button onClick={() => setLocation("/")}>Back to Home</Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[460px] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((pkg) => {
                const hotel = getCheapestHotel(pkg);
                const flight = getCheapestFlight(pkg);
                const { total, perPerson } = computePackagePricing(pkg, {
                  nights,
                  passengers,
                });

                return (
                  <Card
                    key={pkg.id}
                    className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <PlaceImage
                        name={pkg.name}
                        country={pkg.country}
                        imageUrl={pkg.imageUrl}
                        type="destination"
                        alt={`${pkg.name}, ${pkg.country}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0 shadow">
                        {nights} nights
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl line-clamp-1">
                        {pkg.name}, {pkg.country}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{pkg.rating}</span>
                          <span>({pkg.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {pkg.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        {hotel && (
                          <div className="flex items-center gap-2 text-sm">
                            <Hotel className="h-4 w-4 text-primary" />
                            <span className="line-clamp-1">{hotel.name}</span>
                          </div>
                        )}
                        {flight && (
                          <div className="flex items-center gap-2 text-sm">
                            <Plane className="h-4 w-4 text-primary" />
                            <span>
                              {flight.airline} • {flight.departureAirport}→{flight.arrivalAirport}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{pkg.attractions.length} attractions included</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {pkg.activities.slice(0, 3).map((activity) => (
                          <Badge key={activity} variant="secondary" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 border-t">
                        <div className="flex items-end justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Package Price</p>
                            <p className="text-2xl font-bold text-primary">
                              ${total.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${perPerson.toLocaleString()} per person
                            </p>
                          </div>
                        </div>
                        {/* Open bundle page for this package (keeps search params) */}
                        <Button onClick={() => handleViewPackage(pkg.id)} className="w-full">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  No packages found matching your criteria
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Try adjusting your destination or budget
                </p>
                {/* No matches — return to Home to search again */}
                <Button onClick={() => setLocation("/")}>Back to Search</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
