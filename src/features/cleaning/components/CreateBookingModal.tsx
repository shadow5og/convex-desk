import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CleaningType } from "@/shared/types";
import { useCreate, useInvalidate } from "@refinedev/core";
import React, { useState } from "react";
import { toast } from "sonner";

interface CreateBookingModalProps {
  open: boolean;
  onClose: () => void;
}

const CLEANING_TYPES: { value: CleaningType; label: string; description: string; basePrice: number; baseDuration: number }[] = [
  { value: "standard", label: "Standard Clean", description: "Regular upkeep for tidy homes", basePrice: 80, baseDuration: 2 },
  { value: "deep", label: "Deep Clean", description: "Thorough scrub — top to bottom", basePrice: 150, baseDuration: 4 },
  { value: "move_out", label: "Move-Out Clean", description: "Leave your old place spotless", basePrice: 200, baseDuration: 5 },
  { value: "custom", label: "Custom", description: "Tell us what you need", basePrice: 0, baseDuration: 2 },
];

const toLocalDatetimeValue = (ts: number) => {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({ open, onClose }) => {
  const { mutate: create, isLoading } = useCreate();
  const invalidate = useInvalidate();

  const tomorrow = Date.now() + 86_400_000;

  const [type, setType] = useState<CleaningType>("standard");
  const [customText, setCustomText] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledAt, setScheduledAt] = useState(toLocalDatetimeValue(tomorrow));
  const [totalAmount, setTotalAmount] = useState(80);
  const [estimatedDuration, setEstimatedDuration] = useState(2);

  const handleTypeChange = (t: CleaningType) => {
    const preset = CLEANING_TYPES.find((ct) => ct.value === t)!;
    setType(t);
    if (preset.basePrice > 0) setTotalAmount(preset.basePrice);
    setEstimatedDuration(preset.baseDuration);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      toast.error("Please enter a service address.");
      return;
    }

    if (type === "custom" && !customText.trim()) {
      toast.error("Please describe what you need for a custom booking.");
      return;
    }

    create(
      {
        resource: "cleaningBookings",
        values: {
          type,
          customText: type === "custom" ? customText : undefined,
          scheduledAt: new Date(scheduledAt).getTime(),
          address,
          notes: notes || undefined,
          totalAmount,
          estimatedDuration,
          status: "pending",
        },
      },
      {
        onSuccess: () => {
          if (!navigator.onLine) {
            toast.info("Booking saved offline — will sync when you're back online.");
          } else {
            toast.success("Cleaning booking confirmed!");
          }
          invalidate({ resource: "cleaningBookings", invalidates: ["list"] });
          handleClose();
        },
        onError: (err) => toast.error(`Failed to book: ${err.message}`),
      }
    );
  };

  const handleClose = () => {
    setType("standard");
    setCustomText("");
    setAddress("");
    setNotes("");
    setScheduledAt(toLocalDatetimeValue(tomorrow));
    setTotalAmount(80);
    setEstimatedDuration(2);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Cleaning Service</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">

          {/* Service Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Service Type</label>
            <div className="grid grid-cols-2 gap-2">
              {CLEANING_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => handleTypeChange(ct.value)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    type === ct.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-white hover:bg-muted/50"
                  }`}
                >
                  <p className="text-sm font-semibold">{ct.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{ct.description}</p>
                  {ct.basePrice > 0 && (
                    <p className="text-xs font-bold text-primary mt-1">from ${ct.basePrice}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom description */}
          {type === "custom" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Describe what you need</label>
              <Input
                placeholder="e.g. Kitchen deep clean + oven scrub"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                required
              />
            </div>
          )}

          {/* Scheduled date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Preferred Date & Time</label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              min={toLocalDatetimeValue(Date.now() + 3_600_000)}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Service Address</label>
            <Input
              placeholder="123 Main St, Apartment 4B, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Pricing & Duration row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Total Price ($)</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Est. Duration (hrs)</label>
              <Input
                type="number"
                min={1}
                max={12}
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Input
              placeholder="e.g. Have a dog, use fragrance-free products..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Summary chip */}
          <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated total</span>
            <span className="font-bold text-primary text-lg">${totalAmount.toFixed(2)}</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Booking…" : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
