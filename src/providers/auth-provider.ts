import { AuthProvider } from "@refinedev/core";
import { api } from "../../convex/_generated/api";
import { convex } from "../lib/convex-client";

export const authProvider: AuthProvider = {
  login: async () => {
    // Login logic is handled by SignInForm directly with Convex.
    // Refine's useLogin will just return success to allow the flow.
    return {
      success: true,
      redirectTo: "/",
    };
  },
  logout: async () => {
    // Logout logic is partly handled in the UI (Layout.tsx) by calling Convex signOut.
    // This Refine logout ensures the Refine internal state is also cleared.
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    try {
      const user = await convex.query(api.auth.loggedInUser);
      return {
        authenticated: !!user,
        redirectTo: user ? undefined : "/login",
        logout: !user,
      };
    } catch (e) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    try {
      const user = await convex.query(api.auth.loggedInUser);
      if (!user) return null;
      return {
        id: user._id,
        name: user.name || user.email || "User",
        avatar: user.image || "https://i.pravatar.cc/150",
      };
    } catch (e) {
      return null;
    }
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
