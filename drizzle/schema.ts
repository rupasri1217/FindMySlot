import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  profileImage: text("profileImage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Parking Lots table - stores parking facility information
 */
export const parkingLots = mysqlTable("parking_lots", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  totalSlots: int("total_slots").notNull(),
  availableSlots: int("available_slots").notNull(),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  twoWheelerPricePerHour: decimal("two_wheeler_price_per_hour", { precision: 10, scale: 2 }).default("20.00"),
  twoWheelerTotalSlots: int("two_wheeler_total_slots").default(20),
  twoWheelerAvailableSlots: int("two_wheeler_available_slots").default(15),
  parkingType: varchar("parking_type", { length: 50 }).default("Multi-Level Covered"), // Underground, Multi-Level, Surface
  securityRating: decimal("security_rating", { precision: 3, scale: 1 }).default("4.8"),
  isCovered: boolean("is_covered").default(true),
  operatingHours: json("operating_hours").notNull(), // { open: "06:00", close: "23:00" }
  amenities: json("amenities"), // ["24/7", "CCTV", "EV Charging", "Bike Locker"]
  photos: json("photos"), // Array of image URLs
  peakHours: json("peak_hours"), // Peak traffic distribution
  image: text("image"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParkingLot = typeof parkingLots.$inferSelect;
export type InsertParkingLot = typeof parkingLots.$inferInsert;

/**
 * Parking Slots table - individual parking spaces
 */
export const parkingSlots = mysqlTable("parking_slots", {
  id: int("id").autoincrement().primaryKey(),
  lotId: int("lot_id").notNull(),
  slotNumber: varchar("slot_number", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["available", "occupied", "reserved", "maintenance"]).default("available").notNull(),
  type: mysqlEnum("type", ["standard", "compact", "handicap", "ev_charging", "two_wheeler"]).default("standard").notNull(),
  vehicleCategory: mysqlEnum("vehicle_category", ["two_wheeler", "four_wheeler"]).default("four_wheeler").notNull(),
  floor: varchar("floor", { length: 20 }).default("Floor 1"),
  zone: varchar("zone", { length: 20 }).default("Zone A"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParkingSlot = typeof parkingSlots.$inferSelect;
export type InsertParkingSlot = typeof parkingSlots.$inferInsert;

/**
 * Bookings table - parking reservations
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  slotId: int("slot_id").notNull(),
  lotId: int("lot_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "active", "completed", "cancelled"]).default("pending").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("payment_status", ["unpaid", "paid", "refunded"]).default("unpaid").notNull(),
  vehicleType: varchar("vehicle_type", { length: 30 }).default("car"), // motorcycle, scooter, car, ev_car
  vehicleNumber: varchar("vehicle_number", { length: 30 }),
  destinationName: text("destination_name"),
  lastMileOption: varchar("last_mile_option", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Payments table - transaction records
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("booking_id").notNull(),
  userId: int("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["credit_card", "debit_card", "upi", "wallet"]).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }).unique(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }).default("0"),
  refundReason: text("refund_reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Notifications table - user notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["booking_confirmation", "reminder", "overstay_alert", "availability_update", "promotional"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedBookingId: int("related_booking_id"),
  isRead: boolean("is_read").default(false).notNull(),
  sentVia: json("sent_via"), // ["email", "in_app"]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Violations table - parking violations and overstays
 */
export const violations = mysqlTable("violations", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("booking_id").notNull(),
  userId: int("user_id").notNull(),
  lotId: int("lot_id").notNull(),
  violationType: mysqlEnum("violation_type", ["overstay", "unauthorized_parking", "invalid_slot", "damage"]).notNull(),
  description: text("description"),
  fineAmount: decimal("fine_amount", { precision: 10, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["reported", "acknowledged", "resolved", "paid"]).default("reported").notNull(),
  evidenceImage: text("evidence_image"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Violation = typeof violations.$inferSelect;
export type InsertViolation = typeof violations.$inferInsert;

/**
 * Favorites table - user's saved parking locations
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  lotId: int("lot_id").notNull(),
  label: varchar("label", { length: 100 }), // "Home", "Office", etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Saved Places table - user's frequent destinations (Home, Work, Mall, etc.)
 */
export const savedPlaces = mysqlTable("saved_places", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  label: varchar("label", { length: 100 }).notNull(), // "Home", "Work", "Cyber City", "Central Mall"
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  iconName: varchar("icon_name", { length: 50 }).default("MapPin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedPlace = typeof savedPlaces.$inferSelect;
export type InsertSavedPlace = typeof savedPlaces.$inferInsert;

/**
 * Reviews table - user reviews for parking lots
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  lotId: int("lot_id").notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

