import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Bike, 
  Car, 
  Zap, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  Loader2,
  Grid3X3,
  XCircle,
  AlertCircle,
  Calendar
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { InteractiveSlotGrid, SlotGridItem } from "@/components/v2/InteractiveSlotGrid";
import { VehicleType } from "@/components/v2/DestinationSearchBar";
import { getAllParkingLots } from "@/services/parkingService";
import { 
  createTemporaryHold, 
  releaseTemporaryHold, 
  confirmBookingAndPayment, 
  validateBookingPeriod,
  isSlotAvailableForTimePeriod,
  getOccupiedSlotsForTimePeriod,
  TemporarySlotHold 
} from "@/services/bookingService";
import { BookingRecord } from "@/data/mockParkingData";
import { toast } from "sonner";

export default function BookingPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/booking/:slotId");
  const rawSlotParam = params?.slotId || "hyd-01";

  // Extract URL Query Params
  const queryParams = new URLSearchParams(window.location.search);
  const initialVehicle = (queryParams.get("vehicle") as VehicleType) || "car";
  const initialCity = queryParams.get("city") || "Hyderabad";
  const initialDestination = queryParams.get("dest") || "Central Mall";

  // Stepper State (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Today Date Helper (YYYY-MM-DD)
  const todayISO = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // Booking Date & Time Selection State
  const [bookingDate, setBookingDate] = useState<string>(todayISO);
  const [startTimeStr, setStartTimeStr] = useState<string>("10:00");
  const [endTimeStr, setEndTimeStr] = useState<string>("12:00");

  // Form & Hold State
  const [vehicleType, setVehicleType] = useState<VehicleType>(initialVehicle);
  const [vehicleNumber, setVehicleNumber] = useState<string>("TS 09 AB 1234");
  const [destinationName, setDestinationName] = useState<string>(initialDestination);
  const [selectedSlot, setSelectedSlot] = useState<SlotGridItem | null>({
    id: 101,
    slotNumber: "A-12",
    status: "available",
    type: initialVehicle === "ev_car" ? "ev_charging" : "standard",
    vehicleCategory: initialVehicle === "motorcycle" || initialVehicle === "scooter" ? "two_wheeler" : "four_wheeler",
    floor: "P1 Level",
    zone: "Zone A",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHold, setCurrentHold] = useState<TemporarySlotHold | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  // Find Target Parking Lot
  const allLots = useMemo(() => getAllParkingLots(), []);
  const targetLot = useMemo(() => {
    return allLots.find(l => String(l.id) === String(rawSlotParam)) || allLots.find(l => l.city === initialCity) || allLots[0];
  }, [allLots, rawSlotParam, initialCity]);

  // Date & Time Validation Computation
  const periodValidation = useMemo(() => {
    return validateBookingPeriod(bookingDate, startTimeStr, endTimeStr);
  }, [bookingDate, startTimeStr, endTimeStr]);

  const isTwoWheeler = vehicleType === "motorcycle" || vehicleType === "scooter";
  const hourlyRate = isTwoWheeler ? targetLot.twoWheelerPricePerHour : targetLot.pricePerHour;
  const durationHours = periodValidation.durationHours || 2;
  const totalPrice = Math.round(hourlyRate * durationHours);
  const isFull = targetLot.availableSlots === 0;

  // Compute Occupied Slots for the Selected Time Period
  const occupiedSlotNumbers = useMemo(() => {
    if (!periodValidation.isValid || !periodValidation.startDateTime || !periodValidation.endDateTime) {
      return new Set<string>();
    }
    return getOccupiedSlotsForTimePeriod(
      targetLot.id,
      periodValidation.startDateTime,
      periodValidation.endDateTime
    );
  }, [targetLot.id, periodValidation]);

  // Step 3 ➔ Step 4: Validate Schedule & Create Hold
  const handleProceedToDuration = () => {
    if (!periodValidation.isValid) {
      toast.error(periodValidation.error || "Invalid booking date or time selection");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select an available slot on the blueprint grid");
      return;
    }

    // Time-Based Slot Availability Overlap Check
    const isAvailable = isSlotAvailableForTimePeriod(
      targetLot.id,
      selectedSlot.slotNumber,
      periodValidation.startDateTime!,
      periodValidation.endDateTime!
    );

    if (!isAvailable) {
      toast.error(`Slot ${selectedSlot.slotNumber} is already booked for the selected time window (${periodValidation.startTimeFormatted} - ${periodValidation.endTimeFormatted}). Please choose another slot or time period.`);
      return;
    }

    const hold = createTemporaryHold(targetLot.id, selectedSlot.slotNumber, user?.email || "guest@findmyslot.com");
    setCurrentHold(hold);
    setCurrentStep(4);
    toast.info(`Temporary 10-minute hold placed on Slot ${selectedSlot.slotNumber}`);
  };

  // Cancel Payment Handler
  const handleCancelPayment = () => {
    if (currentHold) {
      releaseTemporaryHold(currentHold.holdId);
      setCurrentHold(null);
    }
    toast.warning("Payment Cancelled", {
      description: "No booking was created, no slot reserved, and no payment charged."
    });
    setCurrentStep(3);
  };

  // Step 4 ➔ Step 5 ➔ Step 6: Confirm Booking & Payment
  const handleConfirmAndPay = () => {
    if (!user?.email) {
      toast.error("Please sign in to complete your booking");
      return;
    }

    if (!periodValidation.isValid || !periodValidation.startDateTime || !periodValidation.endDateTime) {
      toast.error("Please correct date & time errors before proceeding");
      return;
    }

    // Final Overlap Safety Check
    const isStillAvailable = isSlotAvailableForTimePeriod(
      targetLot.id,
      selectedSlot?.slotNumber || "A-12",
      periodValidation.startDateTime,
      periodValidation.endDateTime
    );

    if (!isStillAvailable) {
      toast.error("Slot is no longer available for this time window. Please pick another slot.");
      return;
    }

    setIsSubmitting(true);
    setCurrentStep(5); // Step 5: Processing Animation

    setTimeout(() => {
      const newBooking = confirmBookingAndPayment({
        userId: user.id,
        userEmail: user.email,
        userName: user.name || "Valued User",
        parkingLotId: targetLot.id,
        parkingLotName: targetLot.name,
        city: targetLot.city,
        address: targetLot.address,
        slotNumber: selectedSlot?.slotNumber || "A-12",
        floorLevel: selectedSlot?.floor || "P1 Level",
        vehicleType: vehicleType as any,
        vehicleNumber: vehicleNumber || "TS 09 AB 4321",
        bookingDate: periodValidation.bookingDate,
        startTime: periodValidation.startTimeFormatted || `${startTimeStr} AM`,
        endTime: periodValidation.endTimeFormatted || `${endTimeStr} PM`,
        startDateTime: periodValidation.startDateTime,
        endDateTime: periodValidation.endDateTime,
        durationHours: periodValidation.durationHours || 2,
        totalAmount: totalPrice,
        bookingStatus: "active",
      }, currentHold?.holdId);

      setConfirmedBooking(newBooking);
      setIsSubmitting(false);
      setCurrentStep(6); // Step 6: Digital Pass
      toast.success(`Booking Confirmed! Reserved Slot ${newBooking.slotNumber} for ${periodValidation.bookingDate}`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              if (currentHold) releaseTemporaryHold(currentHold.holdId);
              navigate("/map");
            }}
            variant="ghost"
            size="sm"
            className="rounded-xl flex items-center gap-1 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Map</span>
          </Button>

          <Badge variant="outline" className="border-blue-500/40 text-blue-600 font-bold px-3 py-1">
            FindMySlot Booking Wizard
          </Badge>
        </div>

        {/* Stepper Progress Bar */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Step {currentStep} of 6</span>
            <span className="text-blue-600 dark:text-blue-400">
              {currentStep === 1 && "Vehicle & Schedule Setup"}
              {currentStep === 2 && "Facility Overview"}
              {currentStep === 3 && "Time-Based Blueprint Grid"}
              {currentStep === 4 && "Booking Summary & Payment"}
              {currentStep === 5 && "Securing Reservation..."}
              {currentStep === 6 && "Booking Confirmed Pass"}
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Vehicle Category & Date/Time Setup */}
        {currentStep === 1 && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                <span>Vehicle Details & Schedule Setup</span>
              </CardTitle>
              <CardDescription>
                Select your vehicle type, booking date, and start/end time.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              {/* Vehicle Type Options */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                  Select Vehicle Category
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "car", label: "Car", icon: Car, rate: `₹${targetLot.pricePerHour}/hr` },
                    { id: "motorcycle", label: "Motorcycle", icon: Bike, rate: `₹${targetLot.twoWheelerPricePerHour}/hr` },
                    { id: "scooter", label: "Scooter", icon: Bike, rate: `₹${targetLot.twoWheelerPricePerHour}/hr` },
                    { id: "ev_car", label: "EV Car", icon: Zap, rate: `₹${targetLot.evPricePerHour}/hr` },
                  ].map((v) => {
                    const IconComp = v.icon;
                    const isSelected = vehicleType === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicleType(v.id as VehicleType)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <IconComp className="w-6 h-6 mb-2" />
                        <div className="font-bold text-sm">{v.label}</div>
                        <div className="text-xs opacity-80 mt-1">{v.rate}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time Selection Inputs */}
              <div className="bg-slate-100/70 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Select Booking Period (Date & Time Window)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Booking Date *
                    </Label>
                    <Input
                      type="date"
                      min={todayISO}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="bg-white dark:bg-slate-950 rounded-xl mt-1 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Start Time *
                    </Label>
                    <Input
                      type="time"
                      value={startTimeStr}
                      onChange={(e) => setStartTimeStr(e.target.value)}
                      className="bg-white dark:bg-slate-950 rounded-xl mt-1 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      End Time *
                    </Label>
                    <Input
                      type="time"
                      value={endTimeStr}
                      onChange={(e) => setEndTimeStr(e.target.value)}
                      className="bg-white dark:bg-slate-950 rounded-xl mt-1 text-sm font-bold"
                    />
                  </div>
                </div>

                {/* Validation Banner */}
                {!periodValidation.isValid ? (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{periodValidation.error}</span>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-3 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-semibold">
                    <span>
                      Duration: <strong className="text-blue-600">{periodValidation.durationHours} Hours</strong> ({periodValidation.startTimeFormatted} - {periodValidation.endTimeFormatted})
                    </span>
                    <Badge variant="outline" className="border-blue-500 text-blue-600 font-bold">
                      Valid Schedule
                    </Badge>
                  </div>
                )}
              </div>

              {/* Registration & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Vehicle Registration Number *
                  </Label>
                  <Input
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. TS 09 AB 1234"
                    className="rounded-xl mt-1 font-mono font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Destination Name
                  </Label>
                  <Input
                    value={destinationName}
                    onChange={(e) => setDestinationName(e.target.value)}
                    placeholder="Where are you heading?"
                    className="rounded-xl mt-1 font-medium"
                  />
                </div>
              </div>

              <Button
                disabled={!periodValidation.isValid}
                onClick={() => setCurrentStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <span>Continue to Facility Overview</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Facility Overview */}
        {currentStep === 2 && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold mb-2">
                  {targetLot.city} Facility ({targetLot.source === "admin" ? "Partner Verified" : "Prototype Lot"})
                </Badge>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{targetLot.name}</h2>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>{targetLot.address}</span>
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  ₹{hourlyRate}<span className="text-xs text-slate-400 font-normal">/hr</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold mt-1 ${
                    isFull ? "border-red-500 text-red-500" : "border-emerald-500 text-emerald-600"
                  }`}
                >
                  {isFull ? "Parking Full (0 Available)" : `${targetLot.availableSlots} Slots Total`}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-semibold">Total Floors</div>
                <div className="text-base font-bold">{targetLot.floors} Levels</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-semibold">Date</div>
                <div className="text-base font-bold">{bookingDate}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-semibold">Reserved Window</div>
                <div className="text-xs font-bold text-blue-600">{periodValidation.startTimeFormatted} - {periodValidation.endTimeFormatted}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-semibold">Operating Hours</div>
                <div className="text-base font-bold">{targetLot.operatingHours}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep(1)} variant="outline" className="w-1/3 rounded-xl">
                Back
              </Button>
              <Button
                disabled={isFull}
                onClick={() => setCurrentStep(3)}
                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
              >
                Proceed to Time-Based Slot Grid
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: Time-Based Slot Blueprint Grid */}
        {currentStep === 3 && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-blue-600" />
                  <span>Choose Slot for {bookingDate} ({periodValidation.startTimeFormatted} - {periodValidation.endTimeFormatted})</span>
                </span>
                {selectedSlot && (
                  <Badge className="bg-blue-600 text-white font-bold">
                    Selected: {selectedSlot.slotNumber} ({selectedSlot.floor})
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Slots marked occupied are already booked for this specific date and time window.
              </CardDescription>
            </CardHeader>

            <InteractiveSlotGrid
              slots={[]}
              selectedSlotId={selectedSlot?.id || null}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              vehicleType={vehicleType}
              lotName={targetLot.name}
              occupiedSlotNumbers={occupiedSlotNumbers}
            />

            <div className="flex gap-3">
              <Button onClick={() => setCurrentStep(2)} variant="outline" className="w-1/3 rounded-xl">
                Back
              </Button>
              <Button
                onClick={handleProceedToDuration}
                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
              >
                Place Temporary Hold & Continue
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: Booking Summary & Payment Review */}
        {currentStep === 4 && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Booking Summary & Payment Review</span>
              </CardTitle>
            </CardHeader>

            <div className="space-y-4">
              {currentHold && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-3 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Slot {selectedSlot?.slotNumber} is temporarily held for you.</span>
                  </span>
                  <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-300 font-mono">
                    10-Min Hold Active
                  </Badge>
                </div>
              )}

              {/* Exact Required Booking Summary */}
              <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-2 uppercase tracking-wider">
                  Reservation Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs">Facility:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{targetLot.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Slot Number:</span>
                    <span className="font-bold text-blue-600">{selectedSlot?.slotNumber} ({selectedSlot?.floor})</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Booking Date:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{periodValidation.bookingDate}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Time Period:</span>
                    <span className="font-bold text-blue-600">{periodValidation.startTimeFormatted} - {periodValidation.endTimeFormatted}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Duration:</span>
                    <span className="font-semibold">{periodValidation.durationHours} Hours</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-xs">Vehicle:</span>
                    <span className="font-mono font-bold">{vehicleNumber} ({vehicleType.toUpperCase()})</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center text-lg font-bold">
                  <span>Total Amount Payable:</span>
                  <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">₹{totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCancelPayment}
                variant="outline"
                className="w-1/3 rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <XCircle className="w-4 h-4 mr-1" />
                <span>Cancel Payment</span>
              </Button>

              <Button
                onClick={handleConfirmAndPay}
                className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 py-3"
              >
                Confirm & Pay ₹{totalPrice}
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 5: Processing Animation */}
        {currentStep === 5 && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-12 text-center shadow-xl space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Securing Time Slot & Confirming Reservation...</h3>
            <p className="text-sm text-slate-500">Processing booking for {periodValidation.bookingDate} ({periodValidation.startTimeFormatted} - {periodValidation.endTimeFormatted}).</p>
          </Card>
        )}

        {/* STEP 6: Booking Confirmed & Digital Pass */}
        {currentStep === 6 && confirmedBooking && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold mb-2">
                Booking Confirmed
              </Badge>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Slot is Reserved!</h2>
              <p className="text-sm text-slate-500 mt-1">Pass ID: {confirmedBooking.id}</p>
            </div>

            {/* Confirmed Summary Card */}
            <div className="max-w-md mx-auto glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-inner space-y-3 text-left">
              <img
                src={confirmedBooking.qrCodeUrl}
                alt="Digital Pass QR"
                className="w-36 h-36 mx-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-white"
              />

              <div className="text-center font-mono text-xl font-extrabold text-blue-600 dark:text-blue-400">
                Slot {confirmedBooking.slotNumber} ({confirmedBooking.floorLevel})
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                <div><span className="text-slate-400">Facility:</span> <div className="font-bold text-slate-800 dark:text-slate-200">{confirmedBooking.parkingLotName}</div></div>
                <div><span className="text-slate-400">Date:</span> <div className="font-bold text-slate-800 dark:text-slate-200">{confirmedBooking.bookingDate}</div></div>
                <div><span className="text-slate-400">Time Range:</span> <div className="font-bold text-blue-600">{confirmedBooking.startTime} - {confirmedBooking.endTime}</div></div>
                <div><span className="text-slate-400">Total Paid:</span> <div className="font-bold text-emerald-600">₹{confirmedBooking.totalAmount}</div></div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 max-w-md mx-auto">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg"
              >
                Go to My Dashboard
              </Button>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
