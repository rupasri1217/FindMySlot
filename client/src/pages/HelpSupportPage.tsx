import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, MessageSquare, PhoneCall, ShieldCheck, Zap, Bike, Footprints } from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HelpSupportPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/map")} className="rounded-xl gap-1 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Map</span>
          </Button>

          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <h1 className="text-lg font-bold">Help & Support</h1>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Frequently Asked Questions (V2)</CardTitle>
            <CardDescription className="text-xs">Learn how FindMySlot Smart Mobility works</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-semibold">
                  How does Destination-First parking search work?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-500">
                  Instead of listing generic parking lots, FindMySlot asks "Where are you going?". It calculates walking distance, driving route, price, and security score to rank the best parking spot for your final destination.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-semibold">
                  Are motorcycles & scooters supported with different rates?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-500">
                  Yes! Select Motorcycle or Scooter under vehicle category to filter bike-friendly slots, helmet lockers, and specialized two-wheeler rates (e.g. ₹20/hr).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-semibold">
                  What is the Last-Mile Assistant?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-500">
                  After parking, if your destination is a distance away, the Last-Mile Assistant suggests walking, Rapido, Uber, or Ola with estimated fares and ETA.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">24/7 Live Support Chat</h4>
              <p className="text-xs text-slate-500">Instant AI Assistant help</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Emergency Parking Helpline</h4>
              <p className="text-xs text-slate-500">1800-FIND-SLOT (Toll Free)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
