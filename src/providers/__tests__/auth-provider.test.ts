import { beforeEach, describe, expect, it, vi } from "vitest";
import { convex } from "../../lib/convex-client";
import { authProvider } from "../auth-provider";

// Mock the convex client
vi.mock("../../lib/convex-client", () => ({
  convex: {
    query: vi.fn(),
  },
}));

describe("authProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("check", () => {
    it("should return authenticated: true when user is logged in", async () => {
      vi.mocked(convex.query).mockResolvedValueOnce({ _id: "user123", name: "Test User" });
      
      const result = await authProvider.check();
      
      expect(result.authenticated).toBe(true);
      expect(result.redirectTo).toBeUndefined();
    });

    it("should return authenticated: false and redirect when user is not logged in", async () => {
      vi.mocked(convex.query).mockResolvedValueOnce(null);
      
      const result = await authProvider.check();
      
      expect(result.authenticated).toBe(false);
      expect(result.redirectTo).toBe("/login");
    });

    it("should return authenticated: false when query fails", async () => {
      vi.mocked(convex.query).mockRejectedValueOnce(new Error("Network error"));
      
      const result = await authProvider.check();
      
      expect(result.authenticated).toBe(false);
      expect(result.redirectTo).toBe("/login");
    });
  });

  describe("getIdentity", () => {
    it("should return user info when logged in", async () => {
      vi.mocked(convex.query).mockResolvedValueOnce({ 
        _id: "user123", 
        name: "Test User",
        email: "test@example.com",
        image: "avatar.png"
      });
      
      const result = await authProvider.getIdentity();
      
      expect(result).toEqual({
        id: "user123",
        name: "Test User",
        avatar: "avatar.png"
      });
    });

    it("should use email as name if name is missing", async () => {
        vi.mocked(convex.query).mockResolvedValueOnce({ 
          _id: "user123", 
          email: "test@example.com",
        });
        
        const result = await authProvider.getIdentity();
        expect(result?.name).toBe("test@example.com");
    });

    it("should return null if not logged in", async () => {
      vi.mocked(convex.query).mockResolvedValueOnce(null);
      
      const result = await authProvider.getIdentity();
      
      expect(result).toBeNull();
    });
  });
});
