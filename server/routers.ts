import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Parking Lots
  parkingLots: router({
    list: publicProcedure.query(async () => {
      return db.getAllParkingLots();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getParkingLotById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        totalSlots: z.number(),
        pricePerHour: z.number(),
        operatingHours: z.object({ open: z.string(), close: z.string() }),
        amenities: z.array(z.string()).optional(),
        image: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createParkingLot({
          ...input,
          availableSlots: input.totalSlots,
          createdBy: ctx.user.id,
          operatingHours: JSON.stringify(input.operatingHours),
          amenities: input.amenities ? JSON.stringify(input.amenities) : null,
        });
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        pricePerHour: z.number().optional(),
        amenities: z.array(z.string()).optional(),
        image: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateParkingLot(id, {
          ...data,
          amenities: data.amenities ? JSON.stringify(data.amenities) : undefined,
        });
      }),
  }),

  // Parking Slots
  parkingSlots: router({
    getByLotId: publicProcedure
      .input(z.object({ lotId: z.number() }))
      .query(async ({ input }) => {
        return db.getSlotsByLotId(input.lotId);
      }),

    getAvailableByLotId: publicProcedure
      .input(z.object({ lotId: z.number() }))
      .query(async ({ input }) => {
        return db.getAvailableSlotsByLotId(input.lotId);
      }),
  }),

  // Bookings
  bookings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBookings(ctx.user.id);
    }),

    active: protectedProcedure.query(async ({ ctx }) => {
      return db.getActiveUserBookings(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking || booking.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        return booking;
      }),

    create: protectedProcedure
      .input(z.object({
        slotId: z.number(),
        lotId: z.number(),
        startTime: z.date(),
        endTime: z.date(),
        totalPrice: z.number(),
        vehicleType: z.string().optional(),
        vehicleNumber: z.string().optional(),
        destinationName: z.string().optional(),
        lastMileOption: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const slot = await db.getParkingSlotById(input.slotId);
        if (!slot || slot.status !== 'available') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Slot not available' });
        }

        const bookingResult = await db.createBooking({
          userId: ctx.user.id,
          slotId: input.slotId,
          lotId: input.lotId,
          startTime: input.startTime,
          endTime: input.endTime,
          totalPrice: input.totalPrice,
          vehicleType: input.vehicleType || 'car',
          vehicleNumber: input.vehicleNumber,
          destinationName: input.destinationName,
          lastMileOption: input.lastMileOption,
          notes: input.notes,
          status: 'pending',
        });

        // Create notification
        if (bookingResult) {
          await db.createNotification({
            userId: ctx.user.id,
            type: 'booking_confirmation',
            title: 'Booking Created',
            message: `Your parking booking has been created. Please complete payment to confirm.`,
            relatedBookingId: (bookingResult as any).insertId,
            sentVia: JSON.stringify(['in_app']),
          });
        }

        return bookingResult;
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'confirmed', 'active', 'completed', 'cancelled']),
      }))
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking || booking.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        return db.updateBooking(input.id, { status: input.status });
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking || booking.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        return db.updateBooking(input.id, { status: 'cancelled' });
      }),
  }),

  // Payments
  payments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPayments(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        amount: z.number(),
        paymentMethod: z.enum(['credit_card', 'debit_card', 'upi', 'wallet']),
      }))
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking || booking.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const payment = await db.createPayment({
          bookingId: input.bookingId,
          userId: ctx.user.id,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          transactionId,
          status: 'completed',
        });

        // Update booking status
        await db.updateBooking(input.bookingId, { 
          status: 'confirmed',
          paymentStatus: 'paid'
        });

        // Update slot status
        await db.updateSlotStatus(booking.slotId, 'reserved');

        return payment;
      }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserNotifications(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.markNotificationAsRead(input.id);
      }),
  }),

  // Favorites
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserFavorites(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({ lotId: z.number(), label: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        return db.addFavorite(ctx.user.id, input.lotId, input.label);
      }),

    remove: protectedProcedure
      .input(z.object({ lotId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.removeFavorite(ctx.user.id, input.lotId);
      }),
  }),

  // Saved Places
  savedPlaces: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSavedPlaces(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({
        label: z.string(),
        address: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        iconName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.addSavedPlace({
          userId: ctx.user.id,
          ...input,
        });
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.removeSavedPlace(input.id, ctx.user.id);
      }),
  }),

  // Admin Analytics
  analytics: router({
    occupancy: adminProcedure
      .input(z.object({ lotId: z.number() }))
      .query(async ({ input }) => {
        return db.getLotOccupancy(input.lotId);
      }),

    revenue: adminProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(async ({ input }) => {
        return db.getTotalRevenue(input.startDate, input.endDate);
      }),

    violations: adminProcedure.query(async () => {
      return db.getAllViolations();
    }),
  }),
});

export type AppRouter = typeof appRouter;
