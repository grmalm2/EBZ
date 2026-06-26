import { useAdminAuth } from "@/lib/admin";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminRouteGuard } from "@/components/admin/route-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Shield,
  Mail,
  Calendar,
  Crown,
  UserCog,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function SettingsContent() {
  const { admin } = useAdminAuth();

  const isSuperAdmin = admin?.role === "super_admin";

  return (
    <AdminLayout>
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Admin account and platform settings
          </p>
        </div>
      </div>

      <div className="p-6 max-w-3xl space-y-6">
        {/* Account Info */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>Your admin account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Name</label>
                <p className="text-sm font-medium">
                  {admin?.firstName && admin?.lastName
                    ? `${admin.firstName} ${admin.lastName}`
                    : admin?.email?.split("@")[0] || "Admin"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Email</label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  {admin?.email}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Role</label>
                <div className="flex items-center gap-2">
                  {isSuperAdmin ? (
                    <>
                      <Crown className="w-4 h-4 text-amber-500" />
                      <Badge className="bg-amber-100 text-amber-700 border-amber-300">Super Admin</Badge>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-blue-500" />
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        {admin?.role?.replace("_", " ")?.replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Status</label>
                <div className="flex items-center gap-2">
                  {admin?.emailVerified ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700">Pending Verification</span>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Member Since</label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Last Login</label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Permissions
            </CardTitle>
            <CardDescription>Actions you can perform on this platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "View Dashboard", allowed: true },
                { label: "Manage Businesses (view, verify, delete)", allowed: true },
                { label: "View Users", allowed: true },
                { label: "Manage Categories", allowed: true },
                { label: "Manage Advertisements", allowed: true },
                { label: "View Analytics", allowed: true },
                { label: "Manage Admin Accounts", allowed: isSuperAdmin },
                { label: "Platform Settings", allowed: isSuperAdmin },
              ].map((perm) => (
                <div
                  key={perm.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <span className="text-sm">{perm.label}</span>
                  {perm.allowed ? (
                    <Badge className="bg-green-100 text-green-700 text-xs">Allowed</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Restricted</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {isSuperAdmin && (
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions for platform management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/10">
                <div>
                  <p className="font-medium text-sm">Reset Platform Data</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    This will permanently delete all business listings, users, and categories.
                  </p>
                </div>
                <Button variant="destructive" size="sm" disabled>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminSettings() {
  return (
    <AdminRouteGuard>
      <SettingsContent />
    </AdminRouteGuard>
  );
}
