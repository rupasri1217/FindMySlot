import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  LogOut, 
  Bike, 
  Car, 
  Activity, 
  BarChart3,
  Sparkles,
  Layers,
  Calendar,
  Trash2,
  AlertTriangle,
  ShieldCheck
} from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CityName, PREDEFINED_CITIES, ParkingLot } from "@/data/mockParkingData";
import { getAdminFacilities, registerAdminFacility, deleteAdminParkingLot } from "@/services/parkingService";
import { getAdminBookings } from "@/services/bookingService";
import { getAdminAnalytics } from "@/services/analyticsService";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const [activeTab, setActiveTab] = useState<"overview" | "facilities" | "bookings">("overview");
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);

  // Soft-Delete Confirmation Dialog State
  const [lotToDelete, setLotToDelete] = useState<ParkingLot | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Facility Registration Form State
  const [name, setName] = useState("");
  const [city, setCity] = useState<CityName>("Hyderabad");
  const [address, setAddress] = useState("");
  const [floors, setFloors] = useState("4");
  const [totalSlots, setTotalSlots] = useState("120");
  const [carSlots, setCarSlots] = useState("70");
  const [bikeSlots, setBikeSlots] = useState("40");
  const [evSlots, setEvSlots] = useState("10");
  const [disabledSlots, setDisabledSlots] = useState("5");
  const [operatingHours, setOperatingHours] = useState("24/7 Open");
  const [pricePerHour, setPricePerHour] = useState("50");
  const [twoWheelerPricePerHour, setTwoWheelerPricePerHour] = useState("20");
  const [evPricePerHour, setEvPricePerHour] = useState("60");
  const [dailyPrice, setDailyPrice] = useState("350");
  const [monthlyPassAvailable, setMonthlyPassAvailable] = useState(true);
  const [monthlyPassPrice, setMonthlyPassPrice] = useState("4500");

  // Admin-Isolated Data
  const adminEmail = user?.email || "";
  const facilities = useMemo(() => getAdminFacilities(adminEmail, true), [adminEmail, showAddFacilityModal, showDeleteConfirmModal]);
  const bookings = useMemo(() => getAdminBookings(adminEmail), [adminEmail]);
  const analytics = useMemo(() => getAdminAnalytics(adminEmail), [adminEmail, facilities, bookings]);

  // Handle Registration
  const handleCreateFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) {
      toast.error("Please fill in facility name and address");
      return;
    }

    if (!adminEmail) {
      toast.error("You must be logged in as an Admin to register a facility");
      return;
    }

    const created = registerAdminFacility({
      name,
      city,
      address,
      floors: parseInt(floors) || 2,
      totalSlots: parseInt(totalSlots) || 100,
      carSlots: parseInt(carSlots) || 60,
      bikeSlots: parseInt(bikeSlots) || 35,
      evSlots: parseInt(evSlots) || 5,
      disabledSlots: parseInt(disabledSlots) || 2,
      operatingHours: operatingHours || "24/7 Open",
      pricePerHour: parseFloat(pricePerHour) || 40,
      twoWheelerPricePerHour: parseFloat(twoWheelerPricePerHour) || 20,
      evPricePerHour: parseFloat(evPricePerHour) || 50,
      dailyPrice: parseFloat(dailyPrice) || 300,
      monthlyPassAvailable,
      monthlyPassPrice: monthlyPassAvailable ? parseFloat(monthlyPassPrice) || 4500 : undefined,
      isCovered: true,
    }, adminEmail);

    toast.success(`Facility "${created.name}" registered & published! It is now live in ${created.city}.`);
    setShowAddFacilityModal(false);
    setName("");
    setAddress("");
  };

  // Open Delete Confirmation Modal
  const handlePromptDeleteLot = (lot: ParkingLot) => {
    if (lot.ownerAdminEmail?.toLowerCase() !== adminEmail.toLowerCase()) {
      toast.error("You can only delete parking lots owned by your admin account");
      return;
    }
    setLotToDelete(lot);
    setShowDeleteConfirmModal(true);
  };

  // Confirm Soft-Delete
  const handleConfirmDeleteLot = () => {
    if (!lotToDelete || !adminEmail) return;
    const success = deleteAdminParkingLot(lotToDelete.id, adminEmail);
    if (success) {
      toast.success(`Parking lot "${lotToDelete.name}" deactivated! It will no longer appear in driver search.`);
    } else {
      toast.error("Failed to delete parking lot");
    }
    setShowDeleteConfirmModal(false);
    setLotToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 dark:from-purple-400 to-indigo-600 dark:to-indigo-400 bg-clip-text text-transparent">
                FindMySlot Command Center
              </span>
              <Badge className="ml-2 bg-purple-600 text-white font-mono text-[10px]">
                Parking Admin Portal
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAddFacilityModal(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-1.5 font-bold shadow-md shadow-purple-500/20 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Parking Facility</span>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold">
              <LogOut className="w-4 h-4 mr-1" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Admin Management Hub</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Logged in as <span className="text-purple-600 dark:text-purple-400 font-bold">{user?.name || "Facility Admin"}</span> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {[
              { id: "overview", label: "Overview" },
              { id: "facilities", label: `My Facilities (${facilities.filter(f => f.isActive !== false).length})` },
              { id: "bookings", label: `Bookings (${bookings.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{analytics.totalRevenue}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Calculated from actual confirmed bookings</span>
            </div>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Occupancy Rate</span>
              <Activity className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{analytics.occupancyPercentage}%</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-500 h-full transition-all" style={{ width: `${analytics.occupancyPercentage}%` }} />
            </div>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Available Bays</span>
              <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{analytics.availableSlots}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Out of {analytics.totalCapacity} total capacity</div>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Facilities</span>
              <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{facilities.filter(f => f.isActive !== false).length}</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Managed under this account</div>
          </Card>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {facilities.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Revenue Breakdown */}
                <Card className="lg:col-span-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                        <span>Live Revenue Breakdown</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Dynamic earnings from your registered facilities.</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                      Live Sync
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-bold"><Car className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Car & EV Revenue</span>
                        <span className="text-slate-900 dark:text-white font-bold">₹{analytics.carRevenue}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (analytics.carRevenue / (analytics.totalRevenue || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-bold"><Bike className="w-4 h-4 text-purple-500 dark:text-purple-400" /> Two-Wheeler Revenue</span>
                        <span className="text-slate-900 dark:text-white font-bold">₹{analytics.bikeRevenue}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, (analytics.bikeRevenue / (analytics.totalRevenue || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Registered Facilities Overview */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">My Facilities Overview</h4>
                    <div className="space-y-2">
                      {facilities.map((lot) => {
                        const isInactive = lot.isActive === false || lot.status === "inactive";
                        return (
                          <div key={lot.id} className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                <span>{lot.name}</span>
                                {isInactive && (
                                  <Badge variant="outline" className="border-red-500 text-red-500 dark:text-red-400 text-[10px]">
                                    Inactive / Deactivated
                                  </Badge>
                                )}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400">{lot.city} • {lot.floors} Floors • ₹{lot.pricePerHour}/hr</div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-purple-500/40 text-purple-600 dark:text-purple-400 font-bold">
                                {lot.availableSlots} / {lot.totalSlots} Available
                              </Badge>

                              {!isInactive && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePromptDeleteLot(lot)}
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg p-1.5 h-8"
                                  title="Delete/Deactivate Parking Lot"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Recent Bookings */}
                <Card className="lg:col-span-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    <span>Recent Customer Bookings</span>
                  </h3>

                  {bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.map((b) => (
                        <div key={b.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                            <span>{b.userName}</span>
                            <span className="text-emerald-600 dark:text-emerald-400">₹{b.totalAmount}</span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">{b.parkingLotName}</div>
                          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-900">
                            <span>Slot {b.slotNumber} ({b.vehicleType.toUpperCase()})</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{b.bookingStatus.toUpperCase()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No bookings recorded yet for your facilities.
                    </div>
                  )}
                </Card>

              </div>
            ) : (
              /* Admin Onboarding Empty State */
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl space-y-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto border border-purple-200 dark:border-purple-800">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to FindMySlot Admin Portal</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  You haven't registered a parking facility yet. Register your facility to start receiving user bookings!
                </p>
                <Button
                  onClick={() => setShowAddFacilityModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-purple-500/25 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Parking Facility</span>
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* FACILITIES TAB */}
        {activeTab === "facilities" && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">My Registered Facilities</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Facilities registered here are published to drivers in the User Portal.</p>
              </div>
              <Button
                onClick={() => setShowAddFacilityModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                + Register Parking Facility
              </Button>
            </div>

            {facilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilities.map((lot) => {
                  const isInactive = lot.isActive === false || lot.status === "inactive";
                  return (
                    <div key={lot.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="bg-purple-600/30 text-purple-700 dark:text-purple-300 border border-purple-500/40 text-[10px] mb-1 font-bold">
                            {lot.city}
                          </Badge>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{lot.name}</span>
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{lot.address}</p>
                        </div>
                        {isInactive ? (
                          <Badge variant="outline" className="border-red-500 text-red-500 dark:text-red-400 text-[10px]">
                            Inactive
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePromptDeleteLot(lot)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg p-1.5 h-7"
                            title="Delete / Deactivate Facility"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 block">Total Slots</span>
                          <span className="font-bold text-slate-900 dark:text-white">{lot.totalSlots}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 block">Available</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{lot.availableSlots}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 block">Car Price</span>
                          <span className="font-bold text-slate-900 dark:text-white">₹{lot.pricePerHour}/hr</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 block">Bike Price</span>
                          <span className="font-bold text-slate-900 dark:text-white">₹{lot.twoWheelerPricePerHour}/hr</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No parking facilities registered yet.
              </div>
            )}
          </Card>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bookings Received</h3>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{b.parkingLotName} ({b.city})</div>
                      <div className="text-slate-500 dark:text-slate-400">User: {b.userName} ({b.userEmail}) • Vehicle: {b.vehicleNumber}</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        Date: <span className="font-semibold text-purple-600 dark:text-purple-300">{b.bookingDate || b.createdAt.slice(0, 10)}</span> • Time: <span className="font-bold text-indigo-600 dark:text-indigo-300">{b.startTime} {b.endTime ? `- ${b.endTime}` : ""}</span> • Slot {b.slotNumber} ({b.floorLevel}) • {b.durationHours} Hours
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">₹{b.totalAmount}</div>
                      <Badge variant="outline" className="border-purple-500/40 text-purple-600 dark:text-purple-400 font-bold mt-1">
                        {b.bookingStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No bookings recorded yet for your facilities.
              </div>
            )}
          </Card>
        )}

      </main>

      {/* Delete Confirmation Modal Dialog */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Confirm Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
              Deactivating this parking facility will remove it from driver search while preserving historical bookings.
            </DialogDescription>
          </DialogHeader>

          {lotToDelete && (
            <div className="space-y-4 mt-2">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Facility Name:</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{lotToDelete.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{lotToDelete.address}, {lotToDelete.city}</div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-3 text-xs text-red-700 dark:text-red-300">
                ⚠️ This facility will immediately disappear from driver search and new booking options. All historical revenue and booking records will remain safely intact.
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="w-1/2 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmDeleteLot}
                  className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg"
                >
                  Delete Parking Lot
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Facility Registration Modal */}
      <Dialog open={showAddFacilityModal} onOpenChange={setShowAddFacilityModal}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              <span>Register New Parking Facility</span>
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
              Fill in your facility details. Registered parking lots immediately publish to driver search.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateFacility} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">Facility Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Metro Hub Smart Deck"
                  required
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">City Location *</Label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm p-2.5 font-bold text-slate-900 dark:text-white outline-none"
                >
                  {PREDEFINED_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-700 dark:text-slate-300">Full Address *</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Block C, Main Commercial Road"
                required
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">Floors</Label>
                <Input
                  type="number"
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">Total Slots</Label>
                <Input
                  type="number"
                  value={totalSlots}
                  onChange={(e) => setTotalSlots(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">Car Slots</Label>
                <Input
                  type="number"
                  value={carSlots}
                  onChange={(e) => setCarSlots(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">Bike Slots</Label>
                <Input
                  type="number"
                  value={bikeSlots}
                  onChange={(e) => setBikeSlots(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">EV Slots</Label>
                <Input
                  type="number"
                  value={evSlots}
                  onChange={(e) => setEvSlots(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">Disabled Slots</Label>
                <Input
                  type="number"
                  value={disabledSlots}
                  onChange={(e) => setDisabledSlots(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">Car Price (₹/hr)</Label>
                <Input
                  type="number"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 dark:text-slate-300">Bike Price (₹/hr)</Label>
                <Input
                  type="number"
                  value={twoWheelerPricePerHour}
                  onChange={(e) => setTwoWheelerPricePerHour(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl mt-1 text-sm font-bold text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2">
              Register & Publish Facility
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
