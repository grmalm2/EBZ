import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/lib/admin";
import { Loader2 } from "lucide-react";

interface AdminRouteGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export function AdminRouteGuard({ children, requireSuperAdmin = false }: AdminRouteGuardProps) {
  const { isAuthenticated, isLoading, admin } = useAdminAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && requireSuperAdmin && admin?.role !== "super_admin") {
      setLocation("/admin");
    }
  }, [isLoading, isAuthenticated, requireSuperAdmin, admin, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireSuperAdmin && admin?.role !== "super_admin") {
    return null;
  }

  return <>{children}</>;
}
