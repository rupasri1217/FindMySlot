import { useState } from "react";
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
  Footprints, 
  Bike, 
  Car, 
  Navigation, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface LastMileAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinationName: string;
  parkingLotName?: string;
  distanceMeters?: number;
  walkingTimeMinutes?: number;
}

export function LastMileAssistantModal({
  open,
  onOpenChange,
  destinationName,
  parkingLotName = "Parked Location",
  distanceMeters = 380,
  walkingTimeMinutes = 5,
}: LastMileAssistantModalProps) {
  const [selectedRide, setSelectedRide] = useState<string>("walk");
  const [isLaunching, setIsLaunching] = useState(false);

  const rideOptions = [
    {
      id: "walk",
      provider: "Walking Journey",
      icon: Footprints,
      color: "emerald",
      badge: "Free & Eco",
      eta: `${walkingTimeMinutes} mins`,
      distance: `${distanceMeters} meters`,
      fare: "₹0",
      description: "Pedestrian walkway with sheltered shaded path",
    },
    {
      id: "rapido",
      provider: "Rapido Bike Taxi",
      icon: Bike,
      color: "amber",
      badge: "Fastest Ride",
      eta: "2 mins",
      distance: `${(distanceMeters / 1000).toFixed(1)} km`,
      fare: "₹25",
      description: "Quick two-wheeler pickup at Parking Gate 1",
    },
    {
      id: "uber",
      provider: "Uber Auto / Go",
      icon: Car,
      color: "slate",
      badge: "Comfortable",
      eta: "3 mins",
      distance: `${(distanceMeters / 1000).toFixed(1)} km`,
      fare: "₹45",
      description: "AC Auto or Cab arriving at Parking Exit",
    },
    {
      id: "ola",
      provider: "Ola Mini",
      icon: Car,
      color: "emerald",
      badge: "Popular",
      eta: "3 mins",
      distance: `${(distanceMeters / 1000).toFixed(1)} km`,
      fare: "₹50",
      description: "Instant booking with live GPS tracking",
    },
  ];

  const handleLaunchApp = (provider: string) => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      onOpenChange(false);
      toast.success(`Redirecting to ${provider}...`, {
        description: `Journey synced to ${destinationName}. Safe travels!`,
      });
    }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="text-left mb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Last-Mile Assistant
              </DialogTitle>
              <span className="text-xs text-slate-500 font-medium">
                Continue Journey from Parking Lot
              </span>
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            You are parked at <span className="font-semibold text-slate-700 dark:text-slate-200">{parkingLotName}</span>. Your final destination <span className="font-semibold text-blue-600">{destinationName || "Destination"}</span> is {distanceMeters}m away.
          </DialogDescription>
        </DialogHeader>

        {/* Options List */}
        <div className="space-y-2.5 my-3">
          {rideOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedRide === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedRide(opt.id)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 shadow-md ring-2 ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-none">
                        {opt.provider}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {opt.fare}
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5">
                      {opt.eta}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Button
            disabled={isLaunching}
            onClick={() => {
              const selected = rideOptions.find((r) => r.id === selectedRide);
              handleLaunchApp(selected?.provider || "Ride App");
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <span>
              {selectedRide === "walk"
                ? "Start Walking Navigation"
                : `Open ${rideOptions.find((r) => r.id === selectedRide)?.provider.split(' ')[0]} App`}
            </span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
