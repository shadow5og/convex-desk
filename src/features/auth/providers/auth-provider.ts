import { convex } from "@/lib/convex-client";
import { AuthProvider } from "@refinedev/core";
import { api } from "../../../../convex/_generated/api";

export const authProvider: AuthProvider = {
  login: async () => ({
    success: true,
    redirectTo: "/",
  }),
  logout: async () => ({
    success: true,
    redirectTo: "/login",
  }),
  check: async () => {
    try {
      const user = await convex.query(api.auth.loggedInUser);
      return {
        authenticated: !!user,
        redirectTo: user ? undefined : "/login",
        logout: !user,
      };
    } catch {
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
    } catch {
      return null;
    }
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
