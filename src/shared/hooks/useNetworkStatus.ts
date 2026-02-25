/**
 * React hook for network status + pending mutation count.
 * Emits "online"/"offline" events and exposes pendingCount so the
 * UI can show a sync banner and badge.
 */

import { queueGet } from "@/shared/lib/offline-store";
import { useEffect, useState } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  pendingCount: number;
  refreshPending: () => Promise<void>;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = async () => {
    const q = await queueGet();
    setPendingCount(q.length);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Poll the queue count every 3s for simplicity
    const interval = setInterval(refreshPending, 3000);
    refreshPending(); // initial

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, pendingCount, refreshPending };
};
