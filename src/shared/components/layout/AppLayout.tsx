import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { MobileSidebar } from "./MobileSidebar";
import { OfflineBanner } from "./OfflineBanner";
import { Sidebar } from "./Sidebar";

export const AppLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="flex h-screen bg-muted/40 overflow-hidden">
            <Sidebar />
            <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />
                <OfflineBanner />

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
