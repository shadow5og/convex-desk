import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorCard, LoadingSpinner } from "@/shared/components/feedback";
import type { DashboardData } from "@/shared/types";
import { useQuery } from "convex/react";
import { DollarSign } from "lucide-react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { RecentAlerts } from "./RecentAlerts";
import { StatsGrid } from "./StatsGrid";

export const DashboardPage: React.FC = () => {
    const dashboardData = useQuery(api.dashboard.getUserDashboard) as DashboardData | null | undefined;

    if (dashboardData === undefined) return <LoadingSpinner message="Loading dashboard..." />;
    if (dashboardData === null) return <ErrorCard message="Could not load dashboard data" />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground text-sm">Welcome back to LaundryClean Pro.</p>
            </div>

            <StatsGrid data={dashboardData} />

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
                <RecentAlerts notifications={dashboardData.unreadNotifications} />
            </div>
        </div>
    );
};
