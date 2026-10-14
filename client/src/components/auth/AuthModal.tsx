import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, UserRole } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { User, ShieldCheck, Mail, ArrowRight, Sparkles } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}

export function AuthModal({ isOpen, onClose, defaultRole = "user" }: AuthModalProps) {
  const { loginAs } = useAuth();
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    loginAs(email, role, name);
    toast.success(`Logged in successfully as ${role === "admin" ? "Parking Lot Admin" : "User"}`);
    onClose();
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    const demoEmail = demoRole === "admin" ? "admin@findmyslot.com" : "user@findmyslot.com";
    const demoName = demoRole === "admin" ? "City Parking Admin" : "Alex Johnson";
    loginAs(demoEmail, demoRole, demoName);
    toast.success(`Demo ${demoRole === "admin" ? "Admin" : "User"} session started`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-2xl flex items-center justify-center">
            {role === "admin" ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome to FindMySlot
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to access AI parking recommendations, bookings, and mobility management.
          </DialogDescription>
        </DialogHeader>

        {/* Role Selector Tabs */}
        <div className="mt-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
            Select Your Role
          </Label>
          <Tabs value={role} onValueChange={(val) => setRole(val as UserRole)} className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <TabsTrigger
                value="user"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 rounded-lg text-sm font-semibold py-2 transition-all flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Driver / User</span>
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600 rounded-lg text-sm font-semibold py-2 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Parking Admin</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="auth-name-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name (Optional)
            </Label>
            <Input
              id="auth-name-input"
              type="text"
              placeholder={role === "admin" ? "e.g. Metro Lot Admin" : "e.g. Alex Johnson"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-email-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                id="auth-email-input"
                type="email"
                placeholder={role === "admin" ? "admin@findmyslot.com" : "user@findmyslot.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
            <span>Continue as {role === "admin" ? "Parking Admin" : "User"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">
              Or Try Demo Access
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleQuickDemo("user")}
            className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 py-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Demo User</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleQuickDemo("admin")}
            className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 py-2"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>Demo Admin</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
