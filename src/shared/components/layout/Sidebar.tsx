import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMenu } from "@refinedev/core";
import { Calendar, LayoutDashboard, ShoppingBag } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserMenu } from "./UserMenu";

const menuIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
    dashboard: LayoutDashboard,
    laundryOrders: ShoppingBag,
    cleaningBookings: Calendar,
};

export const Sidebar: React.FC = () => {
    const { menuItems } = useMenu();
    const location = useLocation();

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <ShoppingBag size={18} strokeWidth={2.5} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">LaundryClean</h1>
            </div>

            <ScrollArea className="flex-1 px-4">
                <nav className="space-y-1.5 py-4">
                    {menuItems.map((item) => {
                        const Icon = menuIcons[item.name] || LayoutDashboard;
                        const isActive = location.pathname === item.route;

                        return (
                            <Link
                                key={item.key}
                                to={item.route ?? "/"}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                                        : "text-muted-foreground hover:bg-muted hover:text-slate-900"
                                )}
                            >
                                <Icon size={18} className={cn(isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            <UserMenu />
        </aside>
    );
};
