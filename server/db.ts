import { eq, desc, and, gte, lte, between, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  parkingLots, 
  parkingSlots, 
  bookings, 
  payments, 
  notifications,
  violations,
  favorites,
  reviews,
  savedPlaces,
  ParkingLot,
  Booking,
  Payment,
  Notification,
  Violation,
  Favorite,
  Review,
  ParkingSlot,
  SavedPlace,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "profileImage"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Parking Lots queries
export async function getAllParkingLots() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parkingLots).where(eq(parkingLots.isActive, true));
}

export async function getParkingLotById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(parkingLots).where(eq(parkingLots.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createParkingLot(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(parkingLots).values(data);
  return result;
}

export async function updateParkingLot(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(parkingLots).set(data).where(eq(parkingLots.id, id));
}

// Parking Slots queries
export async function getSlotsByLotId(lotId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parkingSlots).where(eq(parkingSlots.lotId, lotId));
}

export async function getAvailableSlotsByLotId(lotId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(parkingSlots).where(
    and(
      eq(parkingSlots.lotId, lotId),
      eq(parkingSlots.status, "available")
    )
  );
}

export async function getParkingSlotById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(parkingSlots).where(eq(parkingSlots.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSlotStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return null;
  return db.update(parkingSlots).set({ status: status as any }).where(eq(parkingSlots.id, id));
}

// Bookings queries
export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function getActiveUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookings).where(
    and(
      eq(bookings.userId, userId),
      inArray(bookings.status, ["pending", "confirmed", "active"])
    )
  ).orderBy(desc(bookings.startTime));
}

export async function createBooking(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(bookings).values(data);
  return result;
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateBooking(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(bookings).set(data).where(eq(bookings.id, id));
}

// Payments queries
export async function getUserPayments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
}

export async function createPayment(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(payments).values(data);
}

export async function getPaymentByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(payments).where(eq(payments.bookingId, bookingId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePayment(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.update(payments).set(data).where(eq(payments.id, id));
}

// Notifications queries
export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function createNotification(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(notifications).values(data);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return null;
  return db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

// Violations queries
export async function getUserViolations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(violations).where(eq(violations.userId, userId)).orderBy(desc(violations.createdAt));
}

export async function createViolation(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(violations).values(data);
}

export async function getAllViolations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(violations).orderBy(desc(violations.createdAt));
}

// Favorites queries
export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function addFavorite(userId: number, lotId: number, label?: string) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(favorites).values({ userId, lotId, label });
}

export async function removeFavorite(userId: number, lotId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(favorites).where(
    and(
      eq(favorites.userId, userId),
      eq(favorites.lotId, lotId)
    )
  );
}

// Saved Places queries
export async function getUserSavedPlaces(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedPlaces).where(eq(savedPlaces.userId, userId));
}

export async function addSavedPlace(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(savedPlaces).values(data);
}

export async function removeSavedPlace(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.delete(savedPlaces).where(
    and(
      eq(savedPlaces.id, id),
      eq(savedPlaces.userId, userId)
    )
  );
}

// Reviews queries
export async function getLotReviews(lotId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.lotId, lotId)).orderBy(desc(reviews.createdAt));
}

export async function createReview(data: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(reviews).values(data);
}

// Analytics queries
export async function getLotOccupancy(lotId: number) {
  const db = await getDb();
  if (!db) return null;
  const lot = await getParkingLotById(lotId);
  if (!lot) return null;
  const occupancy = ((lot.totalSlots - lot.availableSlots) / lot.totalSlots) * 100;
  return { occupancy, available: lot.availableSlots, total: lot.totalSlots };
}

export async function getTotalRevenue(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(payments).where(
    and(
      gte(payments.createdAt, startDate),
      lte(payments.createdAt, endDate),
      eq(payments.status, "completed")
    )
  );
  return result.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
}

