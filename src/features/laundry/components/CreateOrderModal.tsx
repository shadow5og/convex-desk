/**
 * CreateOrderModal — lets users create a laundry order while online or offline.
 * Uses Refine's useCreate which goes through our offline-aware data provider.
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
import type { LaundryItem, LaundryOrderType } from "@/shared/types";
import { useCreate, useInvalidate } from "@refinedev/core";
import React, { useState } from "react";
import { toast } from "sonner";

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
}

const ORDER_TYPES: { value: LaundryOrderType; label: string }[] = [
  { value: "delivery", label: "Delivery (pickup & drop-off)" },
  { value: "shop_drop", label: "Shop Drop" },
];

const DEFAULT_ITEM: LaundryItem = { type: "", quantity: 1, price: 0 };

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ open, onClose }) => {
  const { mutate: create, isLoading } = useCreate();
  const invalidate = useInvalidate();

  const [type, setType] = useState<LaundryOrderType>("delivery");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LaundryItem[]>([{ ...DEFAULT_ITEM }]);

  const updateItem = (index: number, field: keyof LaundryItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => setItems([...items, { ...DEFAULT_ITEM }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((item) => !item.type.trim())) {
      toast.error("Each item needs a description.");
      return;
    }

    create(
      {
        resource: "laundryOrders",
        values: {
          type,
          items,
          address: address || undefined,
          notes: notes || undefined,
          totalAmount,
          status: "scheduled",
          scheduledAt: Date.now(),
        },
      },
      {
        onSuccess: () => {
          const isOffline = !navigator.onLine;
          if (isOffline) {
            toast.info("Order saved offline — will sync when you're back online.");
          } else {
            toast.success("Order created successfully!");
          }
          invalidate({ resource: "laundryOrders", invalidates: ["list"] });
          handleClose();
        },
        onError: (err) => {
          toast.error(`Failed to create order: ${err.message}`);
        },
      }
    );
  };

  const handleClose = () => {
    setType("delivery");
    setAddress("");
    setNotes("");
    setItems([{ ...DEFAULT_ITEM }]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Laundry Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Order Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Order Type</label>
            <div className="flex gap-2">
              {ORDER_TYPES.map((ot) => (
                <button
                  key={ot.value}
                  type="button"
                  onClick={() => setType(ot.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    type === ot.value
                      ? "border-primary bg-primary text-primary-foreground shadow"
                      : "border-border bg-white text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {ot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Items</label>
              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="h-7 text-xs">
                + Add item
              </Button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_80px_32px] gap-2 items-center">
                <Input
                  placeholder="Item (e.g. Shirts)"
                  value={item.type}
                  onChange={(e) => updateItem(i, "type", e.target.value)}
                  required
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                />
                <Input
                  type="number"
                  placeholder="$ each"
                  min={0}
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                >
                  ×
                </Button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-right pt-1">
              Total: <span className="font-semibold text-slate-800">${totalAmount.toFixed(2)}</span>
            </p>
          </div>

          {/* Address (for delivery) */}
          {type === "delivery" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pickup Address</label>
              <Input
                placeholder="123 Main St, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Input
              placeholder="Any special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
