import { BookingRecord } from "../data/mockParkingData";
import { getAllParkingLots, updateSlotAvailability } from "./parkingService";

const STORAGE_BOOKINGS_KEY = "findmyslot_v2_user_bookings";
const STORAGE_HOLDS_KEY = "findmyslot_v2_temporary_holds";

export interface TemporarySlotHold {
  holdId: string;
  lotId: string;
  slotNumber: string;
  userEmail: string;
  expiresAt: number;
}

export interface BookingPeriodValidationResult {
  isValid: boolean;
  error?: string;
  durationHours?: number;
  startDateTime?: string;
  endDateTime?: string;
  bookingDate?: string;
  startTimeFormatted?: string;
  endTimeFormatted?: string;
}

/**
 * Retrieves all stored bookings.
 */
export function getAllBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse bookings", e);
  }
  return [];
}

/**
 * Saves bookings array to LocalStorage.
 */
function saveBookingsArray(bookings: BookingRecord[]): void {
  localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
}

/**
 * Validates selected booking date, start time, and end time.
 * Enforces non-past date, non-past time for today, start < end.
 */
export function validateBookingPeriod(
  bookingDateStr: string, // YYYY-MM-DD
  startTimeStr: string,   // HH:mm (e.g. 10:00)
  endTimeStr: string      // HH:mm (e.g. 12:00)
): BookingPeriodValidationResult {
  if (!bookingDateStr || !startTimeStr || !endTimeStr) {
    return { isValid: false, error: "Please select booking date, start time, and end time." };
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // 1. Past date check
  if (bookingDateStr < todayStr) {
    return { isValid: false, error: "Past booking dates are not allowed. Please select today or a future date." };
  }

  // Parse startDateTime and endDateTime in local time
  const [startH, startM] = startTimeStr.split(":").map(Number);
  const [endH, endM] = endTimeStr.split(":").map(Number);

  const [year, month, day] = bookingDateStr.split("-").map(Number);
  
  const startDt = new Date(year, month - 1, day, startH, startM, 0, 0);
  const endDt = new Date(year, month - 1, day, endH, endM, 0, 0);

  // If end time is before/equal start time (e.g. 10:00 to 09:00), assume end date is next day if small, or reject
  if (endDt <= startDt) {
    return { isValid: false, error: "End time must be strictly after start time." };
  }

  // 2. Past time check for today
  if (bookingDateStr === todayStr && startDt.getTime() < now.getTime() - 60000) { // 1 min grace buffer
    return { isValid: false, error: "Selected start time is in the past for today's date." };
  }

  const durationMs = endDt.getTime() - startDt.getTime();
  const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

  if (durationHours <= 0) {
    return { isValid: false, error: "Booking duration must be greater than 0 hours." };
  }

  const formatTime = (d: Date) => {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return {
    isValid: true,
    durationHours,
    startDateTime: startDt.toISOString(),
    endDateTime: endDt.toISOString(),
    bookingDate: bookingDateStr,
    startTimeFormatted: formatTime(startDt),
    endTimeFormatted: formatTime(endDt),
  };
}

/**
 * Checks if a specific parking slot is available during [startDateTime, endDateTime].
 * Overlap condition: (newStart < existingEnd) && (newEnd > existingStart)
 * Only active/confirmed/pending bookings participate. Cancelled bookings do NOT block availability.
 */
export function isSlotAvailableForTimePeriod(
  parkingLotId: string,
  slotNumber: string,
  startDateTimeIso: string,
  endDateTimeIso: string,
  excludeBookingId?: string
): boolean {
  const newStart = new Date(startDateTimeIso).getTime();
  const newEnd = new Date(endDateTimeIso).getTime();

  if (isNaN(newStart) || isNaN(newEnd) || newStart >= newEnd) return false;

  const all = getAllBookings();
  const activeBookingsForSlot = all.filter((b) => {
    if (b.parkingLotId !== parkingLotId) return false;
    if (b.slotNumber !== slotNumber) return false;
    if (b.bookingStatus === "cancelled") return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    return true;
  });

  for (const b of activeBookingsForSlot) {
    // Resolve start and end of existing booking
    let existStart: number;
    let existEnd: number;

    if (b.startDateTime && b.endDateTime) {
      existStart = new Date(b.startDateTime).getTime();
      existEnd = new Date(b.endDateTime).getTime();
    } else if (b.createdAt) {
      // Legacy fallback
      existStart = new Date(b.createdAt).getTime();
      existEnd = existStart + (b.durationHours || 2) * 3600000;
    } else {
      continue;
    }

    if (isNaN(existStart) || isNaN(existEnd)) continue;

    // Overlap condition: (newStart < existingEnd) && (newEnd > existingStart)
    if (newStart < existEnd && newEnd > existStart) {
      return false; // Overlap detected! Slot is NOT available for this time range.
    }
  }

  return true; // No overlap found, slot is available!
}

/**
 * Retrieves set of occupied slot numbers for a target lot during [startDateTime, endDateTime].
 */
export function getOccupiedSlotsForTimePeriod(
  parkingLotId: string,
  startDateTimeIso: string,
  endDateTimeIso: string
): Set<string> {
  const occupied = new Set<string>();
  const newStart = new Date(startDateTimeIso).getTime();
  const newEnd = new Date(endDateTimeIso).getTime();

  if (isNaN(newStart) || isNaN(newEnd) || newStart >= newEnd) return occupied;

  const all = getAllBookings();
  for (const b of all) {
    if (b.parkingLotId !== parkingLotId) continue;
    if (b.bookingStatus === "cancelled") continue;

    let existStart: number;
    let existEnd: number;

    if (b.startDateTime && b.endDateTime) {
      existStart = new Date(b.startDateTime).getTime();
      existEnd = new Date(b.endDateTime).getTime();
    } else if (b.createdAt) {
      existStart = new Date(b.createdAt).getTime();
      existEnd = existStart + (b.durationHours || 2) * 3600000;
    } else {
      continue;
    }

    if (isNaN(existStart) || isNaN(existEnd)) continue;

    if (newStart < existEnd && newEnd > existStart) {
      occupied.add(b.slotNumber);
    }
  }

  return occupied;
}

/**
 * Temporary Slot Hold Operations
 */
export function createTemporaryHold(lotId: string, slotNumber: string, userEmail: string): TemporarySlotHold {
  const hold: TemporarySlotHold = {
    holdId: `hold-${Date.now()}`,
    lotId,
    slotNumber,
    userEmail: userEmail.toLowerCase(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes hold
  };
  
  try {
    const currentHolds: TemporarySlotHold[] = JSON.parse(localStorage.getItem(STORAGE_HOLDS_KEY) || "[]");
    localStorage.setItem(STORAGE_HOLDS_KEY, JSON.stringify([hold, ...currentHolds]));
  } catch (e) {
    console.error("Failed to set temporary hold", e);
  }
  
  return hold;
}

export function releaseTemporaryHold(holdId?: string): void {
  if (!holdId) return;
  try {
    const currentHolds: TemporarySlotHold[] = JSON.parse(localStorage.getItem(STORAGE_HOLDS_KEY) || "[]");
    const updated = currentHolds.filter(h => h.holdId !== holdId);
    localStorage.setItem(STORAGE_HOLDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to release temporary hold", e);
  }
}

/**
 * Confirms payment and creates a booking record.
 * Decrements availableSlots on the target lot, links ownerAdminEmail if admin-created.
 */
export function confirmBookingAndPayment(
  payload: Omit<BookingRecord, "id" | "createdAt" | "qrCodeUrl">,
  holdId?: string
): BookingRecord {
  // Find lot to resolve ownerAdminEmail
  const allLots = getAllParkingLots();
  const targetLot = allLots.find(l => l.id === payload.parkingLotId);
  const ownerEmail = targetLot?.ownerAdminEmail;

  const newBooking: BookingRecord = {
    ...payload,
    id: `bk-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    ownerAdminEmail: ownerEmail ? ownerEmail.toLowerCase() : undefined,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FMS-BK-${Date.now()}`,
  };

  const currentBookings = getAllBookings();
  saveBookingsArray([newBooking, ...currentBookings]);

  // Release temporary hold
  if (holdId) {
    releaseTemporaryHold(holdId);
  }

  // Decrement slot count
  updateSlotAvailability(payload.parkingLotId, -1);

  return newBooking;
}

/**
 * Cancels an active user booking.
 * Increments availableSlots on the target lot (+1).
 */
export function cancelUserBooking(bookingId: string): boolean {
  const currentBookings = getAllBookings();
  const booking = currentBookings.find(b => b.id === bookingId);
  if (!booking) return false;

  booking.bookingStatus = "cancelled";
  saveBookingsArray(currentBookings);

  // Restore slot availability (+1)
  updateSlotAvailability(booking.parkingLotId, 1);

  return true;
}

/**
 * Retrieves bookings strictly for a user account (by email).
 * Returns [] for a new user.
 */
export function getUserBookings(userEmail?: string): BookingRecord[] {
  if (!userEmail) return [];
  const normalized = userEmail.trim().toLowerCase();
  const all = getAllBookings();
  return all.filter(b => b.userEmail.toLowerCase() === normalized);
}

/**
 * Retrieves bookings strictly for an admin's facilities (by ownerAdminEmail).
 * Returns [] for a new admin.
 */
export function getAdminBookings(adminEmail?: string): BookingRecord[] {
  if (!adminEmail) return [];
  const normalized = adminEmail.trim().toLowerCase();
  const all = getAllBookings();
  return all.filter(b => b.ownerAdminEmail?.toLowerCase() === normalized);
}
