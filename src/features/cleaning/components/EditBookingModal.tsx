import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CleaningBooking, CleaningStatus } from "@/shared/types";
import { useInvalidate, useUpdate } from "@refinedev/core";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditBookingModalProps {
  booking: CleaningBooking | null;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: CleaningStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const toLocalDatetimeValue = (ts: number) => {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, onClose }) => {
  const { mutate: update, isLoading } = useUpdate();
  const invalidate = useInvalidate();

  const [status, setStatus] = useState<CleaningStatus>("pending");
  const [scheduledAt, setScheduledAt] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setScheduledAt(toLocalDatetimeValue(booking.scheduledAt));
      setAddress(booking.address);
      setNotes(booking.notes ?? "");
      setTotalAmount(booking.totalAmount);
    }
  }, [booking]);

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    update(
      {
        resource: "cleaningBookings",
        id: booking._id,
        values: {
          status,
          scheduledAt: new Date(scheduledAt).getTime(),
          address,
          notes: notes || undefined,
          totalAmount,
        },
      },
      {
        onSuccess: () => {
          if (!navigator.onLine) {
            toast.info("Changes saved offline — will sync when back online.");
          } else {
            toast.success("Booking updated!");
          }
          invalidate({ resource: "cleaningBookings", invalidates: ["list"] });
          onClose();
        },
        onError: (err) => toast.error(`Update failed: ${err.message}`),
      }
    );
  };

  const typeLabel = booking.type.replace(/_/g, " ");

  return (
    <Dialog open={!!booking} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Edit {typeLabel} Booking{" "}
            <span className="font-mono text-sm text-muted-foreground">
              #{booking._id.substring(0, 8)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={status}
              onChange={(e) => setStatus(e.target.value as CleaningStatus)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scheduled date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Scheduled Date & Time</label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Service Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Service address"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Total Price ($)</label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
            />
          </div>

          {/* Info strip */}
          <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="capitalize font-medium">{typeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{booking.estimatedDuration}h</span>
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
