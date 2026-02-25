import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {

  laundryOrders: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("delivery"), v.literal("shop_drop")),
    status: v.union(
      v.literal("scheduled"),
      v.literal("collected"),
      v.literal("washing"),
      v.literal("washing_completed"),
      v.literal("folding"),
      v.literal("folding_completed"),
      v.literal("delivery_ready"),
      v.literal("completed")
    ),
    items: v.array(v.object({
      type: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    totalAmount: v.number(),
    scheduledAt: v.optional(v.number()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  machines: defineTable({
    barcode: v.string(),
    name: v.string(),
    type: v.union(v.literal("washer"), v.literal("dryer")),
    status: v.union(v.literal("idle"), v.literal("running"), v.literal("maintenance")),
    currentOrderId: v.optional(v.id("laundryOrders")),
    estimatedCompletionTime: v.optional(v.number()),
  }).index("by_barcode", ["barcode"]),

  transactions: defineTable({
    orderId: v.optional(v.id("laundryOrders")),
    cleaningBookingId: v.optional(v.id("cleaningBookings")),
    machineId: v.optional(v.id("machines")),
    userId: v.id("users"),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    paymentMethod: v.optional(v.string()),
    transactionDate: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_order", ["orderId"]),

  cleaningBookings: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("standard"),
      v.literal("deep"),
      v.literal("move_out"),
      v.literal("custom")
    ),
    customText: v.optional(v.string()),
    scheduledAt: v.number(),
    address: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    assignedStaffId: v.optional(v.id("users")),
    estimatedDuration: v.number(),
    totalAmount: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_scheduled_date", ["scheduledAt"]),

  notifications: defineTable({
    userId: v.id("users"),
    message: v.string(),
    type: v.union(v.literal("laundry"), v.literal("cleaning"), v.literal("general")),
    isRead: v.boolean(),
    relatedOrderId: v.optional(v.id("laundryOrders")),
    relatedBookingId: v.optional(v.id("cleaningBookings")),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
