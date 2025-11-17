import { useState, useRef, useEffect } from "react";
import { MapPin, Users, DollarSign, Calendar, Bed, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
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
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    rooms: ""
  });

  const [travelers, setTravelers] = useState({
    adults: 1,
    children: 0,
    pets: 0,
    rooms: 1
  });

  const [showTravelersDropdown, setShowTravelersDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateError, setDateError] = useState("");
  const travelersRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState(DESTINATION_SUGGESTIONS);
  const destinationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
      if (travelersRef.current && !travelersRef.current.contains(event.target as Node)) {
        setShowTravelersDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const autoAdjustRooms = (adults: number, children: number, currentRooms: number) => {
    const totalGuests = adults + children;
    const maxGuestsPerRoom = 4; // Assuming max 4 guests per room
    const minRoomsNeeded = Math.ceil(totalGuests / maxGuestsPerRoom);
    
    return Math.max(minRoomsNeeded, currentRooms);
  };

  const updateTravelers = (type: 'adults' | 'children' | 'pets' | 'rooms', increment: boolean) => {
    setTravelers(prev => {
      const newValue = increment ? prev[type] + 1 : Math.max(0, prev[type] - 1);
      if ((type === 'adults' || type === 'rooms') && newValue < 1) return prev; // At least 1 adult and 1 room required
      
      let updated = { ...prev, [type]: newValue };
      
      // Auto-adjust rooms when guests change
      if (type === 'adults' || type === 'children') {
        const adjustedRooms = autoAdjustRooms(updated.adults, updated.children, updated.rooms);
        updated = { ...updated, rooms: adjustedRooms };
      }
      
      const total = updated.adults + updated.children;
      
      setSearchData(prevData => ({ 
        ...prevData, 
        people: total.toString(),
        rooms: updated.rooms.toString()
      }));
      return updated;
    });
  };

  const getDateRangeText = () => {
    if (searchData.startDate && searchData.endDate) {
      return `${format(searchData.startDate, "MMM dd, yyyy")} - ${format(searchData.endDate, "MMM dd, yyyy")}`;
    } else if (searchData.startDate) {
      return `${format(searchData.startDate, "MMM dd, yyyy")} - End date`;
    }
    return "Select dates";
  };

  const getTravelersText = () => {
    let text = `${travelers.adults} adult${travelers.adults !== 1 ? 's' : ''}`;
    if (travelers.children > 0) {
      text += `, ${travelers.children} child${travelers.children !== 1 ? 'ren' : ''}`;
    }
    text += `, ${travelers.rooms} room${travelers.rooms !== 1 ? 's' : ''}`;
    if (travelers.pets > 0) {
      text += `, ${travelers.pets} pet${travelers.pets !== 1 ? 's' : ''}`;
    }
    return text;
  };

  const validateDates = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (startDate && endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        setDateError("Start date cannot be in the past");
        return false;
      }
      if (startDate >= endDate) {
        setDateError("End date must be after start date");
        return false;
      }
    }
    setDateError("");
    return true;
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setSearchData({ ...searchData, startDate: date });
    validateDates(date, searchData.endDate);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setSearchData({ ...searchData, endDate: date });
    validateDates(searchData.startDate, date);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates(searchData.startDate, searchData.endDate)) {
      return;
    }
    
    console.log("Search triggered with:", searchData);
    const params = new URLSearchParams({
      destination: searchData.destination,
      people: searchData.people,
      budget: searchData.budget,
      startDate: searchData.startDate ? format(searchData.startDate, 'yyyy-MM-dd') : '',
      endDate: searchData.endDate ? format(searchData.endDate, 'yyyy-MM-dd') : '',
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
      {/* Destination Field - Full Width Row */}
      <div className="mb-6">
        <div className="space-y-3 relative" ref={destinationRef}>
          <Label htmlFor="destination" className="text-sm font-semibold text-gray-700">
            Where are you going?
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 z-10" />
            <Input
              id="destination"
              type="text"
              placeholder="Search destinations..."
              className="pl-12 h-12 text-base border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
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
      </div>

      {/* Other Search Fields */}
      <div className={`grid gap-6 ${isHero ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>

        {/* Date Range */}
        <div className="space-y-3 relative" ref={dateRef}>
          <Label htmlFor="dateRange" className="text-sm font-semibold text-gray-700">
            Dates
          </Label>
          <Button
            type="button"
            variant="outline"
            className={`w-full justify-start text-left font-normal pl-12 h-12 text-base border-2 hover:border-blue-300 transition-colors ${
              !searchData.startDate && !searchData.endDate && "text-gray-500"
            } ${dateError ? 'border-red-500' : ''}`}
            onClick={() => setShowDateDropdown(!showDateDropdown)}
          >
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            {getDateRangeText()}
          </Button>
          
          {showDateDropdown && (
            <div className="absolute z-50 w-auto mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
              <div className="flex gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Check-in</Label>
                  <CalendarComponent
                    mode="single"
                    selected={searchData.startDate}
                    onSelect={handleStartDateChange}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Check-out</Label>
                  <CalendarComponent
                    mode="single"
                    selected={searchData.endDate}
                    onSelect={handleEndDateChange}
                    disabled={(date) => date < (searchData.startDate || new Date())}
                    className="rounded-md border"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Travelers & Rooms */}
        <div className="space-y-3 relative" ref={travelersRef}>
          <Label htmlFor="travelers" className="text-sm font-semibold text-gray-700">
            Guests & Rooms
          </Label>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal pl-12 h-12 text-base border-2 hover:border-blue-300 transition-colors"
            onClick={() => setShowTravelersDropdown(!showTravelersDropdown)}
          >
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            {getTravelersText()}
          </Button>
          
          {showTravelersDropdown && (
            <div className="absolute z-50 w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-6">
              {/* Adults */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Adults</div>
                  <div className="text-sm text-gray-500 mt-1">Ages 13+</div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => updateTravelers('adults', false)}
                    disabled={travelers.adults <= 1}
                  >
                    <span className="text-lg font-semibold">−</span>
                  </Button>
                  <span className="w-12 text-center text-lg font-semibold">{travelers.adults}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => updateTravelers('adults', true)}
                  >
                    <span className="text-lg font-semibold">+</span>
                  </Button>
                </div>
              </div>
              
              {/* Children */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Children</div>
                  <div className="text-sm text-gray-500 mt-1">Ages 2-12</div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => updateTravelers('children', false)}
                    disabled={travelers.children <= 0}
                  >
                    <span className="text-lg font-semibold">−</span>
                  </Button>
                  <span className="w-12 text-center text-lg font-semibold">{travelers.children}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => updateTravelers('children', true)}
                  >
                    <span className="text-lg font-semibold">+</span>
                  </Button>
                </div>
              </div>
              
              {/* Rooms */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Rooms</div>
                  <div className="text-sm text-gray-500 mt-1">Hotel rooms needed</div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => updateTravelers('rooms', false)}
                    disabled={travelers.rooms <= 1}
                  >
                    <span className="text-lg font-semibold">−</span>
                  </Button>
                  <span className="w-12 text-center text-lg font-semibold">{travelers.rooms}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => updateTravelers('rooms', true)}
                  >
                    <span className="text-lg font-semibold">+</span>
                  </Button>
                </div>
              </div>
              
              {/* Pets */}
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Pets</div>
                  <div className="text-sm text-gray-500 mt-1">Service animals</div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => updateTravelers('pets', false)}
                    disabled={travelers.pets <= 0}
                  >
                    <span className="text-lg font-semibold">−</span>
                  </Button>
                  <span className="w-12 text-center text-lg font-semibold">{travelers.pets}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-full border-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => updateTravelers('pets', true)}
                  >
                    <span className="text-lg font-semibold">+</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <Label htmlFor="budget" className="text-sm font-semibold text-gray-700">
            Budget (USD)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            <Input
              id="budget"
              type="number"
              min="0"
              step="100"
              placeholder="Total budget"
              className="pl-12 h-12 text-base border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
              value={searchData.budget}
              onChange={(e) => setSearchData({ ...searchData, budget: e.target.value })}
              data-testid="input-budget"
            />
          </div>
        </div>
      </div>

      {dateError && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
          {dateError}
        </div>
      )}

      <Button 
        type="submit" 
        size="lg" 
        className="w-full mt-8 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
        disabled={!!dateError}
        data-testid="button-search"
      >
        <Search className="h-6 w-6 mr-3" />
        Find My Perfect Getaway
      </Button>
    </form>
  );
}
