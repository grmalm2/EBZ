import { Link } from "wouter";
import { useGetDashboardStats, useGetMe } from "@workspace/api-client-react";
import { Building2, CheckCircle2, Users, Megaphone, TrendingUp, ArrowRight, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: user } = useGetMe();
  const { data: stats, isLoading } = useGetDashboardStats();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">Please log in to access the admin dashboard.</p>
          <Link href="/login"><Button>Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage EthioBiz listings and activity</p>
            </div>
            <Link href="/admin/businesses">
              <Button className="gap-2">
                <Building2 className="w-4 h-4" />
                Manage Businesses
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard title="Total Businesses" value={stats?.totalBusinesses ?? 0} icon={Building2} color="bg-blue-100 text-blue-600" />
            <StatCard title="Verified" value={stats?.verifiedBusinesses ?? 0} icon={CheckCircle2} color="bg-green-100 text-green-600" />
            <StatCard title="Pending Claims" value={stats?.pendingClaims ?? 0} icon={TrendingUp} color="bg-yellow-100 text-yellow-600" />
            <StatCard title="Active Ads" value={stats?.activeAds ?? 0} icon={Megaphone} color="bg-purple-100 text-purple-600" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Businesses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {(stats?.recentBusinesses ?? []).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{b.nameEn}</p>
                          <p className="text-xs text-muted-foreground">{b.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {b.verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>}
                        <Link href={`/businesses/${b.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {(stats?.topCategories ?? []).map((c: any) => (
                    <div key={c.categoryId} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.nameEn}</span>
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">{c.count} businesses</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
