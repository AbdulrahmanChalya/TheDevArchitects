import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import DestinationCard from "@/components/DestinationCard";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  activities: string[];
  flightTimeFromNYC: string;
}

export default function SearchResults() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  
  const destination = searchParams.get('destination') || '';
  const people = searchParams.get('people') || '';
  const budget = searchParams.get('budget') || '';
  const days = searchParams.get('days') || '';
  const rooms = searchParams.get('rooms') || '';

  // TODO: remove mock functionality - Replace with actual API call with search filters
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations", destination, budget],
    queryFn: async () => {
      const response = await fetch("/backend/destinations.json");
      const data = await response.json();
      
      // Simple filtering based on search criteria
      let filtered = data;
      
      if (destination) {
        filtered = filtered.filter((d: Destination) => 
          d.name.toLowerCase().includes(destination.toLowerCase()) ||
          d.country.toLowerCase().includes(destination.toLowerCase())
        );
      }
      
      if (budget) {
        const budgetNum = parseInt(budget);
        const daysNum = parseInt(days) || 7;
        const maxPricePerNight = budgetNum / daysNum;
        filtered = filtered.filter((d: Destination) => d.pricePerNight <= maxPricePerNight);
      }
      
      return filtered;
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Search Bar Section */}
      <section className="bg-muted/30 border-b py-6">
        <div className="container mx-auto px-4 md:px-6">
          <SearchBar variant="compact" />
        </div>
      </section>

      {/* Search Criteria Summary */}
      <section className="bg-background py-4 border-b">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Search filters:</span>
            {destination && <Badge variant="secondary">Destination: {destination}</Badge>}
            {people && <Badge variant="secondary">{people} travelers</Badge>}
            {days && <Badge variant="secondary">{days} days</Badge>}
            {budget && <Badge variant="secondary">Budget: ${budget}</Badge>}
            {rooms && <Badge variant="secondary">{rooms} rooms</Badge>}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Search Results
            </h1>
            <p className="text-muted-foreground">
              {isLoading ? 'Searching...' : `Found ${destinations?.length || 0} destinations`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : destinations && destinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  id={destination.id}
                  name={destination.name}
                  country={destination.country}
                  description={destination.description}
                  image={destination.image}
                  rating={destination.rating}
                  reviewCount={destination.reviewCount}
                  pricePerNight={destination.pricePerNight}
                  activities={destination.activities}
                  flightTime={destination.flightTimeFromNYC}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  No destinations found matching your criteria
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
