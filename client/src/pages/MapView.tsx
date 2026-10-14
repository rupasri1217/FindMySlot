import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Star, 
  LayoutDashboard,
  Bookmark,
  Zap,
  ShieldCheck,
  Filter,
  LogOut,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthModal } from "@/components/auth/AuthModal";
import { DestinationSearchBar, VehicleType } from "@/components/v2/DestinationSearchBar";
import { InteractiveMapCanvas, MapParkingLot } from "@/components/v2/InteractiveMapCanvas";
import { SmartRecommendationCards } from "@/components/v2/SmartRecommendationCards";
import { ParkingComparisonModal } from "@/components/v2/ParkingComparisonModal";
import { LastMileAssistantModal } from "@/components/v2/LastMileAssistantModal";
import { LiveNavigationModal } from "@/components/v2/LiveNavigationModal";
import { CityName } from "@/data/mockParkingData";
import { getUserSelectedCity, setUserSelectedCity, getUserSavedPlaces, saveUserParkingLot } from "@/services/storageService";
import { getParkingLotsByCityAndCategory } from "@/services/parkingService";
import { toast } from "sonner";

export default function MapView() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  // URL query params parse
  const searchParams = new URLSearchParams(window.location.search);
  const urlCity = searchParams.get("city") as CityName | null;
  const initialDest = searchParams.get("dest") || "";
  const initialType = (searchParams.get("type") as any) || "car";

  // Resolve user preferred city
  const userCity = getUserSelectedCity(user?.email);
  const defaultCity: CityName = urlCity || userCity || "Hyderabad";

  const [selectedCity, setSelectedCity] = useState<CityName>(defaultCity);
  const [destination, setDestination] = useState<string>(initialDest);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>(initialType);

  // Filter States
  const [filterEvOnly, setFilterEvOnly] = useState(false);
  const [filterCoveredOnly, setFilterCoveredOnly] = useState(false);
  const [filterMinRating, setFilterMinRating] = useState<number>(0);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(100);

  // Selection & Modal States
  const [selectedLot, setSelectedLot] = useState<MapParkingLot | null>(null);
  const [compareLotsModalOpen, setCompareLotsModalOpen] = useState(false);
  const [lastMileModalOpen, setLastMileModalOpen] = useState(false);
  const [liveNavModalOpen, setLiveNavModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Save Parking Lot Custom Name Modal State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [lotToSave, setLotToSave] = useState<MapParkingLot | null>(null);
  const [customSavedName, setCustomSavedName] = useState("");

  // User-isolated saved places
  const [savedPlaces, setSavedPlaces] = useState(() => getUserSavedPlaces(user?.email));

  // Sync city selection to user profile
  const handleCityChange = (newCity: string) => {
    const validCity = newCity as CityName;
    setSelectedCity(validCity);
    if (user?.email) {
      setUserSelectedCity(user.email, validCity);
    }
  };

  // Multi-Destination Haversine Search via parkingService
  const cityFilteredLots = useMemo(() => {
    const lotsFromService = getParkingLotsByCityAndCategory(selectedCity, destination);
    return lotsFromService
      .filter((lot) => (filterEvOnly ? lot.evSlots > 0 : true))
      .filter((lot) => (filterCoveredOnly ? lot.isCovered : true))
      .filter((lot) => lot.securityRating >= filterMinRating)
      .filter((lot) => lot.pricePerHour <= maxPriceFilter)
      .map((lot, idx) => ({
        id: idx + 1,
        rawId: lot.id,
        name: lot.name,
        address: lot.address,
        latitude: lot.latitude,
        longitude: lot.longitude,
        totalSlots: lot.totalSlots,
        availableSlots: lot.availableSlots,
        pricePerHour: lot.pricePerHour,
        twoWheelerPricePerHour: lot.twoWheelerPricePerHour,
        twoWheelerAvailableSlots: Math.floor(lot.availableSlots * 0.4),
        twoWheelerTotalSlots: lot.bikeSlots,
        parkingType: lot.isCovered ? "Covered Multi-Level Deck" : "Surface Lot",
        securityRating: lot.securityRating,
        isCovered: lot.isCovered,
        walkingDistanceMeters: lot.walkingDistanceMeters,
        walkingTimeMinutes: lot.walkingTimeMinutes,
        drivingTimeMinutes: 3 + idx,
        distanceKm: (lot as any).distanceKm,
      }));
  }, [selectedCity, destination, filterEvOnly, filterCoveredOnly, filterMinRating, maxPriceFilter]);

  // Handle Reserve Slot CTA
  const handleReserveSlot = (lot: MapParkingLot) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to complete your slot reservation");
      setAuthModalOpen(true);
      return;
    }

    const targetId = (lot as any).rawId || lot.id;
    navigate(`/booking/${targetId}?vehicle=${selectedVehicle}&city=${encodeURIComponent(selectedCity)}&dest=${encodeURIComponent(destination)}`);
  };

  // Open Save Modal Dialog
  const handleOpenSaveModal = (lot: MapParkingLot) => {
    if (!isAuthenticated || !user?.email) {
      toast.info("Please sign in to save parking lots");
      setAuthModalOpen(true);
      return;
    }
    setLotToSave(lot);
    setCustomSavedName(lot.name);
    setSaveModalOpen(true);
  };

  // Confirm Save with Custom Display Name
  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !lotToSave) return;
    const targetLotId = String((lotToSave as any).rawId || lotToSave.id);
    const updated = saveUserParkingLot(user.email, targetLotId, customSavedName);
    setSavedPlaces(updated);
    toast.success(`Saved "${customSavedName || lotToSave.name}" to your saved places!`);
    setSaveModalOpen(false);
  };

  const isLotSaved = (lotId: string) => {
    return savedPlaces.some(p => p.parkingLotId === lotId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRole="user"
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FindMySlot
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] py-0 px-2 border-blue-500/40 text-blue-600 font-semibold">
                V2 Mobility
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate(user?.role === "admin" ? "/admin" : "/dashboard")}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{user?.role === "admin" ? "Admin Dashboard" : "Dashboard"}</span>
                </Button>

                <Button
                  onClick={() => navigate("/saved-places")}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex rounded-xl items-center gap-1.5 font-semibold text-xs border-slate-200 dark:border-slate-800"
                >
                  <Bookmark className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Saved ({savedPlaces.length})</span>
                </Button>

                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-xs text-slate-500 hover:text-red-500"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Sign Up
                </Button>
              </div>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        
        {/* Controlled Destination-First Search Bar */}
        <DestinationSearchBar
          destination={destination}
          setDestination={setDestination}
          currentLocation={`${selectedCity} Central Area`}
          setCurrentLocation={() => {}}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
          onSearch={() => toast.success(`Searching destination-aware parking near "${destination || 'all locations'}" in ${selectedCity}`)}
          selectedCity={selectedCity}
          setSelectedCity={handleCityChange}
        />

        {/* Filters Toolbar */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={filterEvOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterEvOnly(!filterEvOnly)}
              className={`rounded-xl text-xs font-semibold gap-1.5 ${filterEvOnly ? "bg-emerald-600 text-white" : ""}`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>EV Charger Required</span>
            </Button>

            <Button
              variant={filterCoveredOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCoveredOnly(!filterCoveredOnly)}
              className={`rounded-xl text-xs font-semibold gap-1.5 ${filterCoveredOnly ? "bg-blue-600 text-white" : ""}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Covered Parking Only</span>
            </Button>

            <Button
              variant={filterMinRating === 4.7 ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMinRating(filterMinRating === 4.7 ? 0 : 4.7)}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Top Rated (4.7+)</span>
            </Button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Max Price:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">₹{maxPriceFilter}/hr</span>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="w-20 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Showing <span className="text-blue-600 dark:text-blue-400 font-bold">{cityFilteredLots.length}</span> active parking facilities in {selectedCity}
          </div>
        </div>

        {/* Map & Smart Recommendation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Interactive Map Canvas */}
          <div className="lg:col-span-7 space-y-4">
            <InteractiveMapCanvas
              parkingLots={cityFilteredLots}
              selectedLot={selectedLot}
              onSelectLot={(lot) => setSelectedLot(lot)}
              destination={destination || `${selectedCity} Destination`}
              currentLocation={`${selectedCity} Center`}
              vehicleType={selectedVehicle}
              selectedVehicle={selectedVehicle}
              onOpenDoorToSlotNav={() => setLiveNavModalOpen(true)}
              onOpenLastMileAssistant={() => setLastMileModalOpen(true)}
            />
          </div>

          {/* Right: AI Smart Recommendation Cards */}
          <div className="lg:col-span-5 space-y-4">
            <SmartRecommendationCards
              parkingLots={cityFilteredLots}
              selectedLot={selectedLot}
              onSelectLot={(lot) => setSelectedLot(lot)}
              onBookLot={handleReserveSlot}
              onSaveLot={handleOpenSaveModal}
              isSaved={isLotSaved}
              onCompareLots={() => setCompareLotsModalOpen(true)}
              destinationName={destination}
              vehicleType={selectedVehicle}
            />
          </div>
        </div>
      </main>

      {/* Save Parking Lot Dialog Modal */}
      <Dialog open={saveModalOpen} onOpenChange={setSaveModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              <span>Save Parking Lot</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Save this facility to your personal saved places. You can assign a custom label for quick access.
            </DialogDescription>
          </DialogHeader>

          {lotToSave && (
            <form onSubmit={handleConfirmSave} className="space-y-4 mt-2">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-semibold">Original Facility Name:</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{lotToSave.name}</div>
                <div className="text-xs text-slate-500">{lotToSave.address}, {selectedCity}</div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom Display Name (Personal Label)
                </Label>
                <Input
                  value={customSavedName}
                  onChange={(e) => setCustomSavedName(e.target.value)}
                  placeholder="e.g. My Hospital Parking, Office Deck..."
                  className="rounded-xl mt-1 font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This custom label belongs strictly to your account and does not alter the original parking lot name.
                </p>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-lg">
                Save Place
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Modal */}
      <ParkingComparisonModal
        open={compareLotsModalOpen}
        onOpenChange={setCompareLotsModalOpen}
        lots={cityFilteredLots.slice(0, 3)}
        onSelectLot={(lot) => {
          setSelectedLot(lot);
          setCompareLotsModalOpen(false);
          handleReserveSlot(lot);
        }}
        vehicleType={selectedVehicle}
      />

      {/* Last Mile Assistant Modal */}
      <LastMileAssistantModal
        open={lastMileModalOpen}
        onOpenChange={setLastMileModalOpen}
        parkingLotName={selectedLot?.name || cityFilteredLots[0]?.name || "Parking Deck"}
        destinationName={destination || "Destination Hub"}
        distanceMeters={selectedLot?.walkingDistanceMeters || 250}
        walkingTimeMinutes={selectedLot?.walkingTimeMinutes || 3}
      />

      {/* Live Turn Guidance Modal */}
      <LiveNavigationModal
        open={liveNavModalOpen}
        onOpenChange={setLiveNavModalOpen}
        lotName={selectedLot?.name || cityFilteredLots[0]?.name || "Parking Deck"}
        slotNumber="Slot A-14"
        floor="P1 Level"
      />
    </div>
  );
}
