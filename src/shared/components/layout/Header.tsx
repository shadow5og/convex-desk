import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UserIdentity } from "@/shared/types";
import { useGetIdentity, useMenu } from "@refinedev/core";
import { Bell, Menu } from "lucide-react";
import React from "react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
    onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
    const { menuItems } = useMenu();
    const { data: identity } = useGetIdentity<UserIdentity>();
    const location = useLocation();

    const activeItem = menuItems.find((item) => item.route === location.pathname);
    const currentLabel = activeItem?.label || "Application";

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleMobileMenu}>
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
    );
};
