import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMenu } from "@refinedev/core";
import { Calendar, LayoutDashboard, ShoppingBag, X } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserMenu } from "./UserMenu";

const menuIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
    dashboard: LayoutDashboard,
    laundryOrders: ShoppingBag,
    cleaningBookings: Calendar,
};

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
    const { menuItems } = useMenu();
    const location = useLocation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={onClose}>
            <aside
                className="w-64 h-full flex flex-col bg-white animate-in slide-in-from-left duration-200 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 flex items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <ShoppingBag size={18} />
                        </div>
                        <h1 className="text-xl font-bold">LaundryClean</h1>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X size={20} />
                    </Button>
                </div>

                <ScrollArea className="flex-1">
                    <nav className="p-4 space-y-1">
                        {menuItems.map((item) => {
                            const Icon = menuIcons[item.name] || LayoutDashboard;
                            const isActive = location.pathname === item.route;
                            return (
                                <Link
                                    key={item.key}
                                    to={item.route ?? "/"}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg"
                                            : "text-muted-foreground hover:bg-muted"
                                    )}
                                    onClick={onClose}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </ScrollArea>

                <UserMenu />
            </aside>
        </div>
    );
};
