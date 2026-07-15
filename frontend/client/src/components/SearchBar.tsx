import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Bed,
  Search,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isValid } from "date-fns";
import { useLocation } from "wouter";
import { startBackendSearch } from "@/lib/backendSearch";
import { backendUrl } from "@/lib/backendUrl";
import { useAuth } from "@/contexts/AuthContext";

// SearchBar — trip search form used on Home and SearchResults.
// Submit starts backend search in the background, then sign-in → /search.
// On /search, reads the same params back into the form (shareable URL).

interface SearchBarProps {
  variant?: "hero" | "compact"; // "hero" on Home, "compact" on SearchResults
  destinationPreset?: DestinationPreset;
}

export interface DestinationPreset {
  city: string;
  country: string;
  countryCode: string;
  airportSearchCity?: string;
  selectionId: number;
}

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface DestinationSuggestion {
  city: string;
  country: string;
  countryCode: string;
  label: string;
  placeId?: string;
  description?: string;
}

function normalizeCity(value: string) {
  return value
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/\s+city$/, "");
}

function formatAirportLabel(airport: Airport) {
  return `${airport.code} - ${airport.name} (${airport.city})`;
}

// City autocomplete is intentionally API-backed only; no local destination JSON fallback.
async function fetchGoogleCitySuggestions(input: string): Promise<DestinationSuggestion[]> {
  if (input.trim().length < 2) return [];

  const params = new URLSearchParams({
    input: input.trim(),
    languageCode: "en",
  });
  const response = await fetch(backendUrl(`/api/places/autocomplete?${params.toString()}`));

  if (!response.ok) {
    throw new Error(`City autocomplete failed (${response.status})`);
  }

  const data = await response.json();
  return (data.suggestions ?? []).map((suggestion: any) => ({
    city: suggestion.city,
    country: suggestion.country || "",
    countryCode: "",
    label: suggestion.label || suggestion.city,
    placeId: suggestion.placeId,
    description: suggestion.description,
  }));
}

async function fetchGooglePlaceDetails(placeId: string) {
  const params = new URLSearchParams({ placeId });
  const response = await fetch(backendUrl(`/api/places/details?${params.toString()}`));

  if (!response.ok) {
    throw new Error(`Place details failed (${response.status})`);
  }

  return response.json() as Promise<{
    country?: string;
    countryCode?: string;
  }>;
}

async function fetchAirportSuggestions(input: string): Promise<Airport[]> {
  const params = new URLSearchParams({ query: input.trim() });
  const response = await fetch(backendUrl(`/api/airports/suggestions?${params.toString()}`));

  if (!response.ok) {
    throw new Error(`Airport suggestions failed (${response.status})`);
  }

  const data = await response.json();
  return Array.isArray(data.airports) ? data.airports : [];
}

export default function SearchBar({ variant = "hero", destinationPreset }: SearchBarProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Text fields + dates that get serialized into the URL on search.
  // people/rooms are strings because they mirror URL params; travelers
  // below holds the numeric counts that update people/rooms on change.
  const [searchData, setSearchData] = useState({
    destination: "",       // e.g. "Paris"
    countryCode: "",
    departureAirport: "",  // full label string from suggestions
    arrivalAirport: "",
    people: "1",           // total guests as string (adults + children)
    budget: "",            // max USD budget as string
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    rooms: "1",            // room count as string
  });

  // Guest/room counts (synced into searchData.people and searchData.rooms).
  const [travelers, setTravelers] = useState({
    adults: 1,
    children: 0,
    pets: 0,
    rooms: 1
  });

  const [showTravelersDropdown, setShowTravelersDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateError, setDateError] = useState("");
  const [formError, setFormError] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  // After geolocation, departure airport list is replaced with API/fallback nearby results
  const [nearbyAirports, setNearbyAirports] = useState<string[]>([]);
  const travelersRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Autocomplete open state and filtered suggestion lists.
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [showDepartureAirportSuggestions, setShowDepartureAirportSuggestions] = useState(false);
  const [showArrivalAirportSuggestions, setShowArrivalAirportSuggestions] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<DestinationSuggestion[]>([]);
  const [filteredDepartureAirports, setFilteredDepartureAirports] = useState<string[]>([]);
  const [filteredArrivalAirports, setFilteredArrivalAirports] = useState<string[]>([]);
  const [destinationAutocompleteStatus, setDestinationAutocompleteStatus] =
    useState<"idle" | "loading">("idle");
  const [arrivalAirportStatus, setArrivalAirportStatus] =
    useState<"idle" | "loading">("idle");
  const destinationRef = useRef<HTMLDivElement>(null);
  const departureAirportRef = useRef<HTMLDivElement>(null);
  const arrivalAirportRef = useRef<HTMLDivElement>(null);
  const arrivalRequestRef = useRef(0);

  const airportLabels = airports.map(formatAirportLabel);

  useEffect(() => {
    setFormError("");
  }, [
    searchData.destination,
    searchData.departureAirport,
    searchData.arrivalAirport,
    searchData.people,
    searchData.rooms,
    searchData.startDate,
    searchData.endDate,
    searchData.budget,
  ]);

  // Match against airports already loaded from Duffel or the local departure fallback.
  const getArrivalAirportsForDestination = (destination: string) => {
    const target = normalizeCity(destination);
    if (!target) return [];

    return airports
      .filter((airport) => {
        const airportCity = normalizeCity(airport.city);
        return airportCity === target || airportCity.includes(target) || target.includes(airportCity);
      })
      .map(formatAirportLabel);
  };

  const hasExactAirportCityMatch = (destination: string) => {
    const target = normalizeCity(destination);
    if (!target) return false;

    return airports.some((airport) => normalizeCity(airport.city) === target);
  };

  // Close open suggestion panels on outside click.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false);
      }
      if (departureAirportRef.current && !departureAirportRef.current.contains(event.target as Node)) {
        setShowDepartureAirportSuggestions(false);
      }
      if (arrivalAirportRef.current && !arrivalAirportRef.current.contains(event.target as Node)) {
        setShowArrivalAirportSuggestions(false);
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

  useEffect(() => {
    let cancelled = false;

    async function loadSearchData() {
      try {
        // Keep a local fallback because Google city places do not provide flight-ready IATA codes.
        const airportsResponse = await fetch("/backend/airports.json");

        if (!airportsResponse.ok) {
          throw new Error("Airport autocomplete data request failed.");
        }

        const loadedAirports = (await airportsResponse.json()) as Airport[];
        if (cancelled) return;

        const loadedAirportLabels = loadedAirports.map(formatAirportLabel);

        setAirports(loadedAirports);
        setFilteredDepartureAirports(loadedAirportLabels);
        setFilteredArrivalAirports(loadedAirportLabels);
      } catch (error) {
        console.warn("Could not load airport autocomplete data:", error);
      }
    }

    void loadSearchData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!searchData.destination || airports.length === 0) return;

    const matchingArrivalAirports = getArrivalAirportsForDestination(searchData.destination);
    if (matchingArrivalAirports.length > 0) {
      setFilteredArrivalAirports(matchingArrivalAirports);
    }
  }, [airports, searchData.destination]);

  useEffect(() => {
    const input = searchData.destination.trim();

    if (input.length < 2) {
      setDestinationAutocompleteStatus("idle");
      setFilteredDestinations([]);
      return;
    }

    let cancelled = false;
    setDestinationAutocompleteStatus("loading");
    setFilteredDestinations([]);

    const timeout = window.setTimeout(async () => {
      try {
        const googleSuggestions = await fetchGoogleCitySuggestions(input);
        if (cancelled) return;

        if (googleSuggestions.length > 0) {
          setFilteredDestinations(googleSuggestions);
          setDestinationAutocompleteStatus("idle");
          return;
        }
      } catch (error) {
        console.warn("Google city autocomplete unavailable:", error);
      }

      if (!cancelled) {
        setFilteredDestinations([]);
        setDestinationAutocompleteStatus("idle");
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [searchData.destination]);

  // Safely parse a date string from the URL; return undefined for empty or invalid values.
  const parseUrlDate = (value: string | null): Date | undefined => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : undefined;
  };

  // On first load, pre-fill the form from the URL (so a shared/refreshed
  // search link keeps its values).
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const destination = urlParams.get('destination');
    const countryCode = urlParams.get('countryCode');
    const departureAirport = urlParams.get('departureAirport');
    const arrivalAirport = urlParams.get('arrivalAirport');
    const people = urlParams.get('people');
    const budget = urlParams.get('budget');
    const startDate = urlParams.get('startDate');
    const endDate = urlParams.get('endDate');
    const rooms = urlParams.get('rooms');

    if (destination || departureAirport || arrivalAirport || people || budget || startDate || endDate || rooms) {
      setSearchData({
        destination: destination || "",
        countryCode: countryCode || "",
        departureAirport: departureAirport || "",
        arrivalAirport: arrivalAirport || "",
        people: people || "",
        budget: budget || "",
        startDate: parseUrlDate(startDate),
        endDate: parseUrlDate(endDate),
        rooms: rooms || ""
      });

      // Restore travelers data if people/rooms are available
      if (people || rooms) {
        const totalPeople = parseInt(people || "1");
        const totalRooms = parseInt(rooms || "1");
        
        setTravelers({
          adults: Math.max(1, totalPeople), // Assume all are adults for simplicity
          children: 0,
          pets: 0,
          rooms: totalRooms
        });
      }
    }
  }, []);

  // Haversine formula — distance in km between two lat/lng points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Ask the browser for the user's location, then fetch nearby airports from
  // the API (falling back to a local distance calculation if that fails).
  const getCurrentLocation = async () => {
    console.log("getCurrentLocation called");
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
      return;
    }

    // Clear any existing nearby airports first
    setNearbyAirports([]);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Location received:", position.coords);
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            backendUrl(`/api/airports/nearby?lat=${latitude}&lng=${longitude}&limit=5`),
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch nearby airports');
          }
          
          const airports = await response.json();
          console.log("Nearby airports from API:", airports);
          
          const nearby = airports.map((airport: any) => 
            `${airport.code} - ${airport.name} (${airport.city}) - ${airport.distance}km`
          );
          
          setNearbyAirports(nearby);
          setFilteredDepartureAirports(nearby);
          alert(`Found ${nearby.length} nearby airports based on your location!`);
        } catch (error) {
          console.error("Error fetching nearby airports:", error);
          
          // Fallback to local airport data.
          const airportsWithDistance = airports.map((airport) => ({
            label: formatAirportLabel(airport),
            distance: calculateDistance(latitude, longitude, airport.lat, airport.lng)
          }));

          const nearby = airportsWithDistance
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5)
            .map(airport => airport.label);
          
          setNearbyAirports(nearby);
          setFilteredDepartureAirports(nearby);
          alert(`Found ${nearby.length} nearby airports (using fallback data)`);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        
        if (error.code === 1) {
          alert("Location access denied. Please click the location icon in your browser's address bar and select 'Allow' to enable location access.");
        } else {
          alert("Unable to get your location. Please try again or select airports manually.");
        }
        
        // Fallback to all loaded airports
        setFilteredDepartureAirports(airportLabels);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 600000
      }
    );
  };

  // When adults/children change, bump room count if guests exceed 4 per room
  const autoAdjustRooms = (adults: number, children: number, currentRooms: number) => {
    const totalGuests = adults + children;
    const maxGuestsPerRoom = 4;
    const minRoomsNeeded = Math.ceil(totalGuests / maxGuestsPerRoom);
    
    return Math.max(minRoomsNeeded, currentRooms);
  };

  // Increment/decrement a traveler count and keep people/rooms in sync.
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

  // Formats selected dates for the date trigger (or "Select dates").
  const getDateRangeText = () => {
    const hasStart = searchData.startDate && isValid(searchData.startDate);
    const hasEnd = searchData.endDate && isValid(searchData.endDate);
    if (hasStart && hasEnd) {
      return `${format(searchData.startDate!, "MMM dd, yyyy")} - ${format(searchData.endDate!, "MMM dd, yyyy")}`;
    } else if (hasStart) {
      return `${format(searchData.startDate!, "MMM dd, yyyy")} - End date`;
    }
    return "Select dates";
  };

  // Human-readable summary of travelers state for the guests field.
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

  // Sets dateError and returns false if dates are invalid; blocks form submit
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

  // Save check-in date and re-run date rules.
  const handleStartDateChange = (date: Date | undefined) => {
    setSearchData({ ...searchData, startDate: date });
    validateDates(date, searchData.endDate);
  };

  // Save check-out date and re-run date rules.
  const handleEndDateChange = (date: Date | undefined) => {
    setSearchData({ ...searchData, endDate: date });
    validateDates(searchData.startDate, date);
  };

  const validateRequiredFields = () => {
    const requiredFields = [
      { label: "destination", value: searchData.destination.trim(), elementId: "destination" },
      {
        label: "departure airport",
        value: searchData.departureAirport.trim(),
        elementId: "departureAirport",
      },
      {
        label: "arrival airport",
        value: searchData.arrivalAirport.trim(),
        elementId: "arrivalAirport",
      },
      {
        label: "check-in date",
        value: searchData.startDate && isValid(searchData.startDate),
        elementId: "dateRange",
      },
      {
        label: "check-out date",
        value: searchData.endDate && isValid(searchData.endDate),
        elementId: "dateRange",
      },
      {
        label: "guests",
        value: Number(searchData.people) >= 1,
        elementId: "travelers",
      },
      {
        label: "rooms",
        value: Number(searchData.rooms) >= 1,
        elementId: "travelers",
      },
      {
        label: "budget",
        value: searchData.budget.trim() && Number(searchData.budget) > 0,
        elementId: "budget",
      },
    ];

    const missingFields = requiredFields.filter((field) => !field.value);
    if (missingFields.length === 0) {
      setFormError("");
      return true;
    }

    setFormError(
      `Please complete all required fields: ${missingFields.map((field) => field.label).join(", ")}.`,
    );
    window.setTimeout(() => document.getElementById(missingFields[0].elementId)?.focus(), 0);
    return false;
  };

  // Validate required fields and dates, then start the search.
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRequiredFields()) {
      return;
    }

    if (!validateDates(searchData.startDate, searchData.endDate)) {
      return;
    }
    
    const startDate =
      searchData.startDate && isValid(searchData.startDate)
        ? format(searchData.startDate, "yyyy-MM-dd")
        : "";
    const endDate =
      searchData.endDate && isValid(searchData.endDate)
        ? format(searchData.endDate, "yyyy-MM-dd")
        : "";

    const formParams = {
      destination: searchData.destination.trim(),
      countryCode: searchData.countryCode,
      departureAirport: searchData.departureAirport.trim(),
      arrivalAirport: searchData.arrivalAirport.trim(),
      people: searchData.people,
      budget: searchData.budget.trim(),
      startDate,
      endDate,
      rooms: searchData.rooms,
    };

    startBackendSearch(queryClient, formParams);

    const params = new URLSearchParams({
      destination: formParams.destination,
      countryCode: formParams.countryCode,
      departureAirport: formParams.departureAirport,
      arrivalAirport: formParams.arrivalAirport,
      people: formParams.people,
      budget: formParams.budget,
      startDate: formParams.startDate,
      endDate: formParams.endDate,
      rooms: formParams.rooms,
    });

    const redirect = `/search?${params.toString()}`;
    if (user) {
      setLocation(redirect);
    } else {
      setLocation(`/signin?redirect=${encodeURIComponent(redirect)}`);
    }
    window.setTimeout(() => {
      window.dispatchEvent(new Event("getawayhub-search-updated"));
    }, 0);
    setShowDestinationSuggestions(false);
  };

  // Filter destination list as the user types.
  const handleDestinationChange = (value: string) => {
    arrivalRequestRef.current += 1;
    const matchingArrivalAirports = getArrivalAirportsForDestination(value);
    const shouldAutoFillArrival =
      hasExactAirportCityMatch(value) && matchingArrivalAirports.length === 1;

    setSearchData({
      ...searchData,
      destination: value,
      countryCode: "",
      arrivalAirport: shouldAutoFillArrival
        ? matchingArrivalAirports[0]
        : searchData.arrivalAirport,
    });

    setFilteredArrivalAirports(
      matchingArrivalAirports.length > 0 ? matchingArrivalAirports : airportLabels,
    );
    setShowDestinationSuggestions(true);
  };

  // Uses nearby list after geolocation, otherwise the loaded airport list.
  const handleDepartureAirportChange = (value: string) => {
    setSearchData({ ...searchData, departureAirport: value });
    const baseAirports = nearbyAirports.length > 0 ? nearbyAirports : airportLabels;
    const filtered = baseAirports.filter(airport =>
      airport.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDepartureAirports(filtered);
    setShowDepartureAirportSuggestions(true);
  };

  // Filter arrival airport suggestions as the user types.
  const handleArrivalAirportChange = (value: string) => {
    setSearchData({ ...searchData, arrivalAirport: value });
    const destinationAirports = getArrivalAirportsForDestination(searchData.destination);
    const baseAirports = destinationAirports.length > 0 ? destinationAirports : airportLabels;
    const filtered = baseAirports.filter(airport =>
      airport.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredArrivalAirports(filtered);
    setShowArrivalAirportSuggestions(true);
  };

  // User picked one airport from the departure suggestions.
  const selectDepartureAirport = (airport: string) => {
    setSearchData({ ...searchData, departureAirport: airport });
    setShowDepartureAirportSuggestions(false);
  };

  // Apply chosen arrival airport and close the list.
  const selectArrivalAirport = (airport: string) => {
    setSearchData({ ...searchData, arrivalAirport: airport });
    setShowArrivalAirportSuggestions(false);
  };

  // Manual suggestions and popular cards share this path so airport behavior stays identical.
  const applyDestinationSelection = async (
    destination: DestinationSuggestion,
    airportSearchCity = destination.city,
  ) => {
    const requestId = ++arrivalRequestRef.current;
    let countryCode = destination.countryCode;
    let country = destination.country;

    if (!countryCode && destination.placeId) {
      try {
        const details = await fetchGooglePlaceDetails(destination.placeId);
        countryCode = details.countryCode || "";
        country = details.country || country;
      } catch (error) {
        console.warn("Could not load Google place details:", error);
      }
    }

    setSearchData((current) => ({
      ...current,
      destination: destination.city,
      countryCode,
      arrivalAirport: "",
    }));
    setShowDestinationSuggestions(false);
    setArrivalAirportStatus("loading");
    setShowArrivalAirportSuggestions(true);

    let suggestedAirports: Airport[] = [];
    try {
      suggestedAirports = await fetchAirportSuggestions(
        [airportSearchCity, country].filter(Boolean).join(", "),
      );
    } catch (error) {
      console.warn("Live airport suggestions unavailable:", error);
    }

    if (requestId !== arrivalRequestRef.current) return;

    const liveAirportLabels = suggestedAirports.map(formatAirportLabel);
    const fallbackAirportLabels = getArrivalAirportsForDestination(airportSearchCity);
    const matchingArrivalAirports =
      liveAirportLabels.length > 0 ? liveAirportLabels : fallbackAirportLabels;

    if (suggestedAirports.length > 0) {
      setAirports((current) => {
        const merged = new Map(current.map((airport) => [airport.code, airport]));
        suggestedAirports.forEach((airport) => merged.set(airport.code, airport));
        return Array.from(merged.values());
      });
    }

    setFilteredArrivalAirports(
      matchingArrivalAirports.length > 0 ? matchingArrivalAirports : airportLabels,
    );
    setArrivalAirportStatus("idle");

    if (matchingArrivalAirports.length === 1) {
      setSearchData((current) => ({
        ...current,
        arrivalAirport: matchingArrivalAirports[0],
      }));
      setShowArrivalAirportSuggestions(false);
      window.setTimeout(() => document.getElementById("departureAirport")?.focus(), 0);
    } else {
      setShowArrivalAirportSuggestions(matchingArrivalAirports.length > 1);
      window.setTimeout(() => document.getElementById("arrivalAirport")?.focus(), 0);
    }
  };

  // Apply a popular destination as though the user selected it from Google autocomplete.
  useEffect(() => {
    if (!destinationPreset) return;

    void applyDestinationSelection(
      {
        city: destinationPreset.city,
        country: destinationPreset.country,
        countryCode: destinationPreset.countryCode,
        label: destinationPreset.city,
      },
      destinationPreset.airportSearchCity,
    );
  }, [destinationPreset?.selectionId]);

  // Apply a city chosen from the Google destination list.
  const selectDestination = async (destination: DestinationSuggestion) => {
    await applyDestinationSelection(destination);
  };

  const isHero = variant === "hero";

  return (
    <form
      onSubmit={handleSearch}
      noValidate
      className={`w-full ${isHero ? 'bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8' : 'bg-card rounded-xl shadow-md p-4'}`}
      data-testid="form-search"
    >
      <div className="mb-4">
        <div className="space-y-2 relative" ref={destinationRef}>
          <Label htmlFor="destination" className="text-sm font-semibold text-gray-700">
            Where are you going? <span className="text-red-600">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 z-10" />
            <Input
              id="destination"
              type="text"
              placeholder="Search destinations..."
              className="pl-10 h-10 text-sm border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
              value={searchData.destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onFocus={() => setShowDestinationSuggestions(true)}
              required
              data-testid="input-destination"
            />
          </div>
          {showDestinationSuggestions && searchData.destination.trim().length >= 2 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-popover-border rounded-lg shadow-lg max-h-60 overflow-auto">
              {destinationAutocompleteStatus === "loading" && (
                <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching cities...
                </div>
              )}

              {/* Each row: set destination from suggestion */}
              {filteredDestinations.map((dest) => (
                <button
                  key={dest.placeId || `${dest.city}-${dest.country}`}
                  type="button"
                  onClick={() => void selectDestination(dest)}
                  className="w-full text-left px-4 py-2.5 hover-elevate text-sm text-foreground"
                  data-testid={`suggestion-destination-${dest.city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground mt-1" />
                    <span>
                      <span className="block font-medium">{dest.label}</span>
                      {dest.description && dest.description !== dest.label && (
                        <span className="block text-xs text-muted-foreground">
                          {dest.description}
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              ))}

              {searchData.destination.trim().length >= 2
                && destinationAutocompleteStatus !== "loading"
                && filteredDestinations.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No cities found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2 relative" ref={departureAirportRef}>
          <Label htmlFor="departureAirport" className="text-sm font-semibold text-gray-700">
            Departure Airport <span className="text-red-600">*</span>
          </Label>
          <div className="relative">
            <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 z-10" />
            <Input
              id="departureAirport"
              type="text"
              placeholder="Select departure airport..."
              className="pl-10 h-10 text-sm border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
              value={searchData.departureAirport}
              onChange={(e) => handleDepartureAirportChange(e.target.value)}
              onFocus={() => setShowDepartureAirportSuggestions(true)}
              required
            />
          </div>
          {showDepartureAirportSuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
              {/* Use GPS to load nearby departure airports */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  getCurrentLocation();
                }}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm text-blue-600 border-b border-gray-100 font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Use Current Location for Nearby Airports
                </div>
              </button>
              
              {nearbyAirports.length > 0 && (
                <div className="px-4 py-2 text-xs text-gray-500 border-b bg-gray-50">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Nearby airports based on your location
                  </div>
                </div>
              )}
              {/* Each row: set departure airport */}
              {filteredDepartureAirports.map((airport) => (
                <button
                  key={airport}
                  type="button"
                  onClick={() => selectDepartureAirport(airport)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
                    {airport}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 relative" ref={arrivalAirportRef}>
          <Label htmlFor="arrivalAirport" className="text-sm font-semibold text-gray-700">
            Arrival Airport <span className="text-red-600">*</span>
          </Label>
          <div className="relative">
            <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 z-10" />
            <Input
              id="arrivalAirport"
              type="text"
              placeholder="Select arrival airport..."
              className="pl-10 h-10 text-sm border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
              value={searchData.arrivalAirport}
              onChange={(e) => handleArrivalAirportChange(e.target.value)}
              onFocus={() => setShowArrivalAirportSuggestions(true)}
              required
            />
          </div>
          {showArrivalAirportSuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-popover-border rounded-lg shadow-lg max-h-60 overflow-auto">
              {arrivalAirportStatus === "loading" && (
                <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finding nearby airports...
                </div>
              )}

              {/* Each row: set arrival airport */}
              {arrivalAirportStatus !== "loading" && filteredArrivalAirports.map((airport) => (
                <button
                  key={airport}
                  type="button"
                  onClick={() => selectArrivalAirport(airport)}
                  className="w-full text-left px-4 py-2.5 hover-elevate text-sm text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <PlaneLanding className="h-4 w-4 text-muted-foreground" />
                    {airport}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`grid gap-4 ${isHero ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        <div className="space-y-3 relative" ref={dateRef}>
          <Label htmlFor="dateRange" className="text-sm font-semibold text-gray-700">
            Dates <span className="text-red-600">*</span>
          </Label>
          {/* Open or close check-in / check-out calendars */}
          <Button
            id="dateRange"
            type="button"
            variant="outline"
            className={`w-full justify-start text-left font-normal pl-12 h-12 text-base border-2 hover:border-blue-300 transition-colors ${
              !searchData.startDate && !searchData.endDate && "text-gray-500"
            } ${dateError ? 'border-red-500' : ''}`}
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            aria-required="true"
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

        <div className="space-y-3 relative" ref={travelersRef}>
          <Label htmlFor="travelers" className="text-sm font-semibold text-gray-700">
            Guests & Rooms <span className="text-red-600">*</span>
          </Label>
          {/* Open or close guests & rooms panel */}
          <Button
            id="travelers"
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal pl-12 h-12 text-base border-2 hover:border-blue-300 transition-colors"
            onClick={() => setShowTravelersDropdown(!showTravelersDropdown)}
            aria-required="true"
          >
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            {getTravelersText()}
          </Button>
          
          {showTravelersDropdown && (
            <div className="absolute z-50 w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Adults</div>
                  <div className="text-sm text-gray-500 mt-1">Ages 13+</div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Fewer adults */}
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
                  {/* More adults */}
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
              
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Children</div>
                  <div className="text-sm text-gray-500 mt-1">Ages 2-12</div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Fewer children */}
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
                  {/* More children */}
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
              
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Rooms</div>
                  <div className="text-sm text-gray-500 mt-1">Hotel rooms needed</div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Fewer rooms */}
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
                  {/* More rooms */}
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
              
              <div className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Pets</div>
                  <div className="text-sm text-gray-500 mt-1">Service animals</div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Fewer pets */}
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
                  {/* More pets */}
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

        <div className="space-y-3">
          <Label htmlFor="budget" className="text-sm font-semibold text-gray-700">
            Budget (USD) <span className="text-red-600">*</span>
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            <Input
              id="budget"
              type="number"
              min="1"
              step="100"
              placeholder="Total budget"
              className="pl-12 h-12 text-base border-2 hover:border-blue-300 focus:border-blue-500 transition-colors"
              value={searchData.budget}
              onChange={(e) => setSearchData({ ...searchData, budget: e.target.value })}
              required
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

      {formError && (
        <div
          className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
          role="alert"
        >
          {formError}
        </div>
      )}

      {/* Run search: validate dates, then go to /search with query params */}
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
