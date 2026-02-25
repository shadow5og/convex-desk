/**
 * EditOrderModal — edit status/notes on an existing laundry order.
 * Works offline: changes are queued and synced when connectivity returns.
 */

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { LaundryOrder, LaundryOrderStatus } from "@/shared/types";
import { useInvalidate, useUpdate } from "@refinedev/core";
import React, { useState } from "react";
import { toast } from "sonner";

interface EditOrderModalProps {
  order: LaundryOrder | null;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: LaundryOrderStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "collected", label: "Collected" },
  { value: "washing", label: "Washing" },
  { value: "washing_completed", label: "Washing Completed" },
  { value: "folding", label: "Folding" },
  { value: "folding_completed", label: "Folding Completed" },
  { value: "delivery_ready", label: "Ready for Delivery" },
  { value: "completed", label: "Completed" },
];

export const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, onClose }) => {
  const { mutate: update, isLoading } = useUpdate();
  const invalidate = useInvalidate();

  const [status, setStatus] = useState<LaundryOrderStatus>(order?.status ?? "scheduled");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [address, setAddress] = useState(order?.address ?? "");

  // Sync state when order changes
  React.useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNotes(order.notes ?? "");
      setAddress(order.address ?? "");
    }
  }, [order]);

  if (!order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    update(
      {
        resource: "laundryOrders",
        id: order._id,
        values: {
          status,
          notes: notes || undefined,
          address: address || undefined,
        },
      },
      {
        onSuccess: () => {
          if (!navigator.onLine) {
            toast.info("Changes saved offline — will sync when back online.");
          } else {
            toast.success("Order updated!");
          }
          invalidate({ resource: "laundryOrders", invalidates: ["list"] });
          onClose();
        },
        onError: (err) => {
          toast.error(`Update failed: ${err.message}`);
        },
      }
    );
  };

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Order <span className="font-mono text-sm text-muted-foreground">#{order._id.substring(0, 8)}</span></DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={status}
              onChange={(e) => setStatus(e.target.value as LaundryOrderStatus)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          {order.type === "delivery" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Address</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
            />
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize font-medium">{order.type.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{order.items?.length ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
