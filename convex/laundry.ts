import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createLaundryOrder = mutation({
  args: {
    type: v.union(v.literal("delivery"), v.literal("shop_drop")),
    items: v.array(v.object({
      type: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    scheduledAt: v.optional(v.number()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const totalAmount = args.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderId = await ctx.db.insert("laundryOrders", {
      userId,
      type: args.type,
      status: "scheduled",
      items: args.items,
      totalAmount,
      scheduledAt: args.scheduledAt,
      address: args.address,
      notes: args.notes,
    });

    // Create initial transaction
    await ctx.db.insert("transactions", {
      orderId,
      userId,
      amount: totalAmount,
      status: "pending",
      transactionDate: Date.now(),
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      message: `Your laundry order has been scheduled for ${args.type === "delivery" ? "pickup" : "drop-off"}.`,
      type: "laundry",
      isRead: false,
      relatedOrderId: orderId,
    });

    return orderId;
  },
});

export const scanAndStartMachine = mutation({
  args: {
    barcode: v.string(),
    orderId: v.id("laundryOrders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Find machine by barcode
    const machine = await ctx.db
      .query("machines")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .unique();

    if (!machine) {
      throw new Error("Machine not found");
    }

    if (machine.status !== "idle") {
      throw new Error("Machine is not available");
    }

    // Get the order
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Update machine status
    await ctx.db.patch(machine._id, {
      status: "running",
      currentOrderId: args.orderId,
      estimatedCompletionTime: Date.now() + (45 * 60 * 1000), // 45 minutes
    });

    // Update order status
    await ctx.db.patch(args.orderId, {
      status: "washing",
    });

    // Update transaction to completed
    const transaction = await ctx.db
      .query("transactions")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (transaction) {
      await ctx.db.patch(transaction._id, {
        status: "completed",
        machineId: machine._id,
      });
    }

    // Create notification
    await ctx.db.insert("notifications", {
      userId,
      message: `Your laundry is now washing in ${machine.name}. Estimated completion: ${new Date(Date.now() + (45 * 60 * 1000)).toLocaleTimeString()}.`,
      type: "laundry",
      isRead: false,
      relatedOrderId: args.orderId,
    });

    return { success: true, machine: machine.name };
  },
});

export const updateLaundryStatus = mutation({
  args: {
    orderId: v.id("laundryOrders"),
    newStatus: v.union(
      v.literal("collected"),
      v.literal("washing_completed"),
      v.literal("folding"),
      v.literal("folding_completed"),
      v.literal("delivery_ready"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(args.orderId, {
      status: args.newStatus,
    });

    // Auto-notification logic
    let notificationMessage = "";
    
    if (args.newStatus === "washing_completed") {
      notificationMessage = "Your laundry has finished washing and is ready for folding.";
    } else if (args.newStatus === "folding_completed") {
      if (order.type === "delivery") {
        notificationMessage = "Your clothes are folded and preparing for delivery.";
      } else {
        notificationMessage = "Your clothes are folded and ready for pickup.";
      }
    } else if (args.newStatus === "delivery_ready") {
      notificationMessage = "Your laundry is out for delivery!";
    } else if (args.newStatus === "completed") {
      notificationMessage = "Your laundry order has been completed. Thank you!";
    }

    if (notificationMessage) {
      await ctx.db.insert("notifications", {
        userId: order.userId,
        message: notificationMessage,
        type: "laundry",
        isRead: false,
        relatedOrderId: args.orderId,
      });
    }

    // If washing completed, free up the machine
    if (args.newStatus === "washing_completed") {
      const machine = await ctx.db
        .query("machines")
        .filter((q) => q.eq(q.field("currentOrderId"), args.orderId))
        .first();
      
      if (machine) {
        await ctx.db.patch(machine._id, {
          status: "idle",
          currentOrderId: undefined,
          estimatedCompletionTime: undefined,
        });
      }
    }

    return { success: true };
  },
});

export const getUserOrders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("laundryOrders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getMachineByBarcode = query({
  args: {
    barcode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("machines")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .unique();
  },
});
