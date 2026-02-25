import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import type { LaundryOrder } from "@/shared/types";
import { useDelete, useInvalidate, useTable } from "@refinedev/core";
import { Eye, LayoutGrid, List, Pencil, Plus, Trash2, WifiOff } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { CreateOrderModal } from "./CreateOrderModal";
import { EditOrderModal } from "./EditOrderModal";

// ─── Status colours ───────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  scheduled:         "bg-slate-100 text-slate-700",
  collected:         "bg-yellow-100 text-yellow-700",
  washing:           "bg-blue-100 text-blue-700",
  washing_completed: "bg-indigo-100 text-indigo-700",
  folding:           "bg-purple-100 text-purple-700",
  folding_completed: "bg-violet-100 text-violet-700",
  delivery_ready:    "bg-orange-100 text-orange-700",
  completed:         "bg-green-100 text-green-700",
};

const TYPE_EMOJI: Record<string, string> = {
  delivery:  "🚚",
  shop_drop: "🏪",
};

// ─── View-toggle helper ───────────────────────────────────────
type View = "table" | "cards";
const LS_KEY = "laundry_view";

const ViewToggle: React.FC<{ view: View; onChange: (v: View) => void }> = ({ view, onChange }) => (
  <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 gap-0.5">
    <button
      onClick={() => onChange("table")}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
        view === "table"
          ? "bg-white shadow text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <List size={14} />
      Table
    </button>
    <button
      onClick={() => onChange("cards")}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
        view === "cards"
          ? "bg-white shadow text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <LayoutGrid size={14} />
      Cards
    </button>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────
export const LaundryListPage: React.FC = () => {
  const { tableQueryResult } = useTable({ resource: "laundryOrders" });
  const { mutate: deleteOne } = useDelete();
  const invalidate = useInvalidate();

  const orders = (tableQueryResult?.data?.data ?? []) as LaundryOrder[];
  const isLoading = !tableQueryResult.data;

  const [showCreate, setShowCreate] = useState(false);
  const [editingOrder, setEditingOrder] = useState<LaundryOrder | null>(null);
  const [view, setView] = useState<View>(
    () => (localStorage.getItem(LS_KEY) as View | null) ?? "table"
  );

  const handleViewChange = (v: View) => {
    setView(v);
    localStorage.setItem(LS_KEY, v);
  };

  const handleDelete = (order: LaundryOrder) => {
    if (!confirm(`Delete order #${order._id.substring(0, 8)}?`)) return;
    deleteOne(
      { resource: "laundryOrders", id: order._id },
      {
        onSuccess: () => {
          if (!navigator.onLine) {
            toast.info("Delete queued — will sync when back online.");
          } else {
            toast.success("Order deleted.");
          }
          invalidate({ resource: "laundryOrders", invalidates: ["list"] });
        },
        onError: (err) => toast.error(`Delete failed: ${err.message}`),
      }
    );
  };

  return (
    <>
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
        {/* ── Header ─────────────────────────────────────── */}
        <CardHeader className="flex flex-row items-center justify-between pb-6 flex-wrap gap-3">
          <div>
            <CardTitle className="text-2xl font-bold">Laundry Orders</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track customer laundry requests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onChange={handleViewChange} />
            <Button className="gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* ── Table View ─────────────────────────────── */}
          {view === "table" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const isOffline = !!(order as Record<string, unknown>)._isOffline;
                  return (
                    <TableRow key={order._id} className={isOffline ? "opacity-70 italic" : ""}>
                      <TableCell className="font-medium font-mono text-xs">
                        {order._id.substring(0, 8)}
                        {isOffline && (
                          <WifiOff size={11} className="inline ml-1 text-amber-500" title="Saved offline" />
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        <span className="mr-1">{TYPE_EMOJI[order.type] ?? "📦"}</span>
                        {order.type?.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {order.items?.length
                          ? order.items.map((i) => `${i.type} ×${i.quantity}`).join(", ")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}
                        >
                          {order.status?.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">${order.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title="View"
                            onClick={() => toast.info(`Order: ${order._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title="Edit"
                            onClick={() => setEditingOrder(order)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            title="Delete"
                            onClick={() => handleDelete(order)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                      {isLoading ? "Loading orders…" : "No orders yet. Create your first one!"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* ── Cards View ─────────────────────────────── */}
          {view === "cards" && (
            <>
              {isLoading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
                  ))}
                </div>
              )}

              {!isLoading && orders.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[260px] text-center">
                  <p className="text-4xl mb-4">🧺</p>
                  <p className="font-semibold text-slate-700">No orders yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first laundry order to get started.</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => {
                  const isOffline = !!(order as Record<string, unknown>)._isOffline;
                  return (
                    <div
                      key={order._id}
                      className={`rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                        isOffline ? "ring-1 ring-amber-300" : ""
                      }`}
                    >
                      {/* Type header */}
                      <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50 text-sm font-semibold">
                        <span>{TYPE_EMOJI[order.type] ?? "📦"}</span>
                        <span className="capitalize">{order.type?.replace(/_/g, " ")}</span>
                        {isOffline && (
                          <WifiOff size={12} className="ml-auto text-amber-500" title="Saved offline" />
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className={`${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"} text-[11px] capitalize`}
                          >
                            {order.status?.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-sm font-bold text-primary">${order.totalAmount?.toFixed(2)}</span>
                        </div>

                        <div className="text-xs text-muted-foreground font-mono">
                          #{order._id.substring(0, 10)}
                        </div>

                        {order.items?.length > 0 && (
                          <ul className="text-xs text-slate-600 space-y-0.5">
                            {order.items.map((item, i) => (
                              <li key={i} className="flex justify-between">
                                <span>{item.type}</span>
                                <span className="text-muted-foreground">×{item.quantity} · ${item.price.toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {order.notes && (
                          <p className="text-xs italic text-muted-foreground border-t pt-2 line-clamp-2">
                            {order.notes}
                          </p>
                        )}

                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline" size="sm"
                            className="flex-1 gap-1.5 h-8 text-xs"
                            onClick={() => setEditingOrder(order)}
                          >
                            <Pencil size={12} /> Edit
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(order)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateOrderModal open={showCreate} onClose={() => setShowCreate(false)} />
      <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} />
    </>
  );
};
