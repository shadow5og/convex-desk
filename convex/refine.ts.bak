import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id, TableNames } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// Helper to assert table name
const isValidResource = (resource: string): resource is TableNames => {
  return ["laundryOrders", "cleaningBookings", "users", "transactions", "notifications"].includes(resource);
};

export const getList = query({
  args: {
    resource: v.string(),
    pagination: v.optional(
      v.object({
        current: v.optional(v.number()),
        pageSize: v.optional(v.number()),
        mode: v.optional(v.string()),
      })
    ),
    filters: v.optional(v.any()),
    sorters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (!isValidResource(args.resource)) {
      throw new Error(`Invalid resource: ${args.resource}`);
    }

    // Determine sort order from sorters first
    const sorterOrder =
      args.sorters &&
      Array.isArray(args.sorters) &&
      args.sorters.length > 0 &&
      args.sorters[0].order === "asc"
        ? ("asc" as const)
        : ("desc" as const);

    // Query with order applied once — avoids TypeScript type narrowing issue
    const orderedQuery = ctx.db.query(args.resource).order(sorterOrder);
    const allData = await orderedQuery.collect();

    // Apply basic in-memory filters
    let filteredData = allData;
    if (args.filters && Array.isArray(args.filters)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args.filters.forEach((filter: any) => {
        if (filter.field && filter.operator === "eq") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filteredData = filteredData.filter((item: any) => item[filter.field] === filter.value);
        }
      });
    }

    // Paginate in memory
    const current = args.pagination?.current ?? 1;
    const pageSize = args.pagination?.pageSize ?? 10;
    const startIndex = (current - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedData,
      total: filteredData.length,
    };
  },
});

export const getOne = query({
  args: {
    resource: v.string(),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isValidResource(args.resource)) {
      throw new Error(`Invalid resource: ${args.resource}`);
    }

    const data = await ctx.db.get(args.id as Id<TableNames>);
    if (!data) {
      throw new Error(`Document not found`);
    }

    return { data };
  },
});


export const create = mutation({
  args: {
    resource: v.string(),
    variables: v.any(),
  },
  handler: async (ctx, args) => {
    if (!isValidResource(args.resource)) {
      throw new Error(`Invalid resource: ${args.resource}`);
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const newId = await ctx.db.insert(args.resource, {
      ...args.variables,
      userId,
    });
    const data = await ctx.db.get(newId);

    return { data };
  },
});

export const update = mutation({
  args: {
    resource: v.string(),
    id: v.string(),
    variables: v.any(),
  },
  handler: async (ctx, args) => {
    if (!isValidResource(args.resource)) {
      throw new Error(`Invalid resource: ${args.resource}`);
    }

    await ctx.db.patch(args.id as Id<TableNames>, args.variables);
    const data = await ctx.db.get(args.id as Id<TableNames>);

    return { data };
  },
});

export const deleteOne = mutation({
  args: {
    resource: v.string(),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isValidResource(args.resource)) {
      throw new Error(`Invalid resource: ${args.resource}`);
    }

    const data = await ctx.db.get(args.id as Id<TableNames>);
    await ctx.db.delete(args.id as Id<TableNames>);

    return { data };
  },
});
