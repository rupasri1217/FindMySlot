import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Navigation, 
  Bike, 
  Car, 
  Zap, 
  Sparkles,
  Building2,
  ShoppingBag,
  Train,
  Stethoscope,
  Plane,
  Briefcase,
  Layers,
  AlertCircle
} from "lucide-react";
import { PREDEFINED_DESTINATIONS, CityName } from "@/data/mockParkingData";

export type VehicleType = "motorcycle" | "scooter" | "car" | "ev_car" | "ev";

interface DestinationSearchBarProps {
  destination: string;
  setDestination: (val: string) => void;
  currentLocation: string;
  setCurrentLocation: (val: string) => void;
  selectedVehicle: VehicleType;
  setSelectedVehicle: (val: VehicleType) => void;
  onSearch?: () => void;
  selectedCity?: string;
  setSelectedCity?: (city: string) => void;
}

export function DestinationSearchBar({
  destination,
  setDestination,
  currentLocation,
  setCurrentLocation,
  selectedVehicle,
  setSelectedVehicle,
  onSearch,
  selectedCity = "Hyderabad",
  setSelectedCity,
}: DestinationSearchBarProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDetectGPS = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setCurrentLocation(`Current Location (${selectedCity} Center)`);
      setIsDetecting(false);
    }, 600);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter city-restricted destinations & categories
  const cityDestinations = useMemo(() => {
    return PREDEFINED_DESTINATIONS.filter(
      (d) => d.city.toLowerCase() === selectedCity.toLowerCase()
    );
  }, [selectedCity]);

  // Categories available in selected city
  const cityCategories = useMemo(() => {
    const categoriesMap = new Map<string, string>();
    cityDestinations.forEach((d) => {
      if (!categoriesMap.has(d.category)) {
        categoriesMap.set(d.category, d.categoryLabel);
      }
    });
    return Array.from(categoriesMap.entries()).map(([cat, label]) => ({
      category: cat,
      categoryLabel: label,
    }));
  }, [cityDestinations]);

  // Matching suggestions based on user input
  const suggestions = useMemo(() => {
    const query = destination.trim().toLowerCase();

    const categoryMatches = cityCategories.filter(
      (c) =>
        !query ||
        c.category.toLowerCase().includes(query) ||
        c.categoryLabel.toLowerCase().includes(query)
    );

    const placeMatches = cityDestinations.filter(
      (d) =>
        !query ||
        d.name.toLowerCase().includes(query) ||
        d.area.toLowerCase().includes(query)
    );

    return {
      categories: categoryMatches,
      places: placeMatches,
    };
  }, [destination, cityDestinations, cityCategories]);

  const hasNoMatches =
    destination.trim() !== "" &&
    suggestions.categories.length === 0 &&
    suggestions.places.length === 0;

  const handleSelectSuggestion = (val: string) => {
    setDestination(val);
    setIsDropdownOpen(false);
    if (onSearch) onSearch();
  };

  const vehicleOptions = [
    { id: "motorcycle", label: "Motorcycle", icon: Bike, badge: "₹20/hr avg" },
    { id: "scooter", label: "Scooter", icon: Bike, badge: "₹15/hr avg" },
    { id: "car", label: "Car", icon: Car, badge: "₹50/hr avg" },
    { id: "ev_car", label: "EV Car", icon: Zap, badge: "⚡ Fast Charge" },
  ] as const;

  const cities: CityName[] = ["Hyderabad", "Bengaluru", "Chennai", "Mumbai", "Delhi"];

  return (
    <div className="w-full glass-card rounded-2xl p-4 md:p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Where are you going?
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              Enter your destination for AI-optimized parking & last-mile navigation
            </p>
          </div>
        </div>

        {/* City Selector */}
        {setSelectedCity && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Building2 className="w-4 h-4 text-blue-600" />
            <label htmlFor="search-city-select" className="text-xs text-slate-500 font-medium">City:</label>
            <select
              id="search-city-select"
              aria-label="Select city"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setDestination("");
              }}
              className="text-xs font-bold bg-transparent text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        {/* Controlled Destination Input with Autocomplete Dropdown */}
        <div className="md:col-span-6 relative" ref={dropdownRef}>
          <div className="absolute left-3.5 top-3.5 text-blue-600 dark:text-blue-400 z-10">
            <MapPin className="w-5 h-5" />
          </div>
          <Input
            id="destination-search-input"
            aria-label={`Search destination in ${selectedCity}`}
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={`Search destination in ${selectedCity} (e.g. Hospital, Mall, Airport)...`}
            className="pl-11 pr-4 py-6 text-base font-medium rounded-xl border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-900/70"
          />

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto p-2 space-y-3">
              {hasNoMatches ? (
                <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>No destinations found in {selectedCity} matching "{destination}"</span>
                </div>
              ) : (
                <>
                  {/* Category Suggestions */}
                  {suggestions.categories.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                        Categories ({selectedCity})
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {suggestions.categories.map((cat) => (
                          <button
                            key={cat.category}
                            type="button"
                            onClick={() => handleSelectSuggestion(cat.categoryLabel.split(" / ")[0])}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{cat.categoryLabel}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specific Place Suggestions */}
                  {suggestions.places.length > 0 && (
                    <div className="space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                        Specific Destinations ({selectedCity})
                      </span>
                      <div className="space-y-1">
                        {suggestions.places.map((place) => (
                          <button
                            key={place.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(place.name)}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 transition-colors flex items-center justify-between group"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">{place.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                              {place.area}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Origin / GPS Detector Input */}
        <div className="md:col-span-4 relative">
          <div className="absolute left-3.5 top-3.5 text-emerald-600 dark:text-emerald-400">
            <Navigation className="w-5 h-5" />
          </div>
          <Input
            id="current-location-input"
            aria-label="Your origin location"
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            placeholder="Your Location..."
            className="pl-11 pr-10 py-6 text-sm font-medium rounded-xl border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-900/70"
          />
          <button
            onClick={handleDetectGPS}
            title="Auto-detect current location via GPS"
            aria-label="Auto-detect current location via GPS"
            className="absolute right-3 top-3 text-slate-400 hover:text-blue-600 transition-colors p-1"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>

        {/* CTA Search Button */}
        <div className="md:col-span-2">
          <Button
            onClick={() => {
              setIsDropdownOpen(false);
              if (onSearch) onSearch();
            }}
            aria-label="Find available parking slots"
            className="w-full h-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Find Slots</span>
          </Button>
        </div>
      </div>

      {/* Vehicle Category Selector Pills */}
      <div className="space-y-2">
        <span id="vehicle-type-label" className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
          Select Vehicle Category:
        </span>
        <div role="group" aria-labelledby="vehicle-type-label" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {vehicleOptions.map((v) => {
            const Icon = v.icon;
            const isSelected = selectedVehicle === v.id;
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Select vehicle ${v.label}, average rate ${v.badge}`}
                onClick={() => setSelectedVehicle(v.id as VehicleType)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{v.label}</span>
                </div>
                <Badge
                  variant={isSelected ? "secondary" : "outline"}
                  className={`text-[10px] px-1.5 py-0 font-medium ${
                    isSelected ? "bg-white/20 text-white border-white/30" : "border-slate-300 dark:border-slate-700 text-slate-500"
                  }`}
                >
                  {v.badge}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* City-Restricted Destination Quick Chips */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium shrink-0">Popular in {selectedCity}:</span>
        {cityDestinations.slice(0, 5).map((dest) => (
          <button
            key={dest.id}
            onClick={() => handleSelectSuggestion(dest.name)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-all font-medium flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            <span>{dest.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
