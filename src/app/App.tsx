import { Refine } from "@refinedev/core";
import routerBindings from "@refinedev/react-router-v6";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import { authProvider } from "@/features/auth";
import { InstallPrompt } from "@/shared/components/pwa/InstallPrompt";
import { convexDataProvider } from "@/shared/providers/convex-data-provider";
import { useConvex } from "convex/react";
import { AppRouter } from "./router";

const resources = [
    {
        name: "dashboard",
        list: "/",
        meta: { label: "Dashboard" },
    },
    {
        name: "laundryOrders",
        list: "/laundry",
        meta: { label: "Laundry Orders" },
    },
    {
        name: "cleaningBookings",
        list: "/cleaning",
        meta: { label: "Cleaning Bookings" },
    },
];

export default function App() {
    const convexClient = useConvex();
    
    return (
        <BrowserRouter>
            <Refine
                dataProvider={convexDataProvider(convexClient)}
                authProvider={authProvider}
                routerProvider={routerBindings}
                resources={resources}
                options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                }}
            >
                <AppRouter />
            </Refine>
            <InstallPrompt />
            <Toaster position="top-center" richColors />
        </BrowserRouter>
    );
}
