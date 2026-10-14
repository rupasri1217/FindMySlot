import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, LogIn, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// Dummy user accounts for demo
const DUMMY_ACCOUNTS = {
  user: [
    { username: "user1", password: "password123", name: "John Doe", email: "john@example.com" },
    { username: "user2", password: "password123", name: "Jane Smith", email: "jane@example.com" },
    { username: "demo_user", password: "demo123", name: "Demo User", email: "demo@example.com" },
  ],
  admin: [
    { username: "rupa", password: "admin123", name: "Rupa Devarapalli", email: "rupasri7842@gmail.com" },
    { username: "admin", password: "admin123", name: "Admin User", email: "admin@example.com" },
  ],
};

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [role, setRole] = useState<"user" | "admin">("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check credentials against dummy accounts
      const accounts = DUMMY_ACCOUNTS[role];
      const user = accounts.find((acc) => acc.username === username && acc.password === password);

      if (user) {
        // Store user info in localStorage for demo
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: Math.random(),
            name: user.name,
            email: user.email,
            username: user.username,
            role: role,
          })
        );

        toast.success(`Welcome back, ${user.name}!`);

        // Redirect to appropriate dashboard
        setTimeout(() => {
          if (role === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    const url = getLoginUrl();
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">FindMySlot</span>
          </div>
          <p className="text-gray-600">Smart Parking Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selector */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Login as</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                    role === "user"
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                  }`}
                >
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                    role === "admin"
                      ? "border-purple-500 bg-purple-50 text-purple-900"
                      : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-gray-50"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            {/* Demo Credentials Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-900 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-blue-800">
                <p>
                  <strong>User:</strong> user1 / password123
                </p>
                <p>
                  <strong>Admin:</strong> rupa / admin123
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* OAuth Login */}
            <Button
              type="button"
              onClick={handleOAuthLogin}
              variant="outline"
              className="w-full py-3 rounded-lg font-semibold border-2 hover:bg-gray-50"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Login with Manus OAuth
            </Button>

            {/* Back to Home */}
            <Button
              type="button"
              onClick={() => navigate("/")}
              variant="ghost"
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          This is a demo application. Use the provided credentials to login.
        </p>
      </div>
    </div>
  );
}
