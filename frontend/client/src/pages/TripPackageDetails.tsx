// TripPackageDetails (/package/:id) - full AI package breakdown before checkout.
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
  Calendar,
  Check,
  Hotel,
  Plane,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import {
  fetchVacationPackages,
  getVacationPackageId,
  getVacationPackagesQueryKey,
  readSelectedVacationPackage,
  readStoredVacationPackages,
  searchParamsFromUrl,
  type VacationPackage,
} from "@/lib/backendSearch";
import { PlaceImage } from "@/components/PlaceImage";

export default function TripPackageDetails() {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/package/:id");
  const packageId = params?.id ?? "";

  const searchString =
    typeof window === "undefined" ? location.split("?")[1] ?? "" : window.location.search;
  const searchParams = new URLSearchParams(searchString);
  const formParams = searchParamsFromUrl(searchParams);
  const passengers = Math.max(1, parseInt(searchParams.get("people") || "1", 10));
  const hasSearchCriteria = Boolean(
    formParams.destination ||
      formParams.startDate ||
      formParams.departureAirport ||
      formParams.arrivalAirport,
  );

  const {
    data: packages = [],
    isLoading,
    isFetching,
    isError,
  } = useQuery<VacationPackage[]>({
    queryKey: getVacationPackagesQueryKey(formParams),
    queryFn: () => fetchVacationPackages(formParams),
    enabled: hasSearchCriteria,
    // Details can render instantly from the package selected on /search.
    initialData: () => readStoredVacationPackages(formParams),
    retry: false,
  });

  // Prefer the exact clicked package; fall back to the refetched package list after refresh.
  const selectedPackage = readSelectedVacationPackage(formParams, packageId);
  const generatedPackage = packages.find(
    (candidate, index) => getVacationPackageId(candidate, index) === packageId,
  );
  const pkg = selectedPackage ?? generatedPackage;
  const isBuilding = isLoading || (isFetching && !pkg);
  const mapCountry = formParams.countryCode || undefined;

  const handleCancel = () => {
    const query = searchParams.toString();
    setLocation(query ? `/search?${query}` : "/search");
  };

  const handleReserve = () => {
    if (!pkg) return;
    const paymentParams = new URLSearchParams({
      destination: pkg.destinationCity,
      startDate: searchParams.get("startDate") ?? "",
      endDate: searchParams.get("endDate") ?? "",
      people: String(passengers),
      rooms: searchParams.get("rooms") ?? "1",
      total: String(pkg.totalCost),
      packageId: pkg.vacationId,
    });
    const redirect = `/payment?${paymentParams.toString()}`;
    setLocation(`/signin?redirect=${encodeURIComponent(redirect)}`);
  };

  const formatMoney = (value: number) =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });

  if (isBuilding) {
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

  if (isError || !pkg) {
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
              <Button onClick={handleCancel}>Back to Results</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/10">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-8 shadow-lg">
              <PlaceImage
                name={pkg.destinationCity}
                type="destination"
                alt={pkg.destinationCity}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary">{pkg.hotel.nights} nights</Badge>
                  <Badge variant="secondary">{pkg.flight.from} to {pkg.flight.to}</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md">
                  {pkg.destinationCity}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/90">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {searchParams.get("startDate") || "Start"} to {searchParams.get("endDate") || "End"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {passengers} traveler{passengers === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-8">{pkg.comments}</p>

            <div className="mb-8">
              <DestinationMap
                destinationName={pkg.destinationCity}
                country={mapCountry}
                hotelName={pkg.hotel.name}
                attractions={pkg.attractionsPlan.attractions}
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
                      ${formatMoney(pkg.hotel.totalHotelCost)}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold">{pkg.hotel.name}</p>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {pkg.hotel.nights} nights
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${formatMoney(pkg.hotel.pricePerNight)} / night x {pkg.hotel.nights} nights
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Plane className="h-5 w-5 text-primary" />
                      Flight
                    </CardTitle>
                    <span className="text-lg font-bold text-primary">
                      ${formatMoney(pkg.flight.totalFlightCost)}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{pkg.flight.airline}</p>
                        <p className="text-sm text-muted-foreground">
                          ${formatMoney(pkg.flight.pricePerPerson)} / person
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">
                          {pkg.flight.from}{" -> "}{pkg.flight.to}
                        </p>
                        <p className="text-muted-foreground">{passengers} traveler{passengers === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Ticket className="h-5 w-5 text-primary" />
                      Attractions
                    </CardTitle>
                    <span className="text-sm font-semibold text-muted-foreground">
                      Price not included
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pkg.attractionsPlan.attractions.length > 0 ? (
                      pkg.attractionsPlan.attractions.map((attraction) => (
                        <div key={attraction.id || attraction.name} className="flex items-start gap-3 text-sm">
                          <PlaceImage
                            name={attraction.name}
                            country={pkg.destinationCity}
                            type="attraction"
                            alt={attraction.name}
                            className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="font-medium">{attraction.name}</p>
                            <p className="text-muted-foreground">
                              {attraction.pricePerPerson > 0
                                ? `$${formatMoney(attraction.pricePerPerson)} / person`
                                : "Price not included"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No attractions listed for this package.
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
                      <span className="text-muted-foreground">Hotel</span>
                      <span>${formatMoney(pkg.hotel.totalHotelCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Flights</span>
                      <span>${formatMoney(pkg.flight.totalFlightCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Attractions</span>
                      <span className="text-muted-foreground">Not included</span>
                    </div>

                    <Separator />

                    <div className="flex items-end justify-between">
                      <span className="font-semibold">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">
                          ${formatMoney(pkg.totalCost)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          ${formatMoney(pkg.perPersonCost)} per person
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      onClick={handleReserve}
                      data-testid="button-reserve"
                    >
                      Reserve
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={handleCancel}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                      <Check className="h-3 w-3" />
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
