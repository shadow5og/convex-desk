import {
    cacheGet,
    cachePut,
    optimisticAdd,
    optimisticGetAll,
    queueAdd,
} from "@/shared/lib/offline-store";
import { bootstrapSyncEngine } from "@/shared/lib/sync-engine";
import type { DataProvider, GetListParams } from "@refinedev/core";
import { api } from "../../../convex/_generated/api";

// ─── helpers ─────────────────────────────────────────────────

const cacheKey = (op: string, params: unknown) =>
  `${op}::${JSON.stringify(params)}`;

const isNetworkError = (e: unknown) => {
  if (e instanceof Error) {
    return (
      e.message.includes("fetch") ||
      e.message.includes("Failed to fetch") ||
      e.message.includes("network")
    );
  }
  return false;
};

// ─── Provider factory ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const convexDataProvider = (client: any): DataProvider => {
  // Wire up the sync engine (idempotent — safe to call multiple times)
  bootstrapSyncEngine(client);

  return {
    // ── LIST ──────────────────────────────────────────────────
    getList: async ({ resource, pagination, filters, sorters }: GetListParams) => {
      const key = cacheKey("getList", { resource, pagination, filters, sorters });

      try {
        const result = await client.query(api.refine.getList, {
          resource,
          pagination: pagination as never,
          filters: filters as never,
          sorters: sorters as never,
        });

        // Merge in any unsynchronised optimistic records
        const optimistic = await optimisticGetAll(resource);
        const optimisticData = optimistic.map((r) => r.data);

        const merged = {
          data: [...optimisticData, ...(result.data ?? [])],
          total: (result.total ?? 0) + optimisticData.length,
        };

        await cachePut(key, merged);
        return merged as ReturnType<DataProvider["getList"]>;
      } catch (e) {
        if (!navigator.onLine || isNetworkError(e)) {
          // Serve from cache + optimistic records
          const cached = (await cacheGet(key)) as
            | { data: unknown[]; total: number }
            | undefined;

          const optimistic = await optimisticGetAll(resource);
          const optimisticData = optimistic.map((r) => r.data);

          if (cached) {
            return {
              data: [...optimisticData, ...cached.data],
              total: cached.total + optimisticData.length,
            } as ReturnType<DataProvider["getList"]>;
          }

          // No cache yet — return only what we have locally
          return {
            data: optimisticData,
            total: optimisticData.length,
          } as ReturnType<DataProvider["getList"]>;
        }
        throw e;
      }
    },

    // ── GET ONE ───────────────────────────────────────────────
    getOne: async ({ resource, id }) => {
      const key = cacheKey("getOne", { resource, id });

      try {
        const data = await client.query(api.refine.getOne, {
          resource,
          id: id as string,
        });
        await cachePut(key, data);
        return data as ReturnType<DataProvider["getOne"]>;
      } catch (e) {
        if (!navigator.onLine || isNetworkError(e)) {
          const cached = await cacheGet(key);
          if (cached) return cached as ReturnType<DataProvider["getOne"]>;
        }
        throw e;
      }
    },

    // ── CREATE ────────────────────────────────────────────────
    create: async ({ resource, variables }) => {
      if (!navigator.onLine) {
        const tempId = await optimisticAdd(resource, variables as Record<string, unknown>);
        await queueAdd({ type: "create", resource, variables: variables as Record<string, unknown>, tempId });
        return { data: { _id: tempId, _isOffline: true, ...variables } } as ReturnType<DataProvider["create"]>;
      }

      try {
        const data = await client.mutation(api.refine.create, {
          resource,
          variables,
        });
        return data as ReturnType<DataProvider["create"]>;
      } catch (e) {
        if (isNetworkError(e)) {
          const tempId = await optimisticAdd(resource, variables as Record<string, unknown>);
          await queueAdd({ type: "create", resource, variables: variables as Record<string, unknown>, tempId });
          return { data: { _id: tempId, _isOffline: true, ...variables } } as ReturnType<DataProvider["create"]>;
        }
        throw e;
      }
    },

    // ── UPDATE ────────────────────────────────────────────────
    update: async ({ resource, id, variables }) => {
      if (!navigator.onLine) {
        await queueAdd({
          type: "update",
          resource,
          recordId: id as string,
          variables: variables as Record<string, unknown>,
          tempId: id?.toString().startsWith("temp_") ? id.toString() : undefined,
        });
        return { data: { _id: id, _isOffline: true, ...variables } } as ReturnType<DataProvider["update"]>;
      }

      try {
        const data = await client.mutation(api.refine.update, {
          resource,
          id: id as string,
          variables,
        });
        return data as ReturnType<DataProvider["update"]>;
      } catch (e) {
        if (isNetworkError(e)) {
          await queueAdd({
            type: "update",
            resource,
            recordId: id as string,
            variables: variables as Record<string, unknown>,
          });
          return { data: { _id: id, _isOffline: true, ...variables } } as ReturnType<DataProvider["update"]>;
        }
        throw e;
      }
    },

    // ── DELETE ────────────────────────────────────────────────
    deleteOne: async ({ resource, id }) => {
      if (!navigator.onLine) {
        await queueAdd({ type: "deleteOne", resource, recordId: id as string });
        return { data: { _id: id } } as ReturnType<DataProvider["deleteOne"]>;
      }

      try {
        const data = await client.mutation(api.refine.deleteOne, {
          resource,
          id: id as string,
        });
        return data as ReturnType<DataProvider["deleteOne"]>;
      } catch (e) {
        if (isNetworkError(e)) {
          await queueAdd({ type: "deleteOne", resource, recordId: id as string });
          return { data: { _id: id } } as ReturnType<DataProvider["deleteOne"]>;
        }
        throw e;
      }
    },

    getApiUrl: () => import.meta.env.VITE_CONVEX_URL,
  };
};
