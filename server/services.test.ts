import { describe, it, expect, beforeEach } from "vitest";

// In-Memory localStorage Polyfill for Node Vitest environment
if (typeof globalThis.localStorage === "undefined" || !globalThis.localStorage) {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

import { 
  registerOrLoginAccount, 
  getUserSelectedCity, 
  getUserSavedPlaces, 
  saveUserParkingLot, 
  updateUserSavedCustomName, 
  removeUserSavedPlace 
} from "../client/src/services/storageService";

import { 
  getAllParkingLots, 
  getParkingLotsByCityAndCategory, 
  getAdminFacilities, 
  registerAdminFacility, 
  deleteAdminParkingLot,
  calculateHaversineDistanceKm
} from "../client/src/services/parkingService";

import { 
  createTemporaryHold, 
  releaseTemporaryHold, 
  confirmBookingAndPayment, 
  cancelUserBooking, 
  getUserBookings, 
  getAdminBookings,
  validateBookingPeriod,
  isSlotAvailableForTimePeriod,
  getOccupiedSlotsForTimePeriod
} from "../client/src/services/bookingService";

import { getAdminAnalytics } from "../client/src/services/analyticsService";

describe("Services Architecture, Haversine Search & Date/Time Booking Tests", () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it("1. Account Registration & Data Isolation: New user starts clean", () => {
    const user1 = registerOrLoginAccount("user1@example.com", "user", "User One");
    expect(user1.email).toBe("user1@example.com");
    expect(user1.role).toBe("user");
    expect(getUserBookings(user1.email)).toEqual([]);
    expect(getUserSavedPlaces(user1.email)).toEqual([]);
    expect(getUserSelectedCity(user1.email)).toBeNull();
  });

  it("2. Universal Admin Soft-Deletion & Ownership Guard", () => {
    const adminA = "adminA@facility.com";
    const adminB = "adminB@facility.com";

    const facA = registerAdminFacility({
      name: "Admin A Plaza Deck",
      city: "Hyderabad",
      address: "Banjara Hills Rd 12",
      totalSlots: 100,
      carSlots: 60,
      bikeSlots: 35,
      evSlots: 5,
      disabledSlots: 2,
      floors: 3,
      pricePerHour: 50,
      twoWheelerPricePerHour: 20,
      evPricePerHour: 60,
      dailyPrice: 350,
      monthlyPassAvailable: true,
      monthlyPassPrice: 4500,
      operatingHours: "24/7 Open",
      isCovered: true,
    }, adminA);

    const unauthorizedAttempt = deleteAdminParkingLot(facA.id, adminB);
    expect(unauthorizedAttempt).toBe(false);
    expect(getAllParkingLots().some(l => l.id === facA.id)).toBe(true);

    const softDeleteSuccess = deleteAdminParkingLot(facA.id, adminA);
    expect(softDeleteSuccess).toBe(true);
    expect(getAllParkingLots().some(l => l.id === facA.id)).toBe(false);

    const adminAllFacilities = getAdminFacilities(adminA, true);
    const deletedRecord = adminAllFacilities.find(f => f.id === facA.id);
    expect(deletedRecord).toBeDefined();
    expect(deletedRecord?.isActive).toBe(false);
    expect(deletedRecord?.status).toBe("inactive");
  });

  it("3. Haversine Distance Utility Calculation", () => {
    const distanceKm = calculateHaversineDistanceKm(17.4262, 78.4116, 17.4401, 78.3489);
    expect(distanceKm).toBeGreaterThan(6.0);
    expect(distanceKm).toBeLessThan(7.5);
  });

  it("4. Booking Date & Time Period Validation Rules", () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // A. Future Date Booking is Valid
    const validFuture = validateBookingPeriod("2028-10-15", "10:00", "12:00");
    expect(validFuture.isValid).toBe(true);
    expect(validFuture.durationHours).toBe(2);

    // B. Past Date Rejection
    const pastDate = validateBookingPeriod("2020-01-01", "10:00", "12:00");
    expect(pastDate.isValid).toBe(false);
    expect(pastDate.error).toContain("Past booking dates are not allowed");

    // C. Start Time >= End Time Rejection
    const invalidTimeRange = validateBookingPeriod(todayStr, "14:00", "12:00");
    expect(invalidTimeRange.isValid).toBe(false);
    expect(invalidTimeRange.error).toContain("End time must be strictly after start time");
  });

  it("5. Overlapping Bookings Rejected vs Back-to-Back Allowed", () => {
    const lotId = "hyd-01";
    const slotNumber = "A-12";

    // Booking A: 2028-10-15 10:00 to 12:00 (ISO start & end)
    const startA = new Date(2028, 9, 15, 10, 0, 0).toISOString();
    const endA = new Date(2028, 9, 15, 12, 0, 0).toISOString();

    confirmBookingAndPayment({
      userId: "u-1",
      userEmail: "driverA@example.com",
      userName: "Driver A",
      parkingLotId: lotId,
      parkingLotName: "Gachibowli Tech Park Smart Hub",
      city: "Hyderabad",
      address: "Financial District",
      slotNumber,
      floorLevel: "P1 Level",
      vehicleType: "car",
      vehicleNumber: "TS 09 EE 1000",
      bookingDate: "2028-10-15",
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      startDateTime: startA,
      endDateTime: endA,
      durationHours: 2,
      totalAmount: 100,
      bookingStatus: "active",
    });

    // Overlapping Booking Attempt B: 11:00 to 13:00 -> MUST BE REJECTED
    const startOverlap = new Date(2028, 9, 15, 11, 0, 0).toISOString();
    const endOverlap = new Date(2028, 9, 15, 13, 0, 0).toISOString();

    const isOverlapAvailable = isSlotAvailableForTimePeriod(lotId, slotNumber, startOverlap, endOverlap);
    expect(isOverlapAvailable).toBe(false);

    // Back-to-Back Booking Attempt C: 12:00 to 14:00 -> MUST BE ALLOWED
    const startBackToBack = new Date(2028, 9, 15, 12, 0, 0).toISOString();
    const endBackToBack = new Date(2028, 9, 15, 14, 0, 0).toISOString();

    const isBackToBackAvailable = isSlotAvailableForTimePeriod(lotId, slotNumber, startBackToBack, endBackToBack);
    expect(isBackToBackAvailable).toBe(true);
  });

  it("6. Cancelled Booking Releases Time Window Slot Availability", () => {
    const lotId = "hyd-02";
    const slotNumber = "B-05";

    const startIso = new Date(2028, 11, 1, 14, 0, 0).toISOString();
    const endIso = new Date(2028, 11, 1, 16, 0, 0).toISOString();

    const booking = confirmBookingAndPayment({
      userId: "u-2",
      userEmail: "driverB@example.com",
      userName: "Driver B",
      parkingLotId: lotId,
      parkingLotName: "Jubilee Hills Medical Zone",
      city: "Hyderabad",
      address: "Road 36",
      slotNumber,
      floorLevel: "P2 Level",
      vehicleType: "car",
      vehicleNumber: "TS 09 EE 2000",
      bookingDate: "2028-12-01",
      startTime: "02:00 PM",
      endTime: "04:00 PM",
      startDateTime: startIso,
      endDateTime: endIso,
      durationHours: 2,
      totalAmount: 80,
      bookingStatus: "active",
    });

    // Currently slot is occupied for 14:00-16:00
    expect(isSlotAvailableForTimePeriod(lotId, slotNumber, startIso, endIso)).toBe(false);

    // Cancel booking
    cancelUserBooking(booking.id);

    // Slot is now immediately released and available again
    expect(isSlotAvailableForTimePeriod(lotId, slotNumber, startIso, endIso)).toBe(true);
  });

  it("7. User & Admin Views Display Booking Date, Start Time, and End Time", () => {
    const userEmail = "historyuser@example.com";
    const adminEmail = "adminowner@example.com";

    // Facility owned by admin
    const lot = registerAdminFacility({
      name: "Admin Hub Deck",
      city: "Bengaluru",
      address: "MG Road",
      totalSlots: 40,
      carSlots: 25,
      bikeSlots: 15,
      evSlots: 0,
      disabledSlots: 0,
      floors: 2,
      pricePerHour: 40,
      twoWheelerPricePerHour: 15,
      evPricePerHour: 50,
      dailyPrice: 250,
      monthlyPassAvailable: false,
      operatingHours: "24/7 Open",
      isCovered: true,
    }, adminEmail);

    const startIso = new Date(2028, 5, 20, 9, 0, 0).toISOString();
    const endIso = new Date(2028, 5, 20, 11, 0, 0).toISOString();

    confirmBookingAndPayment({
      userId: "u-3",
      userEmail,
      userName: "History User",
      parkingLotId: lot.id,
      parkingLotName: lot.name,
      city: lot.city,
      address: lot.address,
      slotNumber: "A-01",
      floorLevel: "P1 Level",
      vehicleType: "car",
      vehicleNumber: "KA 01 AB 9999",
      bookingDate: "2028-06-20",
      startTime: "09:00 AM",
      endTime: "11:00 AM",
      startDateTime: startIso,
      endDateTime: endIso,
      durationHours: 2,
      totalAmount: 80,
      bookingStatus: "active",
    });

    // Check User History view
    const userBookings = getUserBookings(userEmail);
    expect(userBookings).toHaveLength(1);
    expect(userBookings[0].bookingDate).toBe("2028-06-20");
    expect(userBookings[0].startTime).toBe("09:00 AM");
    expect(userBookings[0].endTime).toBe("11:00 AM");

    // Check Admin view
    const adminBookings = getAdminBookings(adminEmail);
    expect(adminBookings).toHaveLength(1);
    expect(adminBookings[0].bookingDate).toBe("2028-06-20");
    expect(adminBookings[0].startTime).toBe("09:00 AM");
    expect(adminBookings[0].endTime).toBe("11:00 AM");
  });

});
