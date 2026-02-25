/**
 * Sync Engine
 *
 * Replays the offline mutation queue against the live Convex backend.
 * Called on:
 *   - window "online" event
 *   - app mount (after 2s grace)
 *   - manually from UI
 *
 * Each mutation is retried up to MAX_RETRIES times before being marked as
 * permanently failed and dropped with a toast notification.
 */

import {
    optimisticRemove,
    queueGet,
    queueIncrementRetry,
    queueRemove,
    type QueuedMutation,
} from "@/shared/lib/offline-store";
import { ConvexHttpClient } from "convex/browser";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

const MAX_RETRIES = 3;

const isNetworkError = (e: unknown): boolean => {
  if (e instanceof Error) {
    return (
      e.message.includes("fetch") ||
      e.message.includes("network") ||
      e.message.includes("Failed to fetch")
    );
  }
  return false;
};

export const syncOfflineQueue = async (client: ConvexHttpClient): Promise<number> => {
  if (!navigator.onLine) return 0;

  const queue = await queueGet();
  if (!queue.length) return 0;

  let synced = 0;
  const toastId = toast.loading(`Syncing ${queue.length} offline change${queue.length > 1 ? "s" : ""}...`);

  for (const item of queue) {
    try {
      await replayMutation(client, item);
      // Remove from queue and optimistic store
      await queueRemove(item.id);
      if (item.tempId) await optimisticRemove(item.tempId);
      synced++;
    } catch (e: unknown) {
      if (isNetworkError(e)) {
        // Still offline — stop processing, leave queue intact
        toast.dismiss(toastId);
        toast.warning("Sync paused — you appear to be offline.");
        return synced;
      }

      // Server-side / validation error
      await queueIncrementRetry(item.id);
      const updated = await queueGet().then((q) => q.find((m) => m.id === item.id));

      if (updated && updated.retries >= MAX_RETRIES) {
        await queueRemove(item.id);
        if (item.tempId) await optimisticRemove(item.tempId);
        toast.error(`Failed to sync a ${item.type} on '${item.resource}'. It was discarded after ${MAX_RETRIES} attempts.`);
      }
    }
  }

  toast.dismiss(toastId);

  const remaining = await queueGet();
  if (remaining.length === 0) {
    if (synced > 0) {
      toast.success(`✓ Synced ${synced} change${synced > 1 ? "s" : ""} to the server.`);
    }
  }

  return synced;
};

const replayMutation = async (client: ConvexHttpClient, item: QueuedMutation) => {
  switch (item.type) {
    case "create":
      await client.mutation(api.refine.create, {
        resource: item.resource,
        variables: item.variables ?? {},
      });
      break;
    case "update":
      if (!item.recordId) throw new Error("update missing recordId");
      await client.mutation(api.refine.update, {
        resource: item.resource,
        id: item.recordId,
        variables: item.variables ?? {},
      });
      break;
    case "deleteOne":
      if (!item.recordId) throw new Error("deleteOne missing recordId");
      await client.mutation(api.refine.deleteOne, {
        resource: item.resource,
        id: item.recordId,
      });
      break;
    default:
      throw new Error(`Unknown mutation type: ${(item as QueuedMutation).type}`);
  }
};

// ─── Bootstrap — attach window listeners once ───────────────

let _client: ConvexHttpClient | null = null;
let _bootstrapped = false;

export const bootstrapSyncEngine = (client: ConvexHttpClient) => {
  if (_bootstrapped) return;
  _bootstrapped = true;
  _client = client;

  window.addEventListener("online", () => {
    if (_client) syncOfflineQueue(_client);
  });

  // Initial sync attempt after 2s (Convex WS may not be ready immediately)
  setTimeout(() => {
    if (_client) syncOfflineQueue(_client);
  }, 2000);
};

export const triggerSync = () => {
  if (_client && navigator.onLine) return syncOfflineQueue(_client);
  return Promise.resolve(0);
};
