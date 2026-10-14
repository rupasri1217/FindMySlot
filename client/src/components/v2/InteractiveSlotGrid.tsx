import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bike, 
  Car, 
  Zap, 
  Accessibility, 
  Check, 
  Layers, 
  Grid3X3,
  ShieldCheck
} from "lucide-react";
import { VehicleType } from "./DestinationSearchBar";

export interface SlotGridItem {
  id: number;
  slotNumber: string;
  status: "available" | "occupied" | "reserved" | "maintenance";
  type: "standard" | "compact" | "handicap" | "ev_charging" | "two_wheeler";
  vehicleCategory: "two_wheeler" | "four_wheeler";
  floor: string;
  zone: string;
}

interface InteractiveSlotGridProps {
  slots: SlotGridItem[];
  selectedSlotId: number | null;
  onSelectSlot: (slot: SlotGridItem) => void;
  vehicleType: VehicleType;
  lotName?: string;
  occupiedSlotNumbers?: Set<string>;
}

export function InteractiveSlotGrid({
  slots,
  selectedSlotId,
  onSelectSlot,
  vehicleType,
  lotName = "Parking Facility",
  occupiedSlotNumbers,
}: InteractiveSlotGridProps) {
  const isTwoWheeler = vehicleType === "motorcycle" || vehicleType === "scooter";

  const [activeFloor, setActiveFloor] = useState<string>("Floor 1");
  const [activeZone, setActiveZone] = useState<string>("Zone A");

  // Fallback demo slot layout generator if backend slots are sparse
  const displaySlots = useMemo(() => {
    if (slots && slots.length > 0) return slots;

    // Generate 32 interactive realistic slots across Floor 1 & 2
    const generated: SlotGridItem[] = [];
    const floors = ["Floor 1", "Floor 2"];
    const zones = ["Zone A", "Zone B"];

    let count = 1;
    floors.forEach((f) => {
      zones.forEach((z) => {
        for (let i = 1; i <= 8; i++) {
          const isTwoW = (i <= 4 && isTwoWheeler) || i === 7;
          const isEV = i === 5;
          const isDis = i === 6;
          const isOccupied = i % 3 === 0;

          const sNum = `${f.charAt(6)}${z.charAt(5)}-${i < 10 ? '0' + i : i}`;
          const isSlotOccupied = isOccupied || (occupiedSlotNumbers ? occupiedSlotNumbers.has(sNum) : false);

          generated.push({
            id: count,
            slotNumber: sNum,
            status: isSlotOccupied ? "occupied" : "available",
            type: isEV ? "ev_charging" : isDis ? "handicap" : isTwoW ? "two_wheeler" : "standard",
            vehicleCategory: isTwoW ? "two_wheeler" : "four_wheeler",
            floor: f,
            zone: z,
          });
          count++;
        }
      });
    });

    return generated;
  }, [slots, isTwoWheeler]);

  const filteredSlots = useMemo(() => {
    return displaySlots.filter(
      (s) => s.floor === activeFloor && s.zone === activeZone
    );
  }, [displaySlots, activeFloor, activeZone]);

  const getSlotColorClass = (slot: SlotGridItem) => {
    const isSelected = selectedSlotId === slot.id;
    if (isSelected) {
      return "bg-blue-600 text-white ring-4 ring-blue-500/40 border-blue-700 shadow-xl scale-105";
    }
    if (slot.status === "occupied") {
      return "bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60";
    }
    if (slot.status === "reserved") {
      return "bg-amber-100 dark:bg-amber-950 text-amber-700 border-amber-300 dark:border-amber-800 cursor-not-allowed";
    }
    if (slot.type === "ev_charging") {
      return "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600 shadow-md";
    }
    if (slot.type === "two_wheeler" || isTwoWheeler) {
      return "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700 shadow-md";
    }
    return "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700 shadow-md";
  };

  return (
    <div className="w-full glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      {/* Title & Floor/Zone Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-blue-600" />
            <span>Interactive Parking Blueprint Grid</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select exact parking slot for <span className="font-semibold text-slate-700 dark:text-slate-200">{lotName}</span>
          </p>
        </div>

        {/* Floor Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {["Floor 1", "Floor 2"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFloor === f
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Zone Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs text-slate-400 font-medium">Zones:</span>
        {["Zone A", "Zone B"].map((z) => (
          <button
            key={z}
            onClick={() => setActiveZone(z)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              activeZone === z
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {z} {z === "Zone A" ? "(Near Lift & Exit)" : "(Standard Bay)"}
          </button>
        ))}
      </div>

      {/* Slots Blueprint Visual Grid */}
      <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 relative shadow-inner">
        {/* Driving Lane Overlay */}
        <div className="w-full text-center py-1 bg-slate-800/60 rounded-md text-[10px] tracking-widest uppercase font-mono text-slate-400 mb-4 border border-dashed border-slate-700">
          ⬇️ MAIN VEHICLE DRIVING LANE - 5 MPH SPEED LIMIT ⬇️
        </div>

        {/* Slots Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredSlots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const isOccupied = slot.status === "occupied";

            return (
              <button
                key={slot.id}
                disabled={isOccupied}
                onClick={() => onSelectSlot(slot)}
                className={`h-24 rounded-xl p-2.5 flex flex-col justify-between items-start transition-all duration-200 border-2 relative overflow-hidden ${getSlotColorClass(
                  slot
                )}`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono font-bold text-sm tracking-wider">{slot.slotNumber}</span>
                  {slot.type === "ev_charging" ? (
                    <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
                  ) : slot.type === "handicap" ? (
                    <Accessibility className="w-4 h-4" />
                  ) : isTwoWheeler || slot.type === "two_wheeler" ? (
                    <Bike className="w-4 h-4" />
                  ) : (
                    <Car className="w-4 h-4" />
                  )}
                </div>

                {/* Status indicator */}
                <div className="w-full text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider block opacity-90">
                    {isOccupied ? "Occupied" : isSelected ? "✓ Selected" : slot.type.replace('_', ' ')}
                  </span>
                  <span className="text-[9px] opacity-75">{slot.floor} • {slot.zone}</span>
                </div>

                {/* Selected Ring checkmark */}
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-white text-blue-700 rounded-full p-0.5 shadow">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-600" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-indigo-600" />
          <span>Bike / Scooter Bay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-500" />
          <span>EV Fast Charger</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-300 dark:bg-slate-700" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-blue-600" />
          <span>Your Selected Slot</span>
        </div>
      </div>
    </div>
  );
}
