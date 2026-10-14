import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Footprints, 
  ShieldCheck, 
  Bike, 
  Car, 
  ArrowRight,
  SlidersHorizontal,
  Bookmark,
  MapPin,
  AlertCircle
} from "lucide-react";
import { MapParkingLot } from "./InteractiveMapCanvas";
import { VehicleType } from "./DestinationSearchBar";

interface SmartRecommendationCardsProps {
  parkingLots: (MapParkingLot & { distanceKm?: number })[];
  selectedLot: MapParkingLot | null;
  onSelectLot: (lot: MapParkingLot) => void;
  onBookLot: (lot: MapParkingLot) => void;
  onSaveLot?: (lot: MapParkingLot) => void;
  onCompareLots?: (lots: MapParkingLot[]) => void;
  vehicleType: VehicleType;
  destinationName: string;
  isSaved?: (lotId: string) => boolean;
}

export interface RankedLot extends MapParkingLot {
  rankTag?: "best" | "closest" | "cheapest" | "secure";
  rankTitle?: string;
  score?: number;
  distanceKm?: number;
}

export function SmartRecommendationCards({
  parkingLots,
  selectedLot,
  onSelectLot,
  onBookLot,
  onSaveLot,
  onCompareLots,
  vehicleType,
  destinationName,
  isSaved,
}: SmartRecommendationCardsProps) {
  const isTwoWheeler = vehicleType === "motorcycle" || vehicleType === "scooter";

  // Compute Smart Recommendation Rankings
  const rankedLots = useMemo(() => {
    if (!parkingLots || parkingLots.length === 0) return [];

    const calculated: RankedLot[] = parkingLots.map((lot, index) => {
      const price = isTwoWheeler
        ? Number(lot.twoWheelerPricePerHour ?? 20)
        : Number(lot.pricePerHour ?? 50);
      const walkTime = lot.walkingTimeMinutes || (index * 2 + 2);
      const walkDist = lot.walkingDistanceMeters || (index * 150 + 150);
      const security = Number(lot.securityRating || 4.7);

      const priceScore = (100 - price) * 0.4;
      const walkScore = (30 - walkTime) * 0.4;
      const securityScore = security * 10 * 0.2;
      const totalScore = priceScore + walkScore + securityScore;

      return {
        ...lot,
        walkingTimeMinutes: walkTime,
        walkingDistanceMeters: walkDist,
        score: totalScore,
      };
    });

    // If distanceKm is present (destination search active), sort by distanceKm nearest-first
    if (calculated.some(l => l.distanceKm !== undefined)) {
      calculated.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } else {
      calculated.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    if (calculated.length > 0) {
      calculated[0].rankTag = "best";
      calculated[0].rankTitle = destinationName ? "📍 Nearest Parking Option" : "🏆 Best Overall Match";
    }

    return calculated;
  }, [parkingLots, isTwoWheeler, destinationName]);

  const getRankBadgeClass = (tag?: string) => {
    switch (tag) {
      case "best":
        return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold shadow-md";
      case "closest":
        return "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md";
      case "cheapest":
        return "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md";
      default:
        return "bg-slate-800 text-white font-semibold";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Smart Recommendations</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {destinationName ? (
              <span>Showing parking near <span className="font-semibold text-blue-600 dark:text-blue-400">"{destinationName}"</span></span>
            ) : (
              <span>Intelligently ranked for your city & vehicle type</span>
            )}
          </p>
        </div>

        {onCompareLots && rankedLots.length >= 2 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCompareLots(rankedLots.slice(0, 3))}
            className="rounded-xl border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-1.5 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Compare Top Lots</span>
          </Button>
        )}
      </div>

      {/* Cards List OR Clean Empty State */}
      {rankedLots.length > 0 ? (
        <div className="space-y-3">
          {rankedLots.map((lot) => {
            const isSelected = selectedLot?.id === lot.id;
            const price = isTwoWheeler
              ? Number(lot.twoWheelerPricePerHour ?? 20)
              : Number(lot.pricePerHour ?? 50);
            const avail = isTwoWheeler
              ? lot.twoWheelerAvailableSlots ?? 12
              : lot.availableSlots;
            const saved = isSaved ? isSaved(String((lot as any).rawId || lot.id)) : false;

            return (
              <Card
                key={lot.id}
                onClick={() => onSelectLot(lot)}
                className={`cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden border-2 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 shadow-xl ring-2 ring-blue-500/20"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 bg-white/80 dark:bg-slate-900/80"
                }`}
              >
                <CardContent className="p-4">
                  {/* Rank Tag & Distance Banner */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {lot.rankTitle ? (
                      <Badge className={`text-[11px] px-2.5 py-0.5 rounded-full ${getRankBadgeClass(lot.rankTag)}`}>
                        {lot.rankTitle}
                      </Badge>
                    ) : <div />}

                    {lot.distanceKm !== undefined && (
                      <Badge className="bg-blue-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{lot.distanceKm} km away</span>
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                        <span>{lot.name}</span>
                        {onSaveLot && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveLot(lot);
                            }}
                            title={saved ? "Saved Place" : "Save this parking lot with custom name"}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Bookmark className={`w-4 h-4 ${saved ? "text-emerald-500 fill-emerald-500" : "text-slate-400"}`} />
                          </button>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {lot.address}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0">
                      <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                        ₹{price}<span className="text-xs font-normal text-slate-500">/hr</span>
                      </div>
                      <Badge variant={avail > 0 ? "secondary" : "destructive"} className="text-[10px] px-1.5 py-0 mt-0.5">
                        {avail > 0 ? `${avail} slots available` : "Full"}
                      </Badge>
                    </div>
                  </div>

                  {/* Metrics Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl my-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">Distance</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {lot.distanceKm !== undefined ? `${lot.distanceKm} km` : `${lot.walkingTimeMinutes} mins`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-x border-slate-200 dark:border-slate-700 px-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">Security</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {lot.securityRating || "4.8"}/5 ⭐
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-1">
                      {isTwoWheeler ? (
                        <Bike className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      ) : (
                        <Car className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-[10px] text-slate-400">Category</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                          {isTwoWheeler ? "Bike Bay" : "Car Bay"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Badges & Action */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px] py-0 px-2 border-slate-300 dark:border-slate-700">
                        {lot.parkingType || "Multi-Level"}
                      </Badge>
                      {lot.isCovered && (
                        <Badge variant="outline" className="text-[10px] py-0 px-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                          Covered Bay
                        </Badge>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookLot(lot);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs px-3.5 py-1.5 h-8 flex items-center gap-1 shadow-md"
                    >
                      <span>Reserve</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Clean Empty States */
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-8 text-center bg-white/80 dark:bg-slate-900/80 space-y-3">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            {destinationName ? `No nearby parking available` : `No parking lots available`}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {destinationName
              ? `There are currently no active parking lots available within 10 km of "${destinationName}".`
              : `There are currently no available parking lots in this city.`}
          </p>
        </Card>
      )}
    </div>
  );
}
