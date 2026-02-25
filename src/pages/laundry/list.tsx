import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useTable } from "@refinedev/core";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import React from "react";

export const LaundryList: React.FC = () => {
    // Basic Refine hook for listing data
    const { tableQueryResult } = useTable({
        resource: "laundryOrders",
    });

    const orders = tableQueryResult?.data?.data ?? [];

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div>
                    <CardTitle className="text-2xl font-bold">Laundry Orders</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Manage and track customer laundry requests.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Order
                </Button>
            </CardHeader>
            <CardContent>
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
                        {orders.map((order: any) => (
                            <TableRow key={order._id}>
                                <TableCell className="font-medium font-mono text-xs">
                                    {order._id.substring(0, 8)}
                                </TableCell>
                                <TableCell className="capitalize">{order.type}</TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={order.status === 'completed' ? 'secondary' : 'default'}
                                        className={order.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}
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
                                    {!tableQueryResult.data ? "Loading orders..." : "No orders found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
