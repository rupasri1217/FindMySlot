import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import HistoryPage from "./pages/HistoryPage";
import AdminDashboard from "./pages/AdminDashboard";
import ExtendCancelPage from "./pages/ExtendCancelPage";
import FeedbackPage from "./pages/FeedbackPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import ActiveSessionPage from "./pages/ActiveSessionPage";
import SavedPlacesPage from "./pages/SavedPlacesPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import SettingsPage from "./pages/SettingsPage";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

// User Guard Component
function UserRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Redirect to="/" />;
  }

  if (user.role === "admin") {
    return <Redirect to="/admin" />;
  }

  return <Component />;
}

// Admin Guard Component
function AdminRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Redirect to="/" />;
  }

  if (user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Landing & Map Exploration */}
      <Route path={"/"} component={Home} />
      <Route path={"/home"} component={Home} />
      <Route path={"/map"} component={MapView} />

      {/* Admin Route Guard */}
      <Route path={"/admin"}>
        {() => <AdminRoute component={AdminDashboard} />}
      </Route>

      {/* Protected User Routes */}
      <Route path={"/dashboard"}>
        {() => <UserRoute component={Dashboard} />}
      </Route>
      <Route path={"/booking/:slotId"}>
        {() => <UserRoute component={BookingPage} />}
      </Route>
      <Route path={"/payment/:bookingId"}>
        {() => <UserRoute component={PaymentPage} />}
      </Route>
      <Route path={"/history"}>
        {() => <UserRoute component={HistoryPage} />}
      </Route>
      <Route path={"/saved-places"}>
        {() => <UserRoute component={SavedPlacesPage} />}
      </Route>
      <Route path={"/settings"}>
        {() => <UserRoute component={SettingsPage} />}
      </Route>
      <Route path={"/profile"}>
        {() => <UserRoute component={SettingsPage} />}
      </Route>
      <Route path={"/active-session"}>
        {() => <UserRoute component={ActiveSessionPage} />}
      </Route>
      <Route path={"/extend-cancel"}>
        {() => <UserRoute component={ExtendCancelPage} />}
      </Route>
      <Route path={"/feedback"}>
        {() => <UserRoute component={FeedbackPage} />}
      </Route>
      <Route path={"/help"}>
        {() => <UserRoute component={HelpSupportPage} />}
      </Route>

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
