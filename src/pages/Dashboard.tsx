import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { Bell, Calendar, DollarSign, ShoppingBag } from "lucide-react";
import React from "react";
import { api } from "../../convex/_generated/api";

export const Dashboard: React.FC = () => {
    // We can still use Convex hooks alongside Refine
    const dashboardData = useQuery(api.dashboard.getUserDashboard);

    if (dashboardData === undefined) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (dashboardData === null) {
        return (
            <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-lg">
                Could not load dashboard data
            </div>
        );
    }

    const { 
        activeOrders = [], 
        activeBookings = [], 
        unreadNotifications = [], 
        recentTransactions = [] 
    } = dashboardData || {};

    const stats = [
        {
            title: "Active Orders",
            value: activeOrders?.length || 0,
            icon: ShoppingBag,
            description: "Laundry orders in progress"
        },
        {
            title: "Cleaning Bookings",
            value: activeBookings?.length || 0,
            icon: Calendar,
            description: "Upcoming cleaning sessions"
        },
        {
            title: "Unread Alerts",
            value: unreadNotifications?.length || 0,
            icon: Bell,
            description: "Notifications for you"
        },
        {
            title: "Recent Spending",
            value: `$${(recentTransactions || []).reduce((acc: number, t: any) => acc + (t.amount || 0), 0).toFixed(2)}`,
            icon: DollarSign,
            description: "Total of last 5 transactions"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground text-sm">Welcome back to LaundryClean Pro.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-primary" />
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Weekly Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[240px] flex flex-col items-center justify-center text-muted-foreground">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                            <DollarSign className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium italic">Spending and activity trends will be visualized here.</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {unreadNotifications.length > 0 ? (
                            unreadNotifications.slice(0, 3).map((n: any, i: number) => (
                                <div key={i} className="flex gap-4 p-3 rounded-lg bg-muted/30">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">{n.message}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(n._creationTime).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground italic text-sm">
                                All caught up! No unread alerts.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
