import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Plus, 
  Minus, 
  Compass, 
  Zap, 
  Bike, 
  Car, 
  ShieldCheck,
  Footprints,
  Clock
} from "lucide-react";
import { VehicleType } from "./DestinationSearchBar";

export interface MapParkingLot {
  id: number;
  name: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number | string;
  twoWheelerPricePerHour?: number | string;
  twoWheelerAvailableSlots?: number;
  twoWheelerTotalSlots?: number;
  parkingType?: string;
  securityRating?: number | string;
  isCovered?: boolean;
  walkingDistanceMeters?: number;
  walkingTimeMinutes?: number;
  drivingTimeMinutes?: number;
}

interface InteractiveMapCanvasProps {
  parkingLots: MapParkingLot[];
  selectedLot: MapParkingLot | null;
  onSelectLot: (lot: MapParkingLot) => void;
  destination: string;
  currentLocation: string;
  vehicleType: VehicleType;
  selectedVehicle?: VehicleType;
  onOpenDoorToSlotNav?: () => void;
  onOpenLastMileAssistant?: () => void;
  heightClass?: string;
}

export function InteractiveMapCanvas({
  parkingLots,
  selectedLot,
  onSelectLot,
  destination,
  currentLocation,
  vehicleType,
  heightClass = "h-[450px] lg:h-[600px]",
}: InteractiveMapCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState(14);
  const [mapStyle, setMapStyle] = useState<"standard" | "satellite" | "dark">("standard");

  const isTwoWheeler = vehicleType === "motorcycle" || vehicleType === "scooter";

  // Coordinates matrix for simulation rendering
  const mapCenter = { lat: 28.4595, lng: 77.0266 }; // Urban Center
  const destinationCoords = { lat: 28.4625, lng: 77.0310 }; // Target Destination

  return (
    <div
      role="region"
      aria-label="Interactive parking map canvas"
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group`}
    >
      {/* Background Interactive Vector Canvas Simulation */}
      <div className={`absolute inset-0 w-full h-full ${mapStyle === "dark" ? "bg-slate-950" : mapStyle === "satellite" ? "bg-slate-900" : "map-grid-bg"} transition-colors duration-500`}>
        {/* Simulated Map Road Networks */}
        <svg className="w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Arterial Avenues */}
          <path d="M 0 120 Q 300 180 800 140" fill="none" stroke={mapStyle === "dark" ? "#1e293b" : "#cbd5e1"} strokeWidth="16" />
          <path d="M 220 0 Q 250 400 280 800" fill="none" stroke={mapStyle === "dark" ? "#1e293b" : "#cbd5e1"} strokeWidth="14" />
          <path d="M 0 380 Q 400 320 900 420" fill="none" stroke={mapStyle === "dark" ? "#1e293b" : "#cbd5e1"} strokeWidth="12" />
          
          {/* Driving Route Polyline from Current Location to Selected Lot */}
          {selectedLot && (
            <path
              d="M 120 380 L 250 350 L 420 220 L 520 240"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="6"
              strokeDasharray="8 4"
              className="animate-pulse"
            />
          )}

          {/* Walking Route Polyline from Selected Lot to Destination */}
          {selectedLot && (
            <path
              d="M 520 240 L 640 180 L 680 150"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* Live User Position Pulse Pin */}
        <div className="absolute left-[15%] top-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/pin z-20">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping" />
            <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-white">
              <Navigation className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <Badge variant="secondary" className="mt-1 text-[10px] bg-white/90 dark:bg-slate-900/90 shadow-md font-semibold text-slate-700 dark:text-slate-200">
            You ({currentLocation.split('(')[0].trim() || "Start"})
          </Badge>
        </div>

        {/* Target Destination Flag Pin */}
        <div className="absolute left-[70%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
          <div className="bg-gradient-to-tr from-red-600 to-rose-500 text-white p-2 rounded-full shadow-lg ring-4 ring-red-500/20 animate-bounce">
            <MapPin className="w-5 h-5 fill-current" />
          </div>
          <Badge className="mt-1 bg-red-600 text-white font-bold text-xs shadow-lg">
            🎯 Destination: {destination || "Selected Place"}
          </Badge>
        </div>

        {/* Dynamic Parking Lot Pin Markers */}
        {parkingLots.map((lot, idx) => {
          const isSelected = selectedLot?.id === lot.id;

          // Compute slot availability & pricing based on vehicle
          const avail = isTwoWheeler
            ? lot.twoWheelerAvailableSlots ?? Math.round(lot.availableSlots * 0.6)
            : lot.availableSlots;
          const total = isTwoWheeler
            ? lot.twoWheelerTotalSlots ?? Math.round(lot.totalSlots * 0.4)
            : lot.totalSlots;
          const price = isTwoWheeler
            ? lot.twoWheelerPricePerHour ?? 20
            : lot.pricePerHour;

          const fillRatio = total > 0 ? (total - avail) / total : 0;
          const isFull = avail === 0;

          // Grid coordinates distribution for pins
          const pinPositions = [
            { left: '35%', top: '40%' },
            { left: '55%', top: '35%' },
            { left: '48%', top: '60%' },
            { left: '75%', top: '55%' },
            { left: '25%', top: '25%' },
          ];
          const pos = pinPositions[idx % pinPositions.length];

          return (
            <div
              key={lot.id}
              role="button"
              tabIndex={0}
              aria-label={`Select parking facility ${lot.name}, ${avail} slots available, price ₹${price} per hour`}
              onClick={() => onSelectLot(lot)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectLot(lot);
                }
              }}
              style={{ left: pos.left, top: pos.top }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-30 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full ${
                isSelected ? "scale-110 z-40" : "hover:scale-105"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-xl border-2 transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white border-white ring-4 ring-blue-500/30 scale-105"
                    : isFull
                    ? "bg-red-500 text-white border-red-700 opacity-80"
                    : fillRatio > 0.7
                    ? "bg-amber-500 text-white border-amber-600"
                    : "bg-emerald-600 text-white border-emerald-400"
                }`}
              >
                {isTwoWheeler ? <Bike className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                <span>₹{price}/hr</span>
                <span className="opacity-80 text-[10px]">({avail} slots)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Header Overlay Info Pills */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
        {/* Live Traffic Pill */}
        <div className="pointer-events-auto flex items-center gap-2 glass-card px-3.5 py-1.5 rounded-full shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Traffic: Moderate (Clear Routes)</span>
        </div>

        {/* Active Vehicle Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full shadow-md text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          {isTwoWheeler ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
          <span className="capitalize">{vehicleType.replace('_', ' ')} Mode</span>
        </div>
      </div>

      {/* Selected Lot Bottom Quick Summary Card */}
      {selectedLot && (
        <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md glass-card rounded-xl p-4 shadow-2xl border border-blue-500/30 z-30 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Selected Parking Spot
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {selectedLot.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedLot.address}</p>
            </div>
            <Badge className="bg-blue-600 text-white font-bold">
              ₹{isTwoWheeler ? selectedLot.twoWheelerPricePerHour ?? 20 : selectedLot.pricePerHour}/hr
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/60 dark:border-slate-800 my-2 text-center text-xs">
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-[10px]">Drive Time</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-500" />
                {selectedLot.drivingTimeMinutes || 6} min
              </span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-[10px]">Walk to Dest</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Footprints className="w-3 h-3" />
                {selectedLot.walkingTimeMinutes || 3} min ({selectedLot.walkingDistanceMeters || 220}m)
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-[10px]">Security</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {selectedLot.securityRating || "4.8"}/5
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Right Controls (Zoom + Layers + Re-center) */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-30">
        <div className="glass-card rounded-xl shadow-lg p-1 flex flex-col gap-1 border border-slate-200 dark:border-slate-800">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
            className="w-8 h-8 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Zoom In"
            aria-label="Zoom in map"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 10))}
            className="w-8 h-8 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Zoom Out"
            aria-label="Zoom out map"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>

        <Button
          size="icon"
          variant="secondary"
          onClick={() => setMapStyle((s) => (s === "standard" ? "dark" : s === "dark" ? "satellite" : "standard"))}
          className="w-9 h-9 rounded-xl shadow-lg glass-card border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
          title="Toggle Map Style"
          aria-label="Toggle map view style"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
