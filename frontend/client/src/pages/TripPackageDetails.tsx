// TripPackageDetails (/package/:id) - full bundle breakdown before checkout.
//
// :id is the destinationId from tripPackages (same as package id).
// Pricing uses cheapest hotel/flight unless you later add selectors.
// Attractions show as "Included" because JSON has no attraction prices.
//
// Reserve flow: build payment query → /signin?redirect=encoded(/payment?...)
// so the user must pass through mock sign-in before PaymentPage.
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DestinationMap from "@/components/DestinationMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  MapPin,
  Calendar,
  Plane,
  Hotel,
  Ticket,
  Users,
  Sparkles,
  Check,
} from "lucide-react";
import {
  fetchTripPackages,
  getCheapestHotel,
  getCheapestFlight,
  computeNights,
  computePackagePricing,
  type TripPackage,
} from "@/lib/tripPackages";
import { PlaceImage, PlaceImageBackground, parseDestinationLabel } from "@/components/PlaceImage";
import { fetchLiveAttractions, fetchLiveHotels } from "@/lib/liveData";

export default function TripPackageDetails() {
  // :id in the URL is the package / destination id from tripPackages.
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/package/:id");
  const packageId = params?.id ?? "";

  const queryString = location.split("?")[1] ?? "";
  const searchParams = new URLSearchParams(queryString);

  const passengers = Math.max(1, parseInt(searchParams.get("people") || "2", 10));
  const nights = computeNights(searchParams.get("startDate"), searchParams.get("endDate"));

  const { data: pkg, isLoading } = useQuery<TripPackage | undefined>({
    queryKey: ["trip-packages", packageId],
    queryFn: async () => {
      const packages = await fetchTripPackages();
      return packages.find((p) => p.id === packageId);
    },
  });

  const { data: liveAttractions } = useQuery({
    queryKey: ["live-attractions", pkg?.name, passengers],
    queryFn: () => fetchLiveAttractions(pkg!.name, passengers),
    enabled: Boolean(pkg?.name),
    staleTime: 1000 * 60 * 30,
  });

  const { data: liveHotels } = useQuery({
    queryKey: [
      "live-hotels",
      pkg?.name,
      searchParams.get("startDate"),
      searchParams.get("endDate"),
      passengers,
      searchParams.get("rooms"),
    ],
    queryFn: () =>
      fetchLiveHotels({
        city: pkg!.name,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        people: passengers,
        rooms: parseInt(searchParams.get("rooms") || "1", 10),
      }),
    enabled: Boolean(pkg?.name),
    staleTime: 1000 * 60 * 15,
  });

  // Go back to search results with the same query string.
  const handleCancel = () => {
    const query = searchParams.toString();
    setLocation(query ? `/search?${query}` : "/search");
  };

  // Reserve: package up the order details and send the user to sign in first,
  // then on to the payment page (via the redirect query param).
  const handleReserve = () => {
    if (!pkg) return;
    const pricing = computePackagePricing(pkg, { nights, passengers });
    const paymentParams = new URLSearchParams({
      destination: `${pkg.name}, ${pkg.country}`,
      startDate: searchParams.get("startDate") ?? "",
      endDate: searchParams.get("endDate") ?? "",
      people: String(passengers),
      rooms: searchParams.get("rooms") ?? "1",
      total: String(pricing.total),
      packageId: pkg.id,
    });
    // Per workflow: prompt sign in, then continue to payment.
    const redirect = `/payment?${paymentParams.toString()}`;
    setLocation(`/signin?redirect=${encodeURIComponent(redirect)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
            <div className="h-40 bg-muted animate-pulse rounded-xl" />
            <div className="h-40 bg-muted animate-pulse rounded-xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-6">
                We couldn't find that trip package.
              </p>
              {/* Unknown package id */}
              <Button onClick={handleCancel}>Back to Results</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const hotel = getCheapestHotel(pkg);
  const flight = getCheapestFlight(pkg);
  const pricing = computePackagePricing(pkg, { nights, passengers, hotel, flight });
  const liveHotelImage =
    liveHotels?.rooms?.find((room) => room.hotelImage)?.hotelImage ?? null;
  const attractionsWithImages =
    liveAttractions?.attractions?.filter((item) => item.name) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/10">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-8 shadow-lg">
              <PlaceImage
                name={pkg.name}
                country={pkg.country}
                imageUrl={pkg.imageUrl}
                type="destination"
                alt={`${pkg.name}, ${pkg.country}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {pkg.activities.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md">
                  {pkg.name}, {pkg.country}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/90">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {pkg.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {nights} nights
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {pkg.rating} ({pkg.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-8">{pkg.description}</p>

            <div className="mb-8">
              <DestinationMap
                destinationName={pkg.name}
                country={pkg.country}
                hotelName={hotel?.name}
                attractions={pkg.attractions}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Hotel className="h-5 w-5 text-primary" />
                      Hotel
                    </CardTitle>
                    <span className="text-lg font-bold text-primary">
                      ${pricing.hotelCost.toLocaleString()}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hotel ? (
                      <>
                        {liveHotelImage && (
                          <img
                            src={liveHotelImage}
                            alt={hotel.name}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-semibold">{hotel.name}</p>
                          <span className="flex items-center gap-1 text-sm whitespace-nowrap">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {hotel.rating} ({hotel.reviewCount})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${hotel.pricePerNight.toLocaleString()} / night × {nights} nights
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hotel.amenities.map((a) => (
                            <Badge key={a} variant="outline" className="text-xs">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hotel available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Plane className="h-5 w-5 text-primary" />
                      Flight
                    </CardTitle>
                    <span className="text-lg font-bold text-primary">
                      ${pricing.flightCost.toLocaleString()}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {flight ? (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{flight.airline}</p>
                            <p className="text-sm text-muted-foreground">{flight.class}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-semibold">
                              {flight.departureAirport} → {flight.arrivalAirport}
                            </p>
                            <p className="text-muted-foreground">{flight.duration}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          ${flight.price.toLocaleString()} / person × {passengers} travelers
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No flight available.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Ticket className="h-5 w-5 text-primary" />
                      Attractions
                    </CardTitle>
                    <span className="text-sm font-semibold text-green-600">Included</span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {attractionsWithImages.length > 0 ? (
                      attractionsWithImages.map((attraction) => (
                        <div key={attraction.id} className="flex items-start gap-3 text-sm">
                          {attraction.image ? (
                            <img
                              src={attraction.image}
                              alt={attraction.name ?? "Attraction"}
                              className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{attraction.name}</p>
                            {attraction.address && (
                              <p className="text-muted-foreground">{attraction.address}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : pkg.attractions.length > 0 ? (
                      pkg.attractions.map((attraction) => (
                        <div key={attraction.name} className="flex items-start gap-3 text-sm">
                          <PlaceImage
                            name={attraction.name}
                            country={pkg.name}
                            type="attraction"
                            alt={attraction.name}
                            className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="font-medium">{attraction.name}</p>
                            <p className="text-muted-foreground">{attraction.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No attractions listed for this destination.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-16">
                  <CardHeader>
                    <CardTitle className="text-xl">Price Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hotel ({nights} nights)</span>
                      <span>${pricing.hotelCost.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Flights ({passengers} pax)</span>
                      <span>${pricing.flightCost.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attractions</span>
                      <span className="text-green-600">Included</span>
                    </div>

                    <Separator />

                    <div className="flex items-end justify-between">
                      <span className="font-semibold">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">
                          ${pricing.total.toLocaleString()}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          ${pricing.perPerson.toLocaleString()} per person
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Sign in first, then /payment with order in URL */}
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      onClick={handleReserve}
                      data-testid="button-reserve"
                    >
                      Reserve
                    </Button>
                    {/* Back to /search with same criteria */}
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={handleCancel}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      You'll be asked to sign in before payment.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
