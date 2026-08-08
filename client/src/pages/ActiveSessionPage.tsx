import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, AlertCircle, Navigation, Phone, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ActiveSessionPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(5400); // 90 minutes in seconds
  const [currentCost, setCurrentCost] = useState(150);
  const [showExtendDialog, setShowExtendDialog] = useState(false);

  if (!user) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isLowTime = timeRemaining < 600; // Less than 10 minutes

  const handleExtend = () => {
    toast.success("Booking extended by 1 hour. Additional cost: ₹50");
    setTimeRemaining((prev) => prev + 3600);
    setCurrentCost((prev) => prev + 50);
    setShowExtendDialog(false);
  };

  const handleEndSession = () => {
    toast.success("Parking session ended. Thank you for using FindMySlot!");
    setTimeout(() => navigate("/feedback"), 2000);
  };

  const handleEmergencyContact = () => {
    toast.info("Calling parking lot support...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Active Parking Session</h1>
        <p className="text-gray-600 mt-2">Your parking is active and running</p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Session Info Card */}
        <Card className="p-6 bg-white border-2 border-blue-200 shadow-lg">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Downtown Plaza Parking</h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                Slot A12 • 123 Main Street
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Session Start</p>
                <p className="font-semibold text-gray-900">2:00 PM</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="font-semibold text-gray-900">DL01AB1234</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Timer Display - Large */}
        <Card
          className={`p-8 text-center border-4 shadow-2xl ${
            isLowTime
              ? "bg-red-50 border-red-500"
              : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-500"
          }`}
        >
          <p className="text-sm font-medium text-gray-600 mb-2">TIME REMAINING</p>
          <div
            className={`text-6xl font-bold font-mono mb-4 ${
              isLowTime ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
          {isLowTime && (
            <div className="flex items-center justify-center gap-2 text-red-600 bg-red-100 px-4 py-2 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Time running out! Consider extending your session</span>
            </div>
          )}
        </Card>

        {/* Cost Tracking */}
        <Card className="p-6 bg-white border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Cost</p>
              <p className="text-3xl font-bold text-blue-600">₹{currentCost}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Rate</p>
              <p className="text-lg font-semibold text-gray-900">₹50/hour</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowExtendDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-6 font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Extend Time
          </Button>
          <Button
            onClick={handleEndSession}
            variant="destructive"
            className="py-6 font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            End Session
          </Button>
        </div>

        {/* Navigation & Support */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate("/navigation")}
            variant="outline"
            className="py-6 font-semibold rounded-lg flex items-center justify-center gap-2 border-2"
          >
            <Navigation className="w-5 h-5" />
            Navigate
          </Button>
          <Button
            onClick={handleEmergencyContact}
            variant="outline"
            className="py-6 font-semibold rounded-lg flex items-center justify-center gap-2 border-2"
          >
            <Phone className="w-5 h-5" />
            Support
          </Button>
        </div>

        {/* Session Details */}
        <Card className="p-6 bg-gray-50 border-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Session Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Slot Type</span>
              <span className="font-semibold text-gray-900">Standard</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Parking Lot</span>
              <span className="font-semibold text-gray-900">Downtown Plaza</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID</span>
              <span className="font-semibold text-gray-900">BK-2026-001234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className="font-semibold text-green-600">Paid</span>
            </div>
          </div>
        </Card>

        {/* Extend Dialog */}
        {showExtendDialog && (
          <Card className="p-6 bg-blue-50 border-2 border-blue-300">
            <h3 className="font-bold text-gray-900 mb-4">Extend Your Session?</h3>
            <div className="space-y-3 mb-4">
              {[
                { label: "+30 mins", cost: 25 },
                { label: "+1 hour", cost: 50 },
                { label: "+2 hours", cost: 100 },
              ].map((option, idx) => (
                <button
                  key={idx}
                  onClick={handleExtend}
                  className="w-full p-3 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-500 text-left font-medium text-gray-900 transition-all"
                >
                  {option.label} • +₹{option.cost}
                </button>
              ))}
            </div>
            <Button
              onClick={() => setShowExtendDialog(false)}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
