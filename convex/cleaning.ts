import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const bookCleaning = mutation({
  args: {
    type: v.union(
      v.literal("standard"),
      v.literal("deep"),
      v.literal("move_out"),
      v.literal("custom")
    ),
    customText: v.optional(v.string()),
    scheduledAt: v.number(),
    address: v.string(),
    estimatedDuration: v.number(),
    totalAmount: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const bookingId = await ctx.db.insert("cleaningBookings", {
      userId,
      type: args.type,
      customText: args.customText,
      scheduledAt: args.scheduledAt,
      address: args.address,
      status: "pending",
      estimatedDuration: args.estimatedDuration,
      totalAmount: args.totalAmount,
      notes: args.notes,
    });

    // Create transaction
    await ctx.db.insert("transactions", {
      cleaningBookingId: bookingId,
      userId,
      amount: args.totalAmount,
      status: "pending",
      transactionDate: Date.now(),
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      message: `Your ${args.type} cleaning service has been booked for ${new Date(args.scheduledAt).toLocaleDateString()}.`,
      type: "cleaning",
      isRead: false,
      relatedBookingId: bookingId,
    });

    return bookingId;
  },
});

export const updateCleaningStatus = mutation({
  args: {
    bookingId: v.id("cleaningBookings"),
    newStatus: v.union(
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    assignedStaffId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const updateData: any = { status: args.newStatus };
    if (args.assignedStaffId) {
      updateData.assignedStaffId = args.assignedStaffId;
    }

    await ctx.db.patch(args.bookingId, updateData);

    // Auto-notification logic
    let notificationMessage = "";
    
    if (args.newStatus === "assigned") {
      notificationMessage = "A cleaner has been assigned to your booking.";
    } else if (args.newStatus === "in_progress") {
      notificationMessage = "Your cleaning service is now in progress.";
    } else if (args.newStatus === "completed") {
      notificationMessage = "Your cleaning service has been completed. Thank you!";
      
      // Mark transaction as completed
      const transaction = await ctx.db
        .query("transactions")
        .filter((q) => q.eq(q.field("cleaningBookingId"), args.bookingId))
        .first();
      
      if (transaction) {
        await ctx.db.patch(transaction._id, { status: "completed" });
      }
    } else if (args.newStatus === "cancelled") {
      notificationMessage = "Your cleaning booking has been cancelled.";
    }

    if (notificationMessage) {
      await ctx.db.insert("notifications", {
        userId: booking.userId,
        message: notificationMessage,
        type: "cleaning",
        isRead: false,
        relatedBookingId: args.bookingId,
      });
    }

    return { success: true };
  },
});

export const getUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("cleaningBookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
