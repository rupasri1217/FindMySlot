import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, LogOut, ArrowLeft, CheckCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function PaymentPage() {
  const { logout } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/payment/:bookingId");
  const bookingId = params?.bookingId ? parseInt(params.bookingId) : 0;

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { data: booking } = trpc.bookings.getById.useQuery({ id: bookingId });
  const { data: lot } = trpc.parkingLots.getById.useQuery(
    { id: booking?.lotId || 0 },
    { enabled: !!booking }
  );
  const createPaymentMutation = trpc.payments.create.useMutation();

  const handlePayment = async () => {
    if (!booking) {
      toast.error("Booking not found");
      return;
    }

    setIsProcessing(true);
    try {
      await createPaymentMutation.mutateAsync({
        bookingId,
        amount: parseFloat(booking.totalPrice.toString()),
        paymentMethod: paymentMethod as any,
      });
      setPaymentSuccess(true);
      toast.success("Payment successful!");
      setTimeout(() => navigate("/active-session"), 2000);
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold">FindMySlot</h1>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-8">
              Your parking booking has been confirmed. You will be redirected to your dashboard shortly.
            </p>
            <Button onClick={() => navigate("/active-session")} className="bg-blue-600 hover:bg-blue-700 text-white">
              Start Parking Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">FindMySlot</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h2 className="text-3xl font-bold text-gray-900 mb-8">Complete Payment</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details */}
            {booking && lot && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Parking Lot</p>
                      <p className="font-semibold">{lot.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Booking ID</p>
                      <p className="font-semibold">#{booking.id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Start Time</p>
                      <p className="font-semibold">
                        {new Date(booking.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Time</p>
                      <p className="font-semibold">
                        {new Date(booking.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge
                        className={
                          booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-semibold">UPI</p>
                          <p className="text-sm text-gray-600">Pay using UPI</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-semibold">Credit Card</p>
                          <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="debit_card" id="debit_card" />
                      <Label htmlFor="debit_card" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-semibold">Debit Card</p>
                          <p className="text-sm text-gray-600">Bank debit card</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-semibold">Digital Wallet</p>
                          <p className="text-sm text-gray-600">Google Pay, Apple Pay</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>✓ Secure payment processing with encryption</p>
                <p>✓ Instant payment confirmation</p>
                <p>✓ Automatic refund for cancellations within 2 hours</p>
                <p>✓ 24/7 customer support</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Booking Amount</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{booking.totalPrice}
                      </p>
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Parking Fee</span>
                        <span className="font-semibold">₹{booking.totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes</span>
                        <span className="font-semibold">₹0</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-semibold text-green-600">₹0</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{booking.totalPrice}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <Button
                  className="w-full mt-6"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Pay Now"}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  By clicking Pay Now, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
