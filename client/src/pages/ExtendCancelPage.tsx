import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { cancelUserBooking } from "@/services/bookingService";

export default function ExtendCancelPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/extend/:id");
  const { user } = useAuth();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<number | null>(null);

  if (!user) {
    navigate("/");
    return null;
  }

  // Mock booking data
  const booking = {
    id: params?.id || "1",
    slotNumber: "A12",
    location: "Downtown Plaza Parking",
    remainingTime: "30 mins",
    remainingMinutes: 30,
    totalCost: 150,
    startTime: "2:00 PM",
    endTime: "4:30 PM",
  };

  const extensionOptions = [
    { label: "+30 mins", minutes: 30, cost: 25 },
    { label: "+1 hour", minutes: 60, cost: 50 },
    { label: "+2 hours", minutes: 120, cost: 100 },
    { label: "Custom", minutes: 0, cost: 0 },
  ];

  const handleExtend = () => {
    if (selectedExtension === null) {
      toast.error("Please select an extension duration");
      return;
    }

    const extension = extensionOptions[selectedExtension];
    toast.success(`Booking extended by ${extension.label}. Additional cost: ₹${extension.cost}`);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  const handleCancel = () => {
    if (booking.id) {
      cancelUserBooking(booking.id);
    }
    toast.success("Booking cancelled successfully. Refund initiated.");
    setShowCancelDialog(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Manage Your Booking</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Current Booking Card */}
        <Card className="p-6 border-2 border-blue-200 bg-white shadow-lg">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{booking.location}</h2>
              <p className="text-gray-600">Slot: {booking.slotNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Current Time Remaining</p>
                <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  {booking.remainingTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Total Cost</p>
                <p className="text-2xl font-bold text-blue-600">₹{booking.totalCost}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="font-semibold text-gray-900">{booking.startTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Time</p>
                <p className="font-semibold text-gray-900">{booking.endTime}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Extend Time Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Extend Your Parking Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {extensionOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedExtension(idx)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedExtension === idx
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600">+₹{option.cost}</p>
                </div>
                {selectedExtension === idx && (
                  <CheckCircle className="w-5 h-5 text-green-600 float-right" />
                )}
              </button>
            ))}
          </div>

          {selectedExtension !== null && (
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-sm text-gray-600">Updated Total Cost</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{booking.totalCost + (extensionOptions[selectedExtension]?.cost || 0)}
              </p>
            </Card>
          )}

          <Button
            onClick={handleExtend}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-lg"
          >
            Confirm Extension
          </Button>
        </div>

        {/* Cancel Booking Section */}
        <Card className="p-6 border-2 border-red-200 bg-red-50">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900">Cancel This Booking</h3>
              <p className="text-sm text-red-700">Full refund will be initiated immediately</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCancelDialog(true)}
            variant="destructive"
            className="w-full"
          >
            Cancel Booking
          </Button>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone, but you will receive a full refund.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={handleCancel}
              variant="destructive"
              className="w-full"
            >
              Yes, Cancel Booking
            </Button>
            <Button
              onClick={() => setShowCancelDialog(false)}
              variant="outline"
              className="w-full"
            >
              Keep Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
