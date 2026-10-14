import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Navigation, 
  MapPin, 
  ArrowUpRight, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Layers,
  Footprints,
  Sparkles
} from "lucide-react";

interface LiveNavigationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lotName?: string;
  slotNumber?: string;
  floor?: string;
  zone?: string;
  destinationName?: string;
  onArrived?: () => void;
}

export function LiveNavigationModal({
  open,
  onOpenChange,
  lotName = "Grand Central Parking",
  slotNumber = "F1-B12",
  floor = "Floor 1",
  zone = "Zone B",
  destinationName = "Central Mall",
  onArrived,
}: LiveNavigationModalProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps = [
    {
      title: "Current Location",
      desc: "Head South on Main Expressway toward Parking Entrance",
      distance: "800m",
      instruction: "In 400m, turn right into Parking Gate 2",
    },
    {
      title: "Parking Entrance",
      desc: "Approach ANPR barrier gate & scan QR pass",
      distance: "200m",
      instruction: "Barrier auto-opens. Follow blue arrows to Floor 1 ramp",
    },
    {
      title: `Parking Floor (${floor})`,
      desc: "Proceed up ramp to Floor 1",
      distance: "50m",
      instruction: "Turn left towards Zone B Executive Parking Bay",
    },
    {
      title: `Parking Zone (${zone})`,
      desc: "Enter Zone B lane",
      distance: "15m",
      instruction: "Your reserved slot is on the right side",
    },
    {
      title: `Exact Slot (${slotNumber})`,
      desc: "Park in Slot " + slotNumber,
      distance: "0m",
      instruction: "🎉 You have reached your reserved slot! Park & continue journey.",
    },
  ];

  const handleNextStep = () => {
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      if (onArrived) onArrived();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6 bg-slate-950 text-white border-slate-800 shadow-2xl">
        <DialogHeader className="text-left mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg animate-pulse">
                <Navigation className="w-5 h-5 fill-current" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Live Navigation Assistant
                </DialogTitle>
                <span className="text-xs text-blue-400 font-medium">
                  Guiding to Slot {slotNumber} ({lotName})
                </span>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white font-bold text-xs">
              LIVE GPS
            </Badge>
          </div>
        </DialogHeader>

        {/* Multi-Stage Stepper Progress Bar */}
        <div className="my-3 py-2 border-y border-slate-800 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          {steps.map((s, idx) => {
            const isCompleted = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div key={idx} className="flex items-center gap-1.5 flex-1 min-w-[70px]">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-slate-950"
                      : isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] truncate hidden sm:inline ${
                    isCurrent ? "font-bold text-white" : "text-slate-400"
                  }`}
                >
                  {s.title.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Turn-by-Turn Instruction Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 my-2 relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">
              STEP {activeStepIndex + 1} OF {steps.length}: {steps[activeStepIndex].title}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {steps[activeStepIndex].distance} remaining
            </span>
          </div>

          <h4 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-blue-400 animate-bounce" />
            <span>{steps[activeStepIndex].instruction}</span>
          </h4>

          <p className="text-xs text-slate-400 mt-2">
            {steps[activeStepIndex].desc}
          </p>
        </div>

        {/* Blueprint Guidance Card */}
        <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40 text-xs flex items-center justify-between text-blue-200">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Floor 1 • Zone B • Reserved Slot #{slotNumber}</span>
          </div>
          <span className="font-bold text-emerald-400">Barrier Scan Ready</span>
        </div>

        {/* Footer Action */}
        <div className="pt-3 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-slate-800 text-slate-300 hover:bg-slate-900 text-xs py-2.5 rounded-xl"
          >
            Minimize
          </Button>
          <Button
            onClick={handleNextStep}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 shadow-lg"
          >
            <span>
              {activeStepIndex === steps.length - 1 ? "Finish & Park" : "Next Instruction"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
