import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/shared/types";
import React from "react";

interface StatsGridProps {
    data: DashboardData;
}

const stats = (data: DashboardData) => [
    {
        title: "Active Orders",
        value: data.activeOrders.length,
        description: "Laundry orders in progress",
    },
    {
        title: "Cleaning Bookings",
        value: data.activeBookings.length,
        description: "Upcoming cleaning sessions",
    },
    {
        title: "Unread Alerts",
        value: data.unreadNotifications.length,
        description: "Notifications for you",
    },
    {
        title: "Recent Spending",
        value: `$${data.recentTransactions.reduce((acc, t) => acc + (t.amount || 0), 0).toFixed(2)}`,
        description: "Total of last 5 transactions",
    },
];

export const StatsGrid: React.FC<StatsGridProps> = ({ data }) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats(data).map((stat, index) => (
            <Card key={index} className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                        {stat.description}
                    </p>
                </CardContent>
            </Card>
        ))}
    </div>
);
