import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getAdminToken, getAdminUser, getCurrentAdmin, loginAdmin, type AdminUser } from "./api";

interface AdminAuthState {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing admin session on mount
  useEffect(() => {
    const init = async () => {
      const token = getAdminToken();
      const storedAdmin = getAdminUser();

      if (!token || !storedAdmin) {
        setIsLoading(false);
        return;
      }

      // Verify token is still valid by fetching current admin
      try {
        const currentAdmin = await getCurrentAdmin();
        setAdmin(currentAdmin);
        // Update stored admin data
        localStorage.setItem("adminUser", JSON.stringify(currentAdmin));
      } catch {
        // Token expired or invalid, clear storage
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { admin: adminData, session } = await loginAdmin(email, password);
    localStorage.setItem("adminToken", session.accessToken);
    localStorage.setItem("adminUser", JSON.stringify(adminData));
    setAdmin(adminData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
    // Force navigation to admin login
    window.location.href = "/admin/login";
  }, []);

  const refreshAdmin = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setAdmin(null);
      return;
    }
    try {
      const currentAdmin = await getCurrentAdmin();
      setAdmin(currentAdmin);
      localStorage.setItem("adminUser", JSON.stringify(currentAdmin));
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
        refreshAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthState {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

export function useIsSuperAdmin(): boolean {
  const { admin } = useAdminAuth();
  return admin?.role === "super_admin";
}
