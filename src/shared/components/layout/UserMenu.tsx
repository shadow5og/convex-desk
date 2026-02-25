import { Button } from "@/components/ui/button";
import type { UserIdentity } from "@/shared/types";
import { useAuthActions } from "@convex-dev/auth/react";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { LogOut, Settings, User } from "lucide-react";
import React from "react";

export const UserMenu: React.FC = () => {
    const { mutate: logout } = useLogout();
    const { signOut } = useAuthActions();
    const { data: identity } = useGetIdentity<UserIdentity>();

    const handleLogout = async () => {
        try {
            await signOut();
            logout();
        } catch (error) {
            console.error("Logout failed:", error);
            logout();
        }
    };

    return (
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
    );
};
