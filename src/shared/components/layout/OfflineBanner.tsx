/**
 * OfflineBanner — shows at the top of the layout when offline.
 * Includes pending count badge and a manual "Sync Now" button.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNetworkStatus } from "@/shared/hooks/useNetworkStatus";
import { triggerSync } from "@/shared/lib/sync-engine";
import { CloudUpload, RefreshCw, WifiOff } from "lucide-react";
import React from "react";

export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingCount, refreshPending } = useNetworkStatus();
  const [syncing, setSyncing] = React.useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await triggerSync();
    await refreshPending();
    setSyncing(false);
  };

  // If online and nothing pending — render nothing
  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 text-sm font-medium transition-all",
        isOnline
          ? "bg-amber-50 text-amber-800 border-b border-amber-200"
          : "bg-red-50 text-red-800 border-b border-red-200"
      )}
    >
      <div className="flex items-center gap-2">
        <WifiOff size={15} className="shrink-0" />
        <span>
          {isOnline ? "Back online — " : "You're offline — "}
          {pendingCount > 0
            ? `${pendingCount} change${pendingCount > 1 ? "s" : ""} pending sync`
            : "No pending changes"}
        </span>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="bg-amber-200 text-amber-900 text-xs rounded-full px-2 py-0.5 font-semibold">
            {pendingCount} pending
          </span>
          {isOnline && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs border-amber-300 hover:bg-amber-100"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <CloudUpload size={12} />
              )}
              {syncing ? "Syncing…" : "Sync Now"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
