/**
 * Offline Store — IndexedDB-backed persistence layer
 *
 * Three stores:
 *   - cache: server responses (getList / getOne results)
 *   - queue: pending mutations to replay when online
 *   - optimistic: local records created/updated offline (for immediate UI)
 */

const DB_NAME = "laundryclean_offline";
const DB_VERSION = 1;

export interface QueuedMutation {
  id: string; // uuid for deduplication
  type: "create" | "update" | "deleteOne";
  resource: string;
  variables?: Record<string, unknown>;
  recordId?: string; // used for update / delete / to match optimistic records
  tempId?: string; // for optimistic creates
  enqueuedAt: number;
  retries: number;
}

export interface OptimisticRecord {
  tempId: string;
  resource: string;
  data: Record<string, unknown>;
  createdAt: number;
}

// ─── Open DB ─────────────────────────────────────────────────

let _db: IDBDatabase | null = null;

export const openDB = (): Promise<IDBDatabase> => {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("cache")) {
        db.createObjectStore("cache", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("queue")) {
        db.createObjectStore("queue", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("optimistic")) {
        db.createObjectStore("optimistic", { keyPath: "tempId" });
      }
    };

    request.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };

    request.onerror = () => reject(request.error);
  });
};

// ─── Generic helpers ─────────────────────────────────────────

const idbGet = async <T>(store: string, key: string): Promise<T | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
};

const idbPut = async (store: string, value: unknown): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const idbDelete = async (store: string, key: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const idbGetAll = async <T>(store: string): Promise<T[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
};

const idbClear = async (store: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const req = tx.objectStore(store).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

// ─── Cache API ────────────────────────────────────────────────

export const cacheGet = (key: string) =>
  idbGet<{ key: string; data: unknown; savedAt: number }>("cache", key).then(
    (r) => r?.data
  );

export const cachePut = (key: string, data: unknown) =>
  idbPut("cache", { key, data, savedAt: Date.now() });

// ─── Queue API ────────────────────────────────────────────────

const nanoid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export const queueGet = () => idbGetAll<QueuedMutation>("queue");

export const queueAdd = (mutation: Omit<QueuedMutation, "id" | "enqueuedAt" | "retries">) =>
  idbPut("queue", {
    ...mutation,
    id: nanoid(),
    enqueuedAt: Date.now(),
    retries: 0,
  });

export const queueRemove = (id: string) => idbDelete("queue", id);

export const queueClear = () => idbClear("queue");

export const queueIncrementRetry = async (id: string) => {
  const item = await idbGet<QueuedMutation>("queue", id);
  if (item) await idbPut("queue", { ...item, retries: item.retries + 1 });
};

// ─── Optimistic Records API ──────────────────────────────────

export const optimisticGetAll = (resource: string) =>
  idbGetAll<OptimisticRecord>("optimistic").then((all) =>
    all.filter((r) => r.resource === resource)
  );

export const optimisticAdd = (resource: string, data: Record<string, unknown>) => {
  const tempId = "temp_" + nanoid();
  return idbPut("optimistic", {
    tempId,
    resource,
    data: { ...data, _id: tempId, _creationTime: Date.now(), _isOffline: true },
    createdAt: Date.now(),
  }).then(() => tempId);
};

export const optimisticUpdate = async (tempId: string, patch: Record<string, unknown>) => {
  const rec = await idbGet<OptimisticRecord>("optimistic", tempId);
  if (rec) {
    await idbPut("optimistic", { ...rec, data: { ...rec.data, ...patch } });
  }
};

export const optimisticRemove = (tempId: string) =>
  idbDelete("optimistic", tempId);

export const optimisticClear = (resource: string) =>
  optimisticGetAll(resource).then((recs) =>
    Promise.all(recs.map((r) => idbDelete("optimistic", r.tempId)))
  );
