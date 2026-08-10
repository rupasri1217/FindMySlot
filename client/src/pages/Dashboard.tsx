import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Clock, 
  LogOut, 
  Plus, 
  Navigation, 
  Footprints, 
  Bookmark, 
  Bike, 
  Car, 
  QrCode, 
  FileText, 
  User, 
  XCircle, 
  Search,
  Building2,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LastMileAssistantModal } from "@/components/v2/LastMileAssistantModal";
import { LiveNavigationModal } from "@/components/v2/LiveNavigationModal";
import { CityName, PREDEFINED_CITIES } from "@/data/mockParkingData";
import { getUserSelectedCity, setUserSelectedCity, getUserSavedPlaces } from "@/services/storageService";
import { getUserBookings, cancelUserBooking } from "@/services/bookingService";
import { getAllParkingLots } from "@/services/parkingService";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "saved" | "profile">("overview");

  // Modals state
  const [lastMileModalOpen, setLastMileModalOpen] = useState(false);
  const [liveNavModalOpen, setLiveNavModalOpen] = useState(false);
  const [qrPassModalOpen, setQrPassModalOpen] = useState(false);

  // Profile Edit State
  const [userName, setUserName] = useState(user?.name || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [userPhone, setUserPhone] = useState(user?.phone || "+91 98765 43210");

  // Location Preference State
  const selectedCity = getUserSelectedCity(user?.email) || "Hyderabad";

  const handleCityChange = (newCity: string) => {
    const validCity = newCity as CityName;
    if (user?.email) {
      setUserSelectedCity(user.email, validCity);
      toast.success(`Selected location updated to ${validCity}`);
      window.location.reload();
    }
  };

  const [refreshTick, setRefreshTick] = useState(0);

  // Fetch bookings & saved places for CURRENT USER ONLY
  const userBookings = useMemo(() => getUserBookings(user?.email), [user?.email, refreshTick]);
  const savedPlaces = useMemo(() => getUserSavedPlaces(user?.email), [user?.email, refreshTick]);
  const allLots = useMemo(() => getAllParkingLots(true), [refreshTick]);

  const resolvedSavedPlaces = useMemo(() => {
    return savedPlaces.map(sp => {
      const lot = allLots.find(l => String(l.id) === String(sp.parkingLotId));
      const isInactive = !lot || lot.isActive === false || lot.status === "inactive";
      return {
        ...sp,
        originalName: lot?.name || "Facility",
        city: lot?.city || "City",
        address: lot?.address || "Address",
        isInactive,
      };
    });
  }, [savedPlaces, allLots]);

  // Filter active booking
  const activeSession = useMemo(() => {
    return userBookings.find(b => b.bookingStatus === "active") || null;
  }, [userBookings]);

  const handleCancelBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this active parking reservation?")) {
      cancelUserBooking(bookingId);
      toast.success("Parking reservation cancelled successfully");
      setRefreshTick((prev) => prev + 1);
      navigate("/dashboard");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile settings updated successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FindMySlot
              </span>
              <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5 border-blue-500/40 text-blue-600 font-semibold">
                Dashboard
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* City Preference Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs text-slate-500 font-medium">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="text-xs font-bold bg-transparent text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                {PREDEFINED_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Button size="sm" onClick={() => navigate(`/map?city=${selectedCity}`)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 text-xs font-semibold shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Where are you going?</span>
            </Button>

            <ThemeToggle />

            <Button variant="ghost" size="sm" onClick={logout} className="rounded-xl text-slate-500 hover:text-red-600 text-xs font-semibold">
              <LogOut className="w-4 h-4 mr-1" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Welcome back, {user?.name || "Mobility Driver"} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Account: <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.email}</span> • Location: <span className="font-bold">{selectedCity}</span>
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {[
              { id: "overview", label: "Overview" },
              { id: "history", label: `Bookings (${userBookings.length})` },
              { id: "saved", label: `Saved Places (${resolvedSavedPlaces.length})` },
              { id: "profile", label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            
            {/* Active Session OR Clean Empty State */}
            {activeSession ? (
              <Card className="rounded-2xl border-blue-500/40 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      {activeSession.vehicleType === "car" || activeSession.vehicleType === "ev" ? <Car className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                    </div>
                    <div>
                      <Badge className="bg-emerald-500 text-white font-bold mb-1">
                        Active Parking Session
                      </Badge>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {activeSession.parkingLotName}
                      </h2>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{activeSession.address}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                      Slot {activeSession.slotNumber}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">{activeSession.floorLevel}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-400 font-semibold">Vehicle Number</div>
                    <div className="text-sm font-bold font-mono">{activeSession.vehicleNumber}</div>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-400 font-semibold">Duration Reserved</div>
                    <div className="text-sm font-bold">{activeSession.durationHours} Hours</div>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-400 font-semibold">Total Amount</div>
                    <div className="text-sm font-bold text-emerald-600">₹{activeSession.totalAmount}</div>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-400 font-semibold">Status</div>
                    <div className="text-sm font-bold text-blue-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      <span>Live Parked</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setQrPassModalOpen(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 font-bold shadow-md"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Digital QR Pass</span>
                    </Button>

                    <Button
                      onClick={() => setLiveNavModalOpen(true)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-1.5 font-semibold border-slate-200 dark:border-slate-800"
                    >
                      <Navigation className="w-4 h-4 text-blue-500" />
                      <span>Turn Guidance</span>
                    </Button>

                    <Button
                      onClick={() => setLastMileModalOpen(true)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-1.5 font-semibold border-slate-200 dark:border-slate-800"
                    >
                      <Footprints className="w-4 h-4 text-emerald-500" />
                      <span>Last-Mile Transit</span>
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleCancelBooking(activeSession.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-semibold text-xs"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    <span>Cancel Booking</span>
                  </Button>
                </div>
              </Card>
            ) : (
              /* User Empty State */
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-12 text-center shadow-xl space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Car className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  No Active Parking Session
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Find a parking spot near your destination in {selectedCity} to get started!
                </p>
                <Button
                  onClick={() => navigate(`/map?city=${selectedCity}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg inline-flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Where are you going?</span>
                </Button>
              </Card>
            )}

            {/* User Bookings & Saved Places Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent Bookings List */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Recent Bookings</span>
                  </h3>
                  <Button variant="link" onClick={() => setActiveTab("history")} className="text-xs text-blue-600 font-bold">
                    View All
                  </Button>
                </div>

                {userBookings.length > 0 ? (
                  <div className="space-y-3">
                    {userBookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                            {b.slotNumber}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white">{b.parkingLotName}</div>
                            <div className="text-xs text-slate-500">{b.city} • {b.vehicleType.toUpperCase()} ({b.vehicleNumber})</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900 dark:text-white">₹{b.totalAmount}</div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              b.bookingStatus === "active"
                                ? "border-emerald-500 text-emerald-600"
                                : b.bookingStatus === "cancelled"
                                ? "border-red-500 text-red-500"
                                : "border-slate-300 text-slate-500"
                            }`}
                          >
                            {b.bookingStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                    No bookings yet. Find a parking spot to get started.
                  </div>
                )}
              </div>

              {/* Saved Places Panel */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-emerald-500" />
                    <span>Saved Places</span>
                  </h3>
                  <Button variant="link" onClick={() => setActiveTab("saved")} className="text-xs text-blue-600 font-bold">
                    View All
                  </Button>
                </div>

                {resolvedSavedPlaces.length > 0 ? (
                  <div className="space-y-3">
                    {resolvedSavedPlaces.map((sp) => (
                      <div
                        key={sp.id}
                        onClick={() => {
                          if (!sp.isInactive) {
                            navigate(`/map?city=${sp.city}&dest=${encodeURIComponent(sp.originalName)}`);
                          }
                        }}
                        className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm transition-all ${
                          sp.isInactive
                            ? "border-red-200 dark:border-red-950 opacity-70 cursor-not-allowed"
                            : "border-slate-200 dark:border-slate-800 hover:shadow-md cursor-pointer group"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {sp.customName}
                          </div>
                          {sp.isInactive && (
                            <Badge variant="outline" className="text-[9px] border-red-500 text-red-500 font-bold">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{sp.address}, {sp.city}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                    You haven't saved any places yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Your Booking History</span>
              </CardTitle>
              <CardDescription>
                View details of all your past and active slot reservations.
              </CardDescription>
            </CardHeader>

            {userBookings.length > 0 ? (
              <div className="space-y-3">
                {userBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl flex items-center justify-center font-extrabold text-sm">
                        {b.slotNumber}
                      </div>
                      <div>
                        <div className="font-bold text-base text-slate-900 dark:text-white">{b.parkingLotName}</div>
                        <div className="text-xs text-slate-500">{b.address}, {b.city}</div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                          Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{b.bookingDate || b.createdAt.slice(0, 10)}</span> • Time: <span className="font-bold text-blue-600">{b.startTime} {b.endTime ? `- ${b.endTime}` : ""}</span> • {b.durationHours} hrs • {b.vehicleNumber} ({b.vehicleType.toUpperCase()})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">₹{b.totalAmount}</div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            b.bookingStatus === "active"
                              ? "border-emerald-500 text-emerald-600"
                              : b.bookingStatus === "cancelled"
                              ? "border-red-500 text-red-500"
                              : "border-slate-300 text-slate-500"
                          }`}
                        >
                          {b.bookingStatus.toUpperCase()}
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success(`Receipt downloaded for booking ${b.id}`)}
                        className="rounded-xl text-xs font-semibold gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No bookings yet. Find a parking spot to get started.
              </div>
            )}
          </Card>
        )}

        {/* SAVED PLACES TAB */}
        {activeTab === "saved" && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-500" />
                <span>Your Saved Places</span>
              </CardTitle>
            </CardHeader>

            {resolvedSavedPlaces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolvedSavedPlaces.map((sp) => (
                  <div
                    key={sp.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-3 ${
                      sp.isInactive ? "border-red-200 dark:border-red-950 opacity-80" : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">{sp.customName}</h4>
                        <div className="text-xs text-slate-400 font-medium">Facility: {sp.originalName}</div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>{sp.address}, {sp.city}</span>
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          sp.isInactive ? "border-red-500 text-red-500" : "border-emerald-500/40 text-emerald-600"
                        }`}
                      >
                        {sp.isInactive ? "Inactive" : "Saved"}
                      </Badge>
                    </div>

                    {sp.isInactive ? (
                      <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-2.5 text-xs text-red-600 dark:text-red-300 flex items-center gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Facility is inactive/unavailable. Booking disabled.</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => navigate(`/map?city=${sp.city}&dest=${encodeURIComponent(sp.originalName)}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold py-2 shadow-sm"
                      >
                        Find Parking Near Here
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                You haven't saved any places yet.
              </div>
            )}
          </Card>
        )}

        {/* PROFILE SETTINGS TAB */}
        {activeTab === "profile" && (
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Profile & Preferences</span>
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div>
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                <Input
                  value={userEmail}
                  disabled
                  className="rounded-xl mt-1 opacity-70 bg-slate-100 dark:bg-slate-800"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</Label>
                <Input
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="rounded-xl mt-1"
                />
              </div>

              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 py-2">
                Save Profile Changes
              </Button>
            </form>
          </Card>
        )}

      </main>

      {/* QR Pass Modal */}
      {activeSession && (
        <Dialog open={qrPassModalOpen} onOpenChange={setQrPassModalOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Digital QR Entry Pass</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <img
                src={activeSession.qrCodeUrl}
                alt="QR Entry Pass"
                className="w-48 h-48 mx-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-white"
              />
              <div className="text-2xl font-extrabold text-blue-600 font-mono">
                Slot {activeSession.slotNumber}
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                {activeSession.parkingLotName} • {activeSession.floorLevel}
              </div>
              <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                Vehicle: {activeSession.vehicleNumber} ({activeSession.vehicleType.toUpperCase()})
              </div>
            </div>

            <Button onClick={() => setQrPassModalOpen(false)} className="w-full bg-blue-600 text-white rounded-xl">
              Close Pass
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Modals */}
      <LastMileAssistantModal
        open={lastMileModalOpen}
        onOpenChange={setLastMileModalOpen}
        parkingLotName={activeSession?.parkingLotName || "Parking Deck"}
        destinationName="Destination Center"
        distanceMeters={150}
        walkingTimeMinutes={2}
      />

      <LiveNavigationModal
        open={liveNavModalOpen}
        onOpenChange={setLiveNavModalOpen}
        lotName={activeSession?.parkingLotName || "Parking Deck"}
        slotNumber={activeSession?.slotNumber || "Slot A-12"}
        floor={activeSession?.floorLevel || "P1 Level"}
      />
    </div>
  );
}
