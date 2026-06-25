import { useListAds } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminRouteGuard } from "@/components/admin/route-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, Calendar, Eye } from "lucide-react";

function AdsContent() {
  const { data: ads, isLoading } = useListAds();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout>
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold tracking-tight">Advertisements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage ad campaigns and banner placements
          </p>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !ads || ads.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No advertisements yet</p>
                <p className="text-sm mt-1">Ads will appear here once created</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ads.map((ad: any) => (
              <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {ad.imageUrl && (
                  <div className="w-full h-40 bg-muted overflow-hidden">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{ad.title}</h3>
                    <Badge variant="outline" className={`${getStatusBadge(ad.status)} text-xs`}>
                      {ad.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 capitalize">
                      <Megaphone className="w-3 h-3" />
                      {ad.type}
                    </span>
                    {ad.startsAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ad.startsAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {ad.linkUrl && (
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
                    >
                      <Eye className="w-3 h-3" />
                      View Link
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminAds() {
  return (
    <AdminRouteGuard>
      <AdsContent />
    </AdminRouteGuard>
  );
}
