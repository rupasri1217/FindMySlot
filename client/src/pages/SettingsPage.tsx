import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, User, Bell, Shield, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [overstayAlerts, setOverstayAlerts] = useState(true);
  const [lastMilePrompt, setLastMilePrompt] = useState(true);
  const [anprAutoOpen, setAnprAutoOpen] = useState(true);

  const handleSave = () => {
    toast.success("Settings saved successfully!");
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
            <Settings className="w-5 h-5 text-blue-500" />
            <h1 className="text-lg font-bold">Platform Settings</h1>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>User Profile Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Full Name:</Label>
                <Input value={user?.name || "Rupa Sri"} readOnly className="rounded-xl mt-1" />
              </div>
              <div>
                <Label>Email:</Label>
                <Input value={user?.email || "rupasri7842@gmail.com"} readOnly className="rounded-xl mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Ready Preferences */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>V2 Smart Mobility Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <div>
                <h4 className="font-semibold text-sm">Overstay Notification Alerts</h4>
                <p className="text-xs text-slate-500">Get alerted 15 mins before booking expires</p>
              </div>
              <Switch checked={overstayAlerts} onCheckedChange={setOverstayAlerts} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <div>
                <h4 className="font-semibold text-sm">Auto Prompt Last-Mile Assistant</h4>
                <p className="text-xs text-slate-500">Prompt Rapido/Uber when destination is &gt;300m walk</p>
              </div>
              <Switch checked={lastMilePrompt} onCheckedChange={setLastMilePrompt} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60">
              <div>
                <h4 className="font-semibold text-sm">ANPR Automatic Barrier Access</h4>
                <p className="text-xs text-slate-500">Allow automatic gate opening via license plate camera</p>
              </div>
              <Switch checked={anprAutoOpen} onCheckedChange={setAnprAutoOpen} />
            </div>

            <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3">
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
