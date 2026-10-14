import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, LogOut, ArrowLeft, Download } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function HistoryPage() {
  const { logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: bookings } = trpc.bookings.list.useQuery();
  const { data: payments } = trpc.payments.list.useQuery();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "active":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h2 className="text-3xl font-bold text-gray-900 mb-8">History & Records</h2>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookings">Bookings ({bookings?.length || 0})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({payments?.length || 0})</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <div className="space-y-4">
              {bookings && bookings.length > 0 ? (
                bookings.map((booking: any) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Booking #{booking.id}</CardTitle>
                          <CardDescription>
                            {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {booking.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Booking ID</p>
                          <p className="font-semibold">#{booking.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Slot ID</p>
                          <p className="font-semibold">#{booking.slotId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold">₹{booking.totalPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Booked On</p>
                          <p className="font-semibold text-xs">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-sm">{booking.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">No booking history found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <div className="space-y-4">
              {payments && payments.length > 0 ? (
                payments.map((payment: any) => (
                  <Card key={payment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Transaction #{payment.transactionId}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(payment.createdAt)}
                          </CardDescription>
                        </div>
                        <Badge className={getPaymentStatusColor(payment.status)}>
                          {payment.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Booking ID</p>
                          <p className="font-semibold">#{payment.bookingId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold text-lg text-blue-600">
                            ₹{payment.amount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Method</p>
                          <p className="font-semibold capitalize">
                            {payment.paymentMethod.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold">{payment.status}</p>
                        </div>
                      </div>
                      {payment.refundAmount > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-gray-600">Refund Amount</p>
                          <p className="font-semibold text-blue-600">
                            ₹{payment.refundAmount}
                          </p>
                          {payment.refundReason && (
                            <p className="text-xs text-gray-600 mt-1">
                              Reason: {payment.refundReason}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">No payment history found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Export Records</CardTitle>
            <CardDescription>Download your booking and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export as PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export as CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
