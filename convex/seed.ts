import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if machines already exist
    const existingMachines = await ctx.db.query("machines").collect();
    if (existingMachines.length > 0) {
      return { message: "Data already seeded" };
    }

    // Seed machines
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

    return { message: "Sample data seeded successfully! You can now test the scanner with barcodes: WM001, WM002, DM001, DM002" };
  },
});
