import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import DestinationCard from "@/components/DestinationCard";
import RecommendationCard from "@/components/RecommendationCard";
import Footer from "@/components/Footer";
import heroImage from "@assets/generated_images/Hero_tropical_beach_scene_e5fdeadc.png";
import { Lightbulb } from "lucide-react";

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

interface Activity {
  name: string;
  description: string;
  icon: string;
}

interface Recommendation {
  id: string;
  destination: string;
  tagline: string;
  image: string;
  activities: Activity[];
  bestTime: string;
  estimatedBudget: string;
}

export default function Home() {
  // TODO: remove mock functionality - Replace with actual API call
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
    queryFn: async () => {
      const response = await fetch("/backend/destinations.json");
      return response.json();
    }
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
    queryFn: async () => {
      const response = await fetch("/backend/recommendations.json");
      return response.json();
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url(${heroImage})`
        }}
      >
        <div className="container mx-auto px-4 md:px-6 text-center z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Discover Your Perfect Getaway
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Plan your dream vacation with real-time flights, hotels, and personalized itineraries
          </p>
          
          <div className="max-w-5xl mx-auto">
            <SearchBar variant="hero" />
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Destinations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our handpicked selection of amazing travel destinations around the world
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations?.map((destination) => (
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
          )}
        </div>
      </section>

      {/* Travel Recommendations Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Travel Recommendations
              </h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get inspired! Discover where to go and what amazing activities await you
            </p>
          </div>

          {recommendationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recommendations?.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  destination={rec.destination}
                  tagline={rec.tagline}
                  image={rec.image}
                  activities={rec.activities}
                  bestTime={rec.bestTime}
                  estimatedBudget={rec.estimatedBudget}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
