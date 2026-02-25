import { DataProvider } from "@refinedev/core";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export const convexDataProvider = (): DataProvider => {
  const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

  return {
    getList: async ({ resource, pagination, filters, sorters }) => {
      const result = await client.query(api.refine.getList, {
        resource,
        pagination: pagination as any,
        filters: filters as any,
        sorters: sorters as any,
      });
      return {
        data: result.data || [],
        total: result.total || 0,
      } as any;
    },
    getOne: async ({ resource, id }) => {
      const data = await client.query(api.refine.getOne, { resource, id: id as string });
      return data as any;
    },
    create: async ({ resource, variables }) => {
      const data = await client.mutation(api.refine.create, { resource, variables });
      return data as any;
    },
    update: async ({ resource, id, variables }) => {
      const data = await client.mutation(api.refine.update, {
        resource,
        id: id as string,
        variables,
      });
      return data as any;
    },
    deleteOne: async ({ resource, id }) => {
      const data = await client.mutation(api.refine.deleteOne, { resource, id: id as string });
      return data as any;
    },
    getApiUrl: () => import.meta.env.VITE_CONVEX_URL,
  };
};
