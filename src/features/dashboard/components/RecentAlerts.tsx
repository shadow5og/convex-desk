import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Notification } from "@/shared/types";
import React from "react";

interface RecentAlertsProps {
    notifications: Notification[];
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({ notifications }) => (
    <Card className="col-span-3 border-none shadow-md bg-white/50 backdrop-blur-sm">
        <CardHeader>
            <CardTitle className="text-lg">Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {notifications.length > 0 ? (
                notifications.slice(0, 3).map((n, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(n._creationTime).toLocaleString()}
                            </p>
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
);
