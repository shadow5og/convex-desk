// ─── Domain Types ───────────────────────────────────────────

export type LaundryOrderType = "delivery" | "shop_drop";

export type LaundryOrderStatus =
  | "scheduled"
  | "collected"
  | "washing"
  | "washing_completed"
  | "folding"
  | "folding_completed"
  | "delivery_ready"
  | "completed";

export interface LaundryItem {
  type: string;
  quantity: number;
  price: number;
}

export interface LaundryOrder {
  _id: string;
  _creationTime: number;
  userId: string;
  type: LaundryOrderType;
  status: LaundryOrderStatus;
  items: LaundryItem[];
  totalAmount: number;
  scheduledAt?: number;
  address?: string;
  notes?: string;
}

export type CleaningType = "standard" | "deep" | "move_out" | "custom";

export type CleaningStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface CleaningBooking {
  _id: string;
  _creationTime: number;
  userId: string;
  type: CleaningType;
  customText?: string;
  scheduledAt: number;
  address: string;
  status: CleaningStatus;
  assignedStaffId?: string;
  estimatedDuration: number;
  totalAmount: number;
  notes?: string;
}

export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  _id: string;
  _creationTime: number;
  orderId?: string;
  cleaningBookingId?: string;
  machineId?: string;
  userId: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod?: string;
  transactionDate: number;
}

export type NotificationType = "laundry" | "cleaning" | "general";

export interface Notification {
  _id: string;
  _creationTime: number;
  userId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedOrderId?: string;
  relatedBookingId?: string;
}

export type MachineType = "washer" | "dryer";
export type MachineStatus = "idle" | "running" | "maintenance";

export interface Machine {
  _id: string;
  _creationTime: number;
  barcode: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  currentOrderId?: string;
  estimatedCompletionTime?: number;
}

// ─── UI Types ───────────────────────────────────────────────

export interface UserIdentity {
  id: string;
  name: string;
  avatar: string;
}

export interface DashboardData {
  activeOrders: LaundryOrder[];
  activeBookings: CleaningBooking[];
  unreadNotifications: Notification[];
  recentTransactions: Transaction[];
}
