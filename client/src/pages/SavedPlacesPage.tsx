import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Bookmark, 
  MapPin, 
  Trash2, 
  ArrowLeft, 
  Edit2,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUserSavedPlaces, updateUserSavedCustomName, removeUserSavedPlace } from "@/services/storageService";
import { getAllParkingLots } from "@/services/parkingService";
import { toast } from "sonner";

export default function SavedPlacesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [savedPlaces, setSavedPlaces] = useState(() => getUserSavedPlaces(user?.email));
  const [editingPlace, setEditingPlace] = useState<{ id: string; customName: string } | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCustomName, setEditCustomName] = useState("");

  const allLots = useMemo(() => getAllParkingLots(true), []);

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
        availableSlots: lot?.availableSlots || 0,
      };
    });
  }, [savedPlaces, allLots]);

  const handleOpenEdit = (sp: { id: string; customName: string }) => {
    setEditingPlace(sp);
    setEditCustomName(sp.customName);
    setEditModalOpen(true);
  };

  const handleSaveCustomName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !editingPlace) return;
    const updated = updateUserSavedCustomName(user.email, editingPlace.id, editCustomName);
    setSavedPlaces(updated);
    toast.success("Custom saved label updated!");
    setEditModalOpen(false);
  };

  const handleRemove = (savedId: string, customName: string) => {
    if (!user?.email) return;
    const updated = removeUserSavedPlace(user.email, savedId);
    setSavedPlaces(updated);
    toast.success(`Removed "${customName}" from saved places`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/map")} className="rounded-xl gap-1 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Map</span>
          </Button>

          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-500 fill-emerald-500" />
            <h1 className="text-lg font-bold">Saved Places Manager</h1>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl space-y-6 p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                <span>Your Saved Parking Facilities</span>
              </span>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 font-bold">
                {resolvedSavedPlaces.length} Saved
              </Badge>
            </CardTitle>
            <CardDescription>
              Each saved place uses parkingLotId as authoritative reference while keeping your custom label personal.
            </CardDescription>
          </CardHeader>

          {resolvedSavedPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resolvedSavedPlaces.map((sp) => (
                <div
                  key={sp.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-3 transition-all ${
                    sp.isInactive
                      ? "border-red-200 dark:border-red-950/60 opacity-80"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">
                          {sp.customName}
                        </h4>
                        <button
                          onClick={() => handleOpenEdit({ id: sp.id, customName: sp.customName })}
                          title="Rename custom label"
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        Facility: <span className="font-semibold text-slate-700 dark:text-slate-300">{sp.originalName}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{sp.address}, {sp.city}</span>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(sp.id, sp.customName)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg p-1.5 h-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {sp.isInactive ? (
                    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-2.5 text-xs text-red-600 dark:text-red-300 flex items-center gap-2 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Facility is inactive/unavailable. Booking is disabled.</span>
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
              You haven't saved any parking lots yet. Bookmark lots on the map to view them here.
            </div>
          )}
        </Card>
      </main>

      {/* Edit Custom Name Dialog */}
      <Dialog open={editCustomName !== "" && editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Edit Custom Label
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCustomName} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Custom Name (Personal Label)
              </Label>
              <Input
                value={editCustomName}
                onChange={(e) => setEditCustomName(e.target.value)}
                className="rounded-xl mt-1 font-medium"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl">
              Update Custom Label
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
