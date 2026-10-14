import { useState } from "react";
import { useAuth, UserRole } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  CreditCard, 
  ArrowRight, 
  Building2, 
  Users, 
  Sparkles, 
  Bike, 
  Car, 
  Zap, 
  Footprints, 
  ShieldCheck, 
  Navigation,
  Search,
  CheckCircle2,
  PhoneCall,
  Mail,
  ChevronDown
} from "lucide-react";
import { useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const [destination, setDestination] = useState("");
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [selectedCategory, setSelectedCategory] = useState<"car" | "motorcycle" | "scooter" | "ev">("car");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<UserRole>("user");

  const cities = ["Hyderabad", "Bengaluru", "Chennai", "Mumbai", "Delhi"];

  const handleOpenAuth = (role: UserRole = "user") => {
    setAuthDefaultRole(role);
    setIsAuthModalOpen(true);
  };

  const handleExploreMap = () => {
    let url = `/map?city=${encodeURIComponent(selectedCity)}&type=${selectedCategory}`;
    if (destination.trim()) {
      url += `&dest=${encodeURIComponent(destination)}`;
    }
    navigate(url);
    toast.success(`Exploring parking facilities in ${selectedCity}`);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for contacting FindMySlot! Our mobility team will respond shortly.");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultRole={authDefaultRole}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FindMySlot
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] py-0 px-2 border-blue-500/40 text-blue-600 font-semibold">
              Smart Platform
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#hero" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Search</a>
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#cities" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cities</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate(user?.role === "admin" ? "/admin" : "/dashboard")}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  {user?.role === "admin" ? "Admin Dashboard" : "Dashboard"}
                </Button>
                <Button
                  onClick={() => navigate(user?.role === "admin" ? "/admin" : "/settings")}
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  Profile
                </Button>
                <Button
                  onClick={logout}
                  size="sm"
                  variant="ghost"
                  className="rounded-xl text-slate-500 hover:text-red-500 text-xs font-semibold"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleOpenAuth("user")}
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleOpenAuth("user")}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-10">
          <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 mb-4 inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Next-Gen Smart Urban Mobility</span>
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
            Don't search for parking. <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Start with your destination.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            FindMySlot intelligently recommends optimal parking based on where you're going, supports motorcycles, cars & EVs equally, and guides you door-to-slot with last-mile transit.
          </p>
        </div>

        {/* Hero Destination Bar Simulator */}
        <div className="max-w-4xl mx-auto glass-card rounded-2xl p-4 md:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 mb-16">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-500" />
              <span>Where are you going?</span>
            </span>

            {/* City Dropdown Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
            <div className="md:col-span-8 relative">
              <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-blue-500" />
              <input
                type="text"
                placeholder="Enter destination (e.g. Cyber City, Central Mall, Metro Station)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shadow-inner"
              />
            </div>

            <Button
              onClick={handleExploreMap}
              className="md:col-span-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Explore Parking Map</span>
            </Button>
          </div>

          {/* Vehicle Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-semibold mr-1">Mode:</span>
            {[
              { id: "car", label: "Car", icon: Car, rate: "Standard Rate" },
              { id: "motorcycle", label: "Motorcycle", icon: Bike, rate: "Economy Rate" },
              { id: "scooter", label: "Scooter", icon: Bike, rate: "Economy Rate" },
              { id: "ev", label: "EV Car", icon: Zap, rate: "Fast Charger" },
            ].map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedCategory(item.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: "Partner Parking Lots", value: "25+ Facilities", icon: Building2, color: "text-blue-500" },
            { label: "Supported Cities", value: "5 Major Hubs", icon: MapPin, color: "text-indigo-500" },
            { label: "Supported Vehicles", value: "Cars, Bikes, EVs", icon: Car, color: "text-purple-500" },
            { label: "Live Availability", value: "Real-time Tracking", icon: Clock, color: "text-emerald-500" },
          ].map((stat, i) => {
            const IconComp = stat.icon;
            return (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
                <IconComp className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-base font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-slate-100/60 dark:bg-slate-900/60 py-20 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold px-3 py-1 rounded-full mb-3 border border-purple-200 dark:border-purple-800">
              Why FindMySlot V2?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Built for Modern Smart Cities
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm md:text-base">
              A comprehensive mobility ecosystem connecting drivers, two-wheeler commuters, and parking lot administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Destination-First AI Search",
                desc: "Instead of searching for random parking, enter where you're going. We rank nearby facilities by walking distance, pricing, and safety.",
                icon: MapPin,
                badge: "AI Recommendations",
              },
              {
                title: "Two-Wheeler & Four-Wheeler Equality",
                desc: "Dedicated slots and customized hourly rates for motorcycles, scooters, standard cars, and EV charging bays.",
                icon: Bike,
                badge: "Multi-Modal",
              },
              {
                title: "Door-to-Slot Navigation",
                desc: "Turn-by-turn guidance from your current location to the parking gate, down to the exact floor level and slot ID.",
                icon: Navigation,
                badge: "Turn Guidance",
              },
              {
                title: "Last-Mile Transit Assistant",
                desc: "Seamlessly transition from parked car to walking, Rapido bike taxi, Uber, or Ola for your final destination leg.",
                icon: Footprints,
                badge: "Signature V2",
              },
              {
                title: "Dynamic Admin Analytics",
                desc: "Facility managers register parking spaces, monitor live occupancy meters, and view dynamic revenue reports based on real bookings.",
                icon: Building2,
                badge: "Admin Portal",
              },
              {
                title: "Digital QR Ticket Pass",
                desc: "Instant digital pass generation with QR code for quick gate scan-in, contactless payment, and active session countdown.",
                icon: ShieldCheck,
                badge: "Instant Pass",
              },
            ].map((feature, idx) => {
              const IconComp = feature.icon;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-600 font-bold">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section id="cities" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1 rounded-full mb-3 border border-emerald-200 dark:border-emerald-800">
            Active Smart Cities
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            Available in 5 Major Metros
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
            Explore 5 predefined facilities per city with live slot tracking and instant reservation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Hyderabad", count: "5 Facilities", tagline: "Gachibowli, Hitec City, Banjara Hills" },
            { name: "Bengaluru", count: "5 Facilities", tagline: "MG Road, Indiranagar, Koramangala" },
            { name: "Chennai", count: "5 Facilities", tagline: "T Nagar, Anna Nagar, OMR Corridor" },
            { name: "Mumbai", count: "5 Facilities", tagline: "BKC, Lower Parel, Andheri East" },
            { name: "Delhi", count: "5 Facilities", tagline: "Connaught Place, Cyber City, Aerocity" },
          ].map((c, i) => (
            <div
              key={i}
              onClick={() => {
                setSelectedCity(c.name);
                navigate(`/map?city=${c.name}`);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group text-center"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{c.name}</h3>
              <Badge variant="secondary" className="text-[10px] mt-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {c.count}
              </Badge>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">{c.tagline}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-100/60 dark:bg-slate-900/60 py-20 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-3 py-1 rounded-full mb-3 border border-indigo-200 dark:border-indigo-800">
              Simple 4-Step Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              How FindMySlot Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Select Destination", desc: "Enter your destination and vehicle type to discover nearby optimal parking lots." },
              { step: "02", title: "Compare & Pick Slot", desc: "View AI recommendations or blueprint floor layout to select your preferred slot." },
              { step: "03", title: "Instant QR Pass", desc: "Confirm booking and receive your digital QR entry pass with clear turn navigation." },
              { step: "04", title: "Last-Mile Connect", desc: "Seamlessly transition to your final destination using walking routes or bike taxis." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative">
                <span className="text-3xl font-extrabold text-blue-600/30 dark:text-blue-400/30 absolute top-4 right-4">
                  {item.step}
                </span>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm mb-4">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Support Section */}
      <section id="contact" className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 space-y-6">
            <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              Get in Touch
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Have Questions or Want to Partner as a Parking Admin?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              Our mobility specialists are ready to help facility owners register commercial lots, setup automated gates, or assist drivers with slot reservations.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                <div className="bg-blue-100 dark:bg-blue-950 text-blue-600 p-2 rounded-xl">
                  <Mail className="w-4 h-4" />
                </div>
                <span>support@findmyslot.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
                <div className="bg-blue-100 dark:bg-blue-950 text-blue-600 p-2 rounded-xl">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span>+91 1800-PARK-SLOT (24/7 Helpline)</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 glass-card rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Send Us a Message</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Full Name</label>
                <input type="text" required placeholder="John Doe" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Email Address</label>
                <input type="email" required placeholder="john@example.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Message</label>
                <textarea required rows={3} placeholder="How can we help you?" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm resize-none"></textarea>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">FindMySlot</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Parking & Urban Mobility Platform empowering drivers with destination-first AI recommendations and last-mile transit.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#hero" className="hover:text-white transition-colors">Search Parking</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#cities" className="hover:text-white transition-colors">Active Cities</a></li>
              <li><button onClick={() => handleOpenAuth("admin")} className="hover:text-white transition-colors">Admin Partner Portal</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Cities</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => navigate("/map?city=Hyderabad")} className="hover:text-white">Hyderabad</button></li>
              <li><button onClick={() => navigate("/map?city=Bengaluru")} className="hover:text-white">Bengaluru</button></li>
              <li><button onClick={() => navigate("/map?city=Chennai")} className="hover:text-white">Chennai</button></li>
              <li><button onClick={() => navigate("/map?city=Mumbai")} className="hover:text-white">Mumbai</button></li>
              <li><button onClick={() => navigate("/map?city=Delhi")} className="hover:text-white">Delhi</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Contact & Support</h4>
            <p className="text-xs text-slate-400 mb-2">Helpdesk: support@findmyslot.com</p>
            <p className="text-xs text-slate-400 mb-4">Helpline: +91 1800-PARK-SLOT</p>
            <Button
              onClick={() => handleOpenAuth("user")}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold w-full"
            >
              Sign In to Book
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FindMySlot V2 Smart Mobility Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
