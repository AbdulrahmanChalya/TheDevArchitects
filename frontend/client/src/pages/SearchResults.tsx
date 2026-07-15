// SearchResults (/search) - AI trip package listing after sign-in.
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plane, Hotel, Loader2, Sparkles } from "lucide-react";
import {
  fetchVacationPackages,
  getVacationPackageId,
  getVacationPackagesQueryKey,
  readStoredVacationPackages,
  searchParamsFromUrl,
  type VacationPackage,
  writeSelectedVacationPackage,
  writeStoredVacationPackages,
} from "@/lib/backendSearch";
import { PlaceImage } from "@/components/PlaceImage";

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const [searchString, setSearchString] = useState(() =>
    typeof window === "undefined" ? "" : window.location.search,
  );

  // Wouter's location value omits query-only changes, so listen for our search event too.
  useEffect(() => {
    const refreshSearchString = () => {
      setSearchString(window.location.search);
    };

    refreshSearchString();
    window.addEventListener("popstate", refreshSearchString);
    window.addEventListener("getawayhub-search-updated", refreshSearchString);

    return () => {
      window.removeEventListener("popstate", refreshSearchString);
      window.removeEventListener("getawayhub-search-updated", refreshSearchString);
    };
  }, [location]);

  const searchParams = new URLSearchParams(searchString);

  const destination = searchParams.get("destination") || "";
  const countryCode = searchParams.get("countryCode") || "";
  const departureAirport = searchParams.get("departureAirport") || "";
  const arrivalAirport = searchParams.get("arrivalAirport") || "";
  const people = searchParams.get("people") || "";
  const budget = searchParams.get("budget") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const rooms = searchParams.get("rooms") || "";

  const formParams = searchParamsFromUrl(searchParams);
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
    // Avoid the "0 packages" flash when SearchBar already generated packages before navigation.
    initialData: () => readStoredVacationPackages(formParams),
    retry: false,
  });
  const isBuilding = hasSearchCriteria && !isError && packages.length === 0;

  // Open a package's detail page, carrying the current search params along.
  const handleViewPackage = (packageId: string, pkg: VacationPackage) => {
    writeStoredVacationPackages(formParams, packages);
    writeSelectedVacationPackage(formParams, packageId, pkg);

    const params = new URLSearchParams({
      destination,
      countryCode,
      departureAirport,
      arrivalAirport,
      people,
      budget,
      startDate,
      endDate,
      rooms,
    });
    setLocation(`/package/${packageId}?${params.toString()}`);
  };

  const formatMoney = (value: number) =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });

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
              {isBuilding
                ? "Building your getaway packages..."
                : `Found ${packages.length} package${packages.length === 1 ? "" : "s"} for your trip`}
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
          ) : !hasSearchCriteria ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  Start a search to build your trip packages
                </p>
                <Button onClick={() => setLocation("/")}>Back to Search</Button>
              </CardContent>
            </Card>
          ) : isBuilding ? (
            <div className="space-y-6">
              <Card>
                <CardContent className="py-10 text-center">
                  <Loader2 className="h-10 w-10 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-lg font-semibold text-foreground mb-2">
                    A great trip is on the way…
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your personalized getaway is coming together.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[460px] bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            </div>
          ) : packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, index) => {
                const packageId = getVacationPackageId(pkg, index);
                return (
                  <Card
                    key={packageId}
                    className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <PlaceImage
                        name={pkg.destinationCity}
                        type="destination"
                        alt={pkg.destinationCity}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0 shadow">
                        {pkg.hotel.nights} nights
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl line-clamp-1">
                        {pkg.destinationCity}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {pkg.comments}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Hotel className="h-4 w-4 text-primary" />
                          <span className="line-clamp-1">{pkg.hotel.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Plane className="h-4 w-4 text-primary" />
                          <span>
                            {pkg.flight.airline} • {pkg.flight.from}→{pkg.flight.to}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{pkg.attractionsPlan.attractions.length} suggested attractions</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {pkg.attractionsPlan.attractions.slice(0, 3).map((attraction) => (
                          <Badge key={attraction.id || attraction.name} variant="secondary" className="text-xs">
                            {attraction.name}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-auto pt-4 border-t">
                        <div className="flex items-end justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Package Price</p>
                            <p className="text-2xl font-bold text-primary">
                              ${formatMoney(pkg.totalCost)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${formatMoney(pkg.perPersonCost)} per person
                            </p>
                          </div>
                        </div>
                        {/* Open bundle page for this package (keeps search params) */}
                        <Button onClick={() => handleViewPackage(packageId, pkg)} className="w-full">
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
