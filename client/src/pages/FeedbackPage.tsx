import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, ArrowLeft, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function FeedbackPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    navigate("/");
    return null;
  }

  const booking = {
    id: "BK001",
    location: "Downtown Plaza Parking",
    slotNumber: "A12",
    date: "March 28, 2026",
    duration: "2 hours",
    cost: "₹100",
  };

  const feedbackCategories = [
    { label: "Cleanliness", icon: "🧹" },
    { label: "Safety", icon: "🔒" },
    { label: "Accessibility", icon: "♿" },
    { label: "Amenities", icon: "⭐" },
    { label: "Pricing", icon: "💰" },
    { label: "Customer Service", icon: "👥" },
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitted(true);
    toast.success("Thank you for your feedback!");
    setTimeout(() => navigate("/dashboard"), 3000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">Your feedback helps us improve our service</p>
          </div>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Share Your Feedback</h1>
        <p className="text-gray-600 mt-2">Help us improve your parking experience</p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Booking Summary */}
        <Card className="p-6 bg-white border-2 border-blue-200">
          <h3 className="font-bold text-gray-900 mb-4">Booking Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-semibold text-gray-900">{booking.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Slot</p>
              <p className="font-semibold text-gray-900">{booking.slotNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-gray-900">{booking.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold text-gray-900">{booking.duration}</p>
            </div>
          </div>
        </Card>

        {/* Rating Section */}
        <Card className="p-6 bg-white">
          <h3 className="font-bold text-gray-900 mb-4">How would you rate your experience?</h3>
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {rating === 0
                ? "Select a rating"
                : ["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1]}
            </p>
          </div>
        </Card>

        {/* Feedback Categories */}
        <Card className="p-6 bg-white">
          <h3 className="font-bold text-gray-900 mb-4">What did you like? (Optional)</h3>
          <div className="grid grid-cols-2 gap-3">
            {feedbackCategories.map((category) => (
              <button
                key={category.label}
                onClick={() => toggleCategory(category.label)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedCategories.includes(category.label)
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
              >
                <span className="text-xl mr-2">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="p-6 bg-white">
          <h3 className="font-bold text-gray-900 mb-4">Additional Comments (Optional)</h3>
          <Textarea
            placeholder="Share your thoughts, suggestions, or concerns..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-32 p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-2">{comment.length}/500 characters</p>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-lg"
        >
          Submit Feedback
        </Button>

        {/* Skip Option */}
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="w-full py-3"
        >
          Skip for Now
        </Button>
      </div>
    </div>
  );
}
