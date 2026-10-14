import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, LogOut, Bell, Lock, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+91 98765 43210",
    vehicle: "Toyota Fortuner",
    vehicleNumber: "DL01AB1234",
  });

  if (!user) {
    navigate("/");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "payment", label: "Payment Methods", icon: "💳" },
    { id: "security", label: "Security", icon: "🔒" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* User Info Card */}
            <Card className="p-6 bg-white border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Vehicle Info Card */}
            <Card className="p-6 bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                  <Input
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                  <Input
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSaveProfile}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex-1 py-3 font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: "Booking Confirmations", description: "Receive confirmation when you book a parking spot" },
                { label: "Reminders", description: "Get reminders 15 minutes before your booking expires" },
                { label: "Promotional Offers", description: "Receive special offers and discounts" },
                { label: "Overstay Alerts", description: "Alert when you're about to exceed parking time" },
                { label: "Payment Receipts", description: "Receive payment confirmation emails" },
              ].map((notif, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{notif.label}</p>
                    <p className="text-sm text-gray-600">{notif.description}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Payment Methods Tab */}
        {activeTab === "payment" && (
          <div className="space-y-6">
            <Card className="p-6 bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Payment Methods</h2>
              <div className="space-y-3">
                {[
                  { type: "Credit Card", last4: "4242", expiry: "12/25" },
                  { type: "Debit Card", last4: "5555", expiry: "08/26" },
                  { type: "UPI", last4: "user@okhdfcbank", expiry: "Active" },
                ].map((method, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{method.type}</p>
                      <p className="text-sm text-gray-600">
                        {method.type === "UPI" ? method.last4 : `•••• ${method.last4}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{method.expiry}</p>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
                <CreditCard className="w-5 h-5 mr-2" />
                Add New Payment Method
              </Button>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <Card className="p-6 bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
            <div className="space-y-4">
              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
                <p className="text-sm text-gray-600 mb-4">Update your password regularly to keep your account secure</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                <Button variant="outline" className="py-2 px-4 rounded-lg">
                  Enable 2FA
                </Button>
              </div>
              <div className="p-4 border-2 border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Active Sessions</h3>
                <p className="text-sm text-gray-600 mb-4">Manage your active login sessions</p>
                <Button variant="outline" className="py-2 px-4 rounded-lg">
                  View Sessions
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
