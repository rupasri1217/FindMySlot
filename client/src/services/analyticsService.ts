import { BookingRecord } from "../data/mockParkingData";
import { getAdminFacilities } from "./parkingService";
import { getAdminBookings } from "./bookingService";

export interface AdminAnalyticsSummary {
  totalRevenue: number;
  todaysRevenue: number;
  carRevenue: number;
  bikeRevenue: number;
  totalFacilities: number;
  totalCapacity: number;
  availableSlots: number;
  reservedSlots: number;
  occupancyPercentage: number;
  totalBookingsCount: number;
  activeBookingsCount: number;
  cancelledBookingsCount: number;
  recentBookings: BookingRecord[];
}

/**
 * Calculates dynamic analytics for a specific admin account based strictly on confirmed bookings and registered facilities.
 * Returns 0 values for a new admin.
 */
export function getAdminAnalytics(adminEmail?: string): AdminAnalyticsSummary {
  if (!adminEmail) {
    return {
      totalRevenue: 0,
      todaysRevenue: 0,
      carRevenue: 0,
      bikeRevenue: 0,
      totalFacilities: 0,
      totalCapacity: 0,
      availableSlots: 0,
      reservedSlots: 0,
      occupancyPercentage: 0,
      totalBookingsCount: 0,
      activeBookingsCount: 0,
      cancelledBookingsCount: 0,
      recentBookings: [],
    };
  }

  const facilities = getAdminFacilities(adminEmail);
  const bookings = getAdminBookings(adminEmail);

  // Facility Capacity Metrics
  const totalCapacity = facilities.reduce((acc, f) => acc + f.totalSlots, 0);
  const availableSlots = facilities.reduce((acc, f) => acc + f.availableSlots, 0);
  const reservedSlots = Math.max(0, totalCapacity - availableSlots);
  const occupancyPercentage = totalCapacity > 0 ? Math.round((reservedSlots / totalCapacity) * 100) : 0;

  // Booking Revenue Metrics (Exclude cancelled bookings)
  const validBookings = bookings.filter(b => b.bookingStatus !== "cancelled");
  const totalRevenue = validBookings.reduce((acc, b) => acc + b.totalAmount, 0);

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysRevenue = validBookings
    .filter(b => b.createdAt.startsWith(todayStr))
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const carRevenue = validBookings
    .filter(b => b.vehicleType === "car" || b.vehicleType === "ev")
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const bikeRevenue = validBookings
    .filter(b => b.vehicleType === "motorcycle" || b.vehicleType === "scooter")
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const activeBookingsCount = bookings.filter(b => b.bookingStatus === "active").length;
  const cancelledBookingsCount = bookings.filter(b => b.bookingStatus === "cancelled").length;

  return {
    totalRevenue,
    todaysRevenue,
    carRevenue,
    bikeRevenue,
    totalFacilities: facilities.length,
    totalCapacity,
    availableSlots,
    reservedSlots,
    occupancyPercentage,
    totalBookingsCount: bookings.length,
    activeBookingsCount,
    cancelledBookingsCount,
    recentBookings: bookings.slice(0, 5),
  };
}
