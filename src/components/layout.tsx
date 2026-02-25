import { useAuthActions } from "@convex-dev/auth/react";
import { useGetIdentity, useLogout, useMenu } from "@refinedev/core";
import {
    Bell,
    Calendar,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    ShoppingBag,
    User,
    X
} from "lucide-react";
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export const Layout: React.FC = () => {
    const { menuItems } = useMenu();
    const { mutate: logout } = useLogout();
    const { signOut } = useAuthActions();
    const { data: identity } = useGetIdentity<{ name: string; avatar: string }>();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const location = useLocation();

    const activeItem = menuItems.find(item => item.route === location.pathname);
    const currentLabel = activeItem?.label || "Application";

    const menuIcons: Record<string, any> = {
        dashboard: LayoutDashboard,
        laundryOrders: ShoppingBag,
        cleaningBookings: Calendar,
    };

    const handleLogout = async () => {
        try {
            await signOut();
            logout();
        } catch (error) {
            console.error("Logout failed:", error);
            // Even if signOut fails, try to clear Refine state
            logout();
        }
    };

    return (
        <div className="flex h-screen bg-muted/40 overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <ShoppingBag size={18} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">LaundryClean</h1>
                </div>
                
                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-1.5 py-4">
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
                    </div>
                </ScrollArea>

                <div className="p-4 mt-auto border-t space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden border-2 border-white shadow-sm">
                            {identity?.avatar ? (
                                <img src={identity.avatar} alt={identity.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{identity?.name || "Member"}</p>
                            <p className="text-[10px] text-muted-foreground truncate">Free Plan</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <Settings size={16} />
                        </Button>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <aside className="w-64 h-full bg-white animate-in slide-in-from-left duration-200 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 flex items-center justify-between border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                    <ShoppingBag size={18} />
                                </div>
                                <h1 className="text-xl font-bold">LaundryClean</h1>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                <X size={20} />
                            </Button>
                        </div>
                        <div className="p-4 space-y-1">
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
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={20} />
                        </Button>
                        <Separator orientation="vertical" className="h-6 hidden md:block" />
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">
                            {currentLabel}
                        </h2>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 mx-2" />
                        <Card className="flex items-center justify-center w-10 h-10 border shadow-sm cursor-pointer hover:bg-muted font-bold text-primary">
                            {identity?.name?.charAt(0) || "U"}
                        </Card>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
