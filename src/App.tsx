import "./index.css";

import { Refine, Authenticated as RefineAuthenticated } from "@refinedev/core";
import routerBindings, {
  CatchAllNavigate,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { Authenticated as ConvexAuthenticated, Unauthenticated as ConvexUnauthenticated } from "convex/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster } from "sonner";
import { SignInForm } from "./SignInForm";
import { Layout } from "./components/layout";
import { Dashboard } from "./pages/Dashboard";
import { LaundryList } from "./pages/laundry/list";
import { authProvider } from "./providers/auth-provider";
import { convexDataProvider } from "./providers/convex-data-provider";

export default function App() {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={convexDataProvider()}
        authProvider={authProvider}
        routerProvider={routerBindings}
        resources={[
          {
            name: "dashboard",
            list: "/",
            meta: {
              label: "Dashboard",
            },
          },
          {
            name: "laundryOrders",
            list: "/laundry",
            meta: {
              label: "Laundry Orders",
            },
          },
          {
            name: "cleaningBookings",
            list: "/cleaning",
            meta: {
              label: "Cleaning Bookings",
            },
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
      >
        <Routes>
          <Route
            element={
              <RefineAuthenticated
                key="authenticated-routes"
                fallback={<CatchAllNavigate to="/login" />}
              >
                <ConvexAuthenticated>
                    <Layout />
                </ConvexAuthenticated>
              </RefineAuthenticated>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/laundry">
              <Route index element={<LaundryList />} />
            </Route>
            <Route path="/cleaning">
              <Route index element={
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border-none">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-1.9a2.44 2.44 0 0 0 0-3.4l-1.6-1.6a.9.9 0 0 1 0-1.2l1.1-1.1a.9.9 0 0 1 1.2 0l1.6 1.6a2.44 2.44 0 0 0 3.4 0L15 9.1m4.8-1.5L21 6.1a.9.9 0 0 0 0-1.2l-3-3a.9.9 0 0 0-1.2 0l-1.5 1.5"/></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Cleaning Bookings</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm">This section is currently under construction. Stay tuned for professional cleaning management tools!</p>
                </div>
              } />
            </Route>
            <Route path="*" element={<CatchAllNavigate to="/" />} />
          </Route>

          <Route
            path="/login"
            element={
              <ConvexUnauthenticated>
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
                  <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">LaundryClean Pro</h1>
                    <p className="text-slate-500 mt-3 font-medium">Elevate your cleaning business management.</p>
                  </div>
                  <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/60 transition-all hover:shadow-2xl border border-slate-100">
                    <SignInForm />
                  </div>
                </div>
              </ConvexUnauthenticated>
            }
          />
        </Routes>
        <UnsavedChangesNotifier />
      </Refine>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}
