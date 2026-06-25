import { Link } from "wouter";
import { useAdminAuth, useAdminDashboardStats } from "@/lib/admin";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminRouteGuard } from "@/components/admin/route-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CheckCircle2,
  TrendingUp,
  Megaphone,
  Users,
  ArrowRight,
  Clock,
  MapPin,
  Shield,
  Activity,
  Eye,
} from "lucide-react";

// Stats card component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-border/60">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent business row
function BusinessRow({ business }: { business: any }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {business.nameEn}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{business.city}{business.subcity ? `, ${business.subcity}` : ""}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {business.verified ? (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 text-xs">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </Badge>
        ) : (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 text-xs">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        )}
        <Link href={`/businesses/${business.id}`}>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Top category row
function CategoryRow({ category }: { category: any }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm font-medium">{category.nameEn}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: "100%" }}
          />
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-medium min-w-[4rem] text-center">
          {category.count} biz
        </span>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { admin } = useAdminAuth();
  const { data: stats, isLoading } = useAdminDashboardStats();

  const verificationRate = stats
    ? stats.totalBusinesses > 0
      ? Math.round((stats.verifiedBusinesses / stats.totalBusinesses) * 100)
      : 0
    : 0;

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, {admin?.firstName || admin?.email?.split("@")[0] || "Admin"}. Here&apos;s what&apos;s happening with your platform.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/businesses">
                <Button className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Manage Businesses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Businesses"
              value={stats?.totalBusinesses?.toLocaleString() ?? 0}
              icon={Building2}
              color="bg-blue-100 text-blue-600"
              subtitle={`${stats?.verifiedBusinesses ?? 0} verified`}
            />
            <StatCard
              title="Verification Rate"
              value={`${verificationRate}%`}
              icon={CheckCircle2}
              color="bg-green-100 text-green-600"
              subtitle={`${stats?.verifiedBusinesses ?? 0} of ${stats?.totalBusinesses ?? 0}`}
            />
            <StatCard
              title="Pending Claims"
              value={stats?.pendingClaims ?? 0}
              icon={TrendingUp}
              color="bg-amber-100 text-amber-600"
              subtitle="Business ownership claims"
            />
            <StatCard
              title="Active Ads"
              value={stats?.activeAds ?? 0}
              icon={Megaphone}
              color="bg-purple-100 text-purple-600"
              subtitle={`${stats?.totalAds ?? 0} total ads`}
            />
          </div>
        )}

        {/* Secondary Stats */}
        {isLoading ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : (
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats?.totalUsers ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats?.totalBusinesses ? stats.totalBusinesses - stats.verifiedBusinesses : 0}</p>
                    <p className="text-xs text-muted-foreground">Pending Review</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats?.totalAds ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total Campaigns</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{verificationRate}%</p>
                    <p className="text-xs text-muted-foreground">Trust Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Businesses */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Businesses</CardTitle>
                  <CardDescription>Latest business submissions</CardDescription>
                </div>
                <Link href="/admin/businesses">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View All <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : stats?.recentBusinesses && stats.recentBusinesses.length > 0 ? (
                <div>
                  {stats.recentBusinesses.slice(0, 8).map((b: any) => (
                    <BusinessRow key={b.id} business={b} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No businesses yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Top Categories</CardTitle>
                  <CardDescription>Most popular business categories</CardDescription>
                </div>
                <Link href="/admin/categories">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    Manage <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded-lg" />
                  ))}
                </div>
              ) : stats?.topCategories && stats.topCategories.length > 0 ? (
                <div>
                  {stats.topCategories.map((c: any) => (
                    <CategoryRow key={c.categoryId} category={c} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No category data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminDashboard() {
  return (
    <AdminRouteGuard>
      <DashboardContent />
    </AdminRouteGuard>
  );
}
