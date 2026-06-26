import { Link, useLocation } from "wouter";
import { useAdminAuth, useIsSuperAdmin } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Megaphone,
  FolderTree,
  Menu,
  X,
  Crown,
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/ads", label: "Advertisements", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/manage-admins", label: "Manage Admins", icon: Shield, superAdminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAdminAuth();
  const isSuperAdmin = useIsSuperAdmin();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredNavItems = navItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  const sidebarWidth = collapsed ? "w-20" : "w-72";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden bg-card border rounded-lg p-2 shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-card border-r z-40 flex flex-col transition-all duration-300 ${sidebarWidth} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b shrink-0">
          <Link href="/admin" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-serif font-bold text-lg shadow-lg shadow-primary/20 shrink-0">
              E
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="font-serif font-bold text-lg tracking-tight">
                  EthiooBiz
                </span>
                <span className="text-[10px] block text-muted-foreground -mt-1 uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 hover:bg-muted rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 hover:bg-muted rounded-md transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4 space-y-3 shrink-0">
          {/* Admin user info */}
          <div
            className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {(admin?.firstName?.[0] || admin?.email?.[0] || "A").toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {admin?.firstName && admin?.lastName
                    ? `${admin.firstName} ${admin.lastName}`
                    : admin?.email}
                </p>
                <div className="flex items-center gap-1.5">
                  {isSuperAdmin ? (
                    <>
                      <Crown className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600 font-medium">
                        Super Admin
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground capitalize">
                      {admin?.role?.replace("_", " ")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {!collapsed && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <Link href="/" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back to Site
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </>
          )}
          {collapsed && (
            <div className="flex flex-col items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="lg:pt-0 pt-16">{children}</div>
      </main>
    </div>
  );
}
