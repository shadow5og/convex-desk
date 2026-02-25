import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Seed some sample machines for testing
export const seedMachines = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if machines already exist
    const existingMachines = await ctx.db.query("machines").collect();
    if (existingMachines.length > 0) {
      return { message: "Machines already seeded" };
    }

    const machines = [
      {
        barcode: "WM001",
        name: "Washer #1",
        type: "washer" as const,
        status: "idle" as const,
      },
      {
        barcode: "WM002", 
        name: "Washer #2",
        type: "washer" as const,
        status: "idle" as const,
      },
      {
        barcode: "DM001",
        name: "Dryer #1", 
        type: "dryer" as const,
        status: "idle" as const,
      },
      {
        barcode: "DM002",
        name: "Dryer #2",
        type: "dryer" as const, 
        status: "idle" as const,
      },
    ];

    for (const machine of machines) {
      await ctx.db.insert("machines", machine);
    }

    return { message: "Machines seeded successfully" };
  },
});

export const getAllMachines = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("machines").collect();
  },
});
