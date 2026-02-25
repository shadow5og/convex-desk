import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import type { LaundryOrder } from "@/shared/types";
import { Eye, Pencil, Trash2 } from "lucide-react";
import React from "react";

interface OrderTableProps {
    orders: LaundryOrder[];
    isLoading: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, isLoading }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {orders.map((order) => (
                <TableRow key={order._id}>
                    <TableCell className="font-medium font-mono text-xs">{order._id.substring(0, 8)}</TableCell>
                    <TableCell className="capitalize">{order.type}</TableCell>
                    <TableCell>
                        <Badge
                            variant={order.status === "completed" ? "secondary" : "default"}
                            className={
                                order.status === "completed"
                                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                            }
                        >
                            {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">${order.totalAmount}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            ))}
            {orders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                        {isLoading ? "Loading orders..." : "No orders found."}
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);
