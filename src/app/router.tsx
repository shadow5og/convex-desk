import { Authenticated as RefineAuthenticated } from "@refinedev/core";
import { CatchAllNavigate, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { Authenticated as ConvexAuthenticated, Unauthenticated as ConvexUnauthenticated } from "convex/react";
import React from "react";
import { Route, Routes } from "react-router-dom";

import { LoginPage } from "@/features/auth";
import { CleaningPage } from "@/features/cleaning";
import { DashboardPage } from "@/features/dashboard";
import { LaundryListPage } from "@/features/laundry";
import { AppLayout } from "@/shared/components/layout";

export const AppRouter: React.FC = () => (
    <>
        <Routes>
            <Route
                element={
                    <RefineAuthenticated key="authenticated-routes" fallback={<CatchAllNavigate to="/login" />}>
                        <ConvexAuthenticated>
                            <AppLayout />
                        </ConvexAuthenticated>
                    </RefineAuthenticated>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="/laundry" element={<LaundryListPage />} />
                <Route path="/cleaning" element={<CleaningPage />} />
                <Route path="*" element={<CatchAllNavigate to="/" />} />
            </Route>

            <Route
                path="/login"
                element={
                    <ConvexUnauthenticated>
                        <LoginPage />
                    </ConvexUnauthenticated>
                }
            />
        </Routes>
        <UnsavedChangesNotifier />
    </>
);
