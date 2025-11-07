import { useState, useRef, useEffect } from "react";
import { MapPin, Users, DollarSign, Calendar, Bed, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

// TODO: remove mock functionality - Replace with actual API data
const DESTINATION_SUGGESTIONS = [
  "Paris, France",
  "Tokyo, Japan",
  "Bali, Indonesia",
  "New York, USA",
  "Santorini, Greece",
  "Swiss Alps, Switzerland",
  "Machu Picchu, Peru",
  "Amalfi Coast, Italy",
  "London, UK",
  "Dubai, UAE",
  "Barcelona, Spain",
  "Rome, Italy"
];

export default function SearchBar({ variant = "hero" }: SearchBarProps) {
  const [, setLocation] = useLocation();
  const [searchData, setSearchData] = useState({
    destination: "",
    people: "",
    budget: "",
    days: "",
    rooms: ""
  });

  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState(DESTINATION_SUGGESTIONS);
  const destinationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search triggered with:", searchData);
    const params = new URLSearchParams({
      destination: searchData.destination,
      people: searchData.people,
      budget: searchData.budget,
      days: searchData.days,
      rooms: searchData.rooms
    });
    setLocation(`/search?${params.toString()}`);
    setShowDestinationSuggestions(false);
  };

  const handleDestinationChange = (value: string) => {
    setSearchData({ ...searchData, destination: value });
    const filtered = DESTINATION_SUGGESTIONS.filter(dest =>
      dest.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDestinations(filtered);
    setShowDestinationSuggestions(true);
  };

  const selectDestination = (destination: string) => {
    setSearchData({ ...searchData, destination });
    setShowDestinationSuggestions(false);
  };

  const isHero = variant === "hero";

  return (
    <form 
      onSubmit={handleSearch} 
      className={`w-full ${isHero ? 'bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8' : 'bg-card rounded-xl shadow-md p-4'}`}
      data-testid="form-search"
    >
      <div className={`grid gap-4 ${isHero ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'}`}>
        {/* Destination with Autocomplete */}
        <div className="space-y-2 relative" ref={destinationRef}>
          <Label htmlFor="destination" className="text-sm font-medium">
            Destination
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              id="destination"
              type="text"
              placeholder="Where to?"
              className="pl-10"
              value={searchData.destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onFocus={() => setShowDestinationSuggestions(true)}
              data-testid="input-destination"
            />
          </div>
          {showDestinationSuggestions && filteredDestinations.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-popover-border rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredDestinations.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => selectDestination(dest)}
                  className="w-full text-left px-4 py-2.5 hover-elevate text-sm text-foreground"
                  data-testid={`suggestion-destination-${dest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {dest}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Travelers - User Input */}
        <div className="space-y-2">
          <Label htmlFor="people" className="text-sm font-medium">
            Travelers
          </Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="people"
              type="number"
              min="1"
              placeholder="Number of travelers"
              className="pl-10"
              value={searchData.people}
              onChange={(e) => setSearchData({ ...searchData, people: e.target.value })}
              data-testid="input-people"
            />
          </div>
        </div>

        {/* Duration - User Input */}
        <div className="space-y-2">
          <Label htmlFor="days" className="text-sm font-medium">
            Duration (days)
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="days"
              type="number"
              min="1"
              placeholder="Number of days"
              className="pl-10"
              value={searchData.days}
              onChange={(e) => setSearchData({ ...searchData, days: e.target.value })}
              data-testid="input-days"
            />
          </div>
        </div>

        {/* Budget - User Input */}
        <div className="space-y-2">
          <Label htmlFor="budget" className="text-sm font-medium">
            Budget ($)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="budget"
              type="number"
              min="0"
              placeholder="Your budget"
              className="pl-10"
              value={searchData.budget}
              onChange={(e) => setSearchData({ ...searchData, budget: e.target.value })}
              data-testid="input-budget"
            />
          </div>
        </div>

        {/* Rooms - User Input */}
        <div className="space-y-2">
          <Label htmlFor="rooms" className="text-sm font-medium">
            Rooms
          </Label>
          <div className="relative">
            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="rooms"
              type="number"
              min="1"
              placeholder="Number of rooms"
              className="pl-10"
              value={searchData.rooms}
              onChange={(e) => setSearchData({ ...searchData, rooms: e.target.value })}
              data-testid="input-rooms"
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full mt-6"
        data-testid="button-search"
      >
        <Search className="h-5 w-5 mr-2" />
        Search Getaways
      </Button>
    </form>
  );
}
