import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { CleaningBooking } from "@/shared/types";
import { useDelete, useInvalidate } from "@refinedev/core";
import { useQuery } from "convex/react";
import {
    Calendar, Clock, LayoutGrid, List, MapPin,
    Pencil, Plus, Trash2, WifiOff,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { CreateBookingModal } from "./CreateBookingModal";
import { EditBookingModal } from "./EditBookingModal";

// ─── Colours & icons ──────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending:     "bg-amber-100 text-amber-700",
  assigned:    "bg-blue-100 text-blue-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  completed:   "bg-green-100 text-green-700",
  cancelled:   "bg-red-100 text-red-600",
};

const TYPE_COLORS: Record<string, string> = {
  standard:  "bg-sky-50  text-sky-700  border-sky-200",
  deep:      "bg-violet-50 text-violet-700 border-violet-200",
  move_out:  "bg-orange-50 text-orange-700 border-orange-200",
  custom:    "bg-pink-50  text-pink-700  border-pink-200",
};

const TYPE_ICONS: Record<string, string> = {
  standard: "🧹",
  deep:     "🫧",
  move_out: "📦",
  custom:   "✨",
};

// ─── View toggle ─────────────────────────────────────────────
type View = "table" | "cards";
const LS_KEY = "cleaning_view";

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

// ─── Page ────────────────────────────────────────────────────
export const CleaningPage: React.FC = () => {
  const bookingsQuery = useQuery(api.cleaning.getUserBookings);
  const { mutate: deleteOne } = useDelete();
  const invalidate = useInvalidate();

  const bookings = (bookingsQuery ?? []) as CleaningBooking[];
  const isLoading = bookingsQuery === undefined;

  const [showCreate, setShowCreate] = useState(false);
  const [editingBooking, setEditingBooking] = useState<CleaningBooking | null>(null);
  const [view, setView] = useState<View>(
    () => (localStorage.getItem(LS_KEY) as View | null) ?? "cards"
  );

  const handleViewChange = (v: View) => {
    setView(v);
    localStorage.setItem(LS_KEY, v);
  };

  const handleDelete = (booking: CleaningBooking) => {
    if (!confirm(`Cancel booking #${booking._id.substring(0, 8)}?`)) return;
    deleteOne(
      { resource: "cleaningBookings", id: booking._id },
      {
        onSuccess: () => {
          if (!navigator.onLine) {
            toast.info("Cancellation queued — will sync when back online.");
          } else {
            toast.success("Booking cancelled.");
          }
          invalidate({ resource: "cleaningBookings", invalidates: ["list"] });
        },
        onError: (err) => toast.error(`Delete failed: ${err.message}`),
      }
    );
  };

  const upcoming = bookings.filter((b) => !["completed", "cancelled"].includes(b.status));
  const past     = bookings.filter((b) =>  ["completed", "cancelled"].includes(b.status));

  return (
    <>
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cleaning Bookings</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Book and manage professional cleaning services.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={handleViewChange} />
          <Button className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Book Cleaning
          </Button>
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────── */}
      {!isLoading && bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[360px] text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-md border">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-4xl">
            🧼
          </div>
          <h3 className="text-xl font-bold text-slate-900">No bookings yet</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm text-sm">
            Book your first professional cleaning session — works offline too!
          </p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Book a Cleaning
          </Button>
        </div>
      )}

      {/* ─────────────────── TABLE VIEW ─────────────────────── */}
      {view === "table" && bookings.length > 0 && (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[90px]">ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const isOffline = !!(booking as Record<string, unknown>)._isOffline;
                const icon = TYPE_ICONS[booking.type] ?? "🧹";
                return (
                  <TableRow key={booking._id} className={isOffline ? "opacity-70 italic" : ""}>
                    <TableCell className="font-mono text-xs">
                      {booking._id.substring(0, 8)}
                      {isOffline && (
                        <WifiOff size={11} className="inline ml-1 text-amber-500" title="Saved offline" />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="mr-1">{icon}</span>
                      <span className="capitalize">{booking.type.replace(/_/g, " ")}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${STATUS_COLORS[booking.status] ?? "bg-gray-100"} text-[11px] capitalize`}
                      >
                        {booking.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {new Date(booking.scheduledAt).toLocaleDateString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-sm max-w-[160px] truncate" title={booking.address}>
                      {booking.address}
                    </TableCell>
                    <TableCell className="text-sm">{booking.estimatedDuration}h</TableCell>
                    <TableCell className="font-semibold">${booking.totalAmount?.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Edit"
                          onClick={() => setEditingBooking(booking)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Cancel"
                          onClick={() => handleDelete(booking)}
                          disabled={booking.status === "completed"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ─────────────────── CARDS VIEW ─────────────────────── */}
      {view === "cards" && (
        <>
          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Upcoming ({upcoming.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onEdit={setEditingBooking}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Past ({past.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-70">
                {past.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onEdit={setEditingBooking}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Modals ───────────────────────────────────────────── */}
      <CreateBookingModal open={showCreate} onClose={() => setShowCreate(false)} />
      <EditBookingModal booking={editingBooking} onClose={() => setEditingBooking(null)} />
    </>
  );
};

// ─── Booking Card ─────────────────────────────────────────────
interface BookingCardProps {
  booking: CleaningBooking;
  onEdit: (b: CleaningBooking) => void;
  onDelete: (b: CleaningBooking) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onEdit, onDelete }) => {
  const isOffline = !!(booking as Record<string, unknown>)._isOffline;
  const typeColor = TYPE_COLORS[booking.type] ?? "bg-gray-50 text-gray-700 border-gray-200";
  const icon = TYPE_ICONS[booking.type] ?? "🧹";

  return (
    <div className={`rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
      isOffline ? "ring-1 ring-amber-300" : ""
    }`}>
      {/* Type header strip */}
      <div className={`flex items-center gap-2 px-4 py-3 border-b text-sm font-semibold capitalize ${typeColor}`}>
        <span className="text-base">{icon}</span>
        {booking.type.replace(/_/g, " ")} Clean
        {isOffline && (
          <WifiOff size={12} className="ml-auto text-amber-500" title="Saved offline — pending sync" />
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Status + Amount */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={`${STATUS_COLORS[booking.status] ?? "bg-gray-100 text-gray-600"} text-[11px] capitalize`}
          >
            {booking.status.replace(/_/g, " ")}
          </Badge>
          <span className="text-sm font-bold text-primary">${booking.totalAmount?.toFixed(2)}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={14} className="shrink-0" />
          <span>
            {new Date(booking.scheduledAt).toLocaleDateString(undefined, {
              weekday: "short", month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={14} className="shrink-0" />
          <span>{booking.estimatedDuration}h estimated</span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin size={14} className="shrink-0 mt-0.5" />
          <span className="line-clamp-1">{booking.address}</span>
        </div>

        {/* Custom text */}
        {booking.customText && (
          <p className="text-xs italic text-muted-foreground border-t pt-2">{booking.customText}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline" size="sm"
            className="flex-1 gap-1.5 h-8 text-xs"
            onClick={() => onEdit(booking)}
          >
            <Pencil size={12} />
            Edit
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(booking)}
            disabled={booking.status === "completed"}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
