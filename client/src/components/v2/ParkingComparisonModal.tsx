import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Footprints, 
  ShieldCheck, 
  DollarSign, 
  Building2, 
  Star,
  ArrowRight
} from "lucide-react";
import { MapParkingLot } from "./InteractiveMapCanvas";
import { VehicleType } from "./DestinationSearchBar";

interface ParkingComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lots: MapParkingLot[];
  onSelectLot: (lot: MapParkingLot) => void;
  vehicleType: VehicleType;
}

export function ParkingComparisonModal({
  open,
  onOpenChange,
  lots,
  onSelectLot,
  vehicleType,
}: ParkingComparisonModalProps) {
  if (!lots || lots.length === 0) return null;

  const isTwoWheeler = vehicleType === "motorcycle" || vehicleType === "scooter";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span>Parking Comparison Matrix</span>
            <Badge variant="secondary" className="text-xs capitalize">
              {vehicleType.replace("_", " ")} Mode
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Compare pricing, walking distance, security ratings, and amenities side-by-side to make the best choice.
          </DialogDescription>
        </DialogHeader>

        {/* Comparison Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 font-semibold text-slate-500 text-xs w-1/4">Criteria</th>
                {lots.map((lot) => (
                  <th key={lot.id} className="p-3 font-bold text-slate-900 dark:text-white text-base">
                    <div>{lot.name}</div>
                    <p className="text-xs text-slate-500 font-normal truncate max-w-[200px]">{lot.address}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* Hourly Rate */}
              <tr>
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span>Hourly Rate</span>
                </td>
                {lots.map((lot) => {
                  const price = isTwoWheeler
                    ? Number(lot.twoWheelerPricePerHour ?? 20)
                    : Number(lot.pricePerHour ?? 50);
                  return (
                    <td key={lot.id} className="p-3 font-black text-lg text-blue-600 dark:text-blue-400">
                      ₹{price}/hr
                    </td>
                  );
                })}
              </tr>

              {/* Walking Distance & Time */}
              <tr>
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-emerald-500" />
                  <span>Walk to Dest</span>
                </td>
                {lots.map((lot) => (
                  <td key={lot.id} className="p-3 font-medium text-emerald-600 dark:text-emerald-400">
                    {lot.walkingTimeMinutes || 4} mins ({lot.walkingDistanceMeters || 300}m)
                  </td>
                ))}
              </tr>

              {/* Security Rating */}
              <tr>
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Security Rating</span>
                </td>
                {lots.map((lot) => (
                  <td key={lot.id} className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {lot.securityRating || "4.8"}/5 ⭐ (CCTV + Guard)
                  </td>
                ))}
              </tr>

              {/* Parking Type */}
              <tr>
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span>Facility Type</span>
                </td>
                {lots.map((lot) => (
                  <td key={lot.id} className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                    {lot.parkingType || "Multi-Level Covered"}
                  </td>
                ))}
              </tr>

              {/* Covered Bay */}
              <tr>
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Weather Shield</td>
                {lots.map((lot) => (
                  <td key={lot.id} className="p-3">
                    {lot.isCovered ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-none">
                        <Check className="w-3 h-3 mr-1" /> Covered
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500">
                        Open Lot
                      </Badge>
                    )}
                  </td>
                ))}
              </tr>

              {/* Available Slots */}
              <tr>
                <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">Available Slots</td>
                {lots.map((lot) => {
                  const avail = isTwoWheeler
                    ? lot.twoWheelerAvailableSlots ?? 15
                    : lot.availableSlots;
                  return (
                    <td key={lot.id} className="p-3 font-bold text-slate-900 dark:text-white">
                      {avail} spots left
                    </td>
                  );
                })}
              </tr>

              {/* Action Buttons */}
              <tr>
                <td className="p-3"></td>
                {lots.map((lot) => (
                  <td key={lot.id} className="p-3">
                    <Button
                      onClick={() => {
                        onSelectLot(lot);
                        onOpenChange(false);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs py-2 flex items-center justify-center gap-1 shadow-md"
                    >
                      <span>Choose Lot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
