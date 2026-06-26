import { useAdminCategoryList } from "@/lib/admin";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminRouteGuard } from "@/components/admin/route-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderTree, Building2 } from "lucide-react";

function CategoriesContent() {
  const { data: categories, isLoading } = useAdminCategoryList();

  return (
    <AdminLayout>
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage business categories and subcategories
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
        ) : !categories || categories.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No categories found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border overflow-hidden bg-card">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Slug</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Businesses</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Subcategories</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FolderTree className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{cat.nameEn}</p>
                          <p className="text-xs text-muted-foreground">{cat.nameAm}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{cat.slug}</td>
                    <td className="p-4 hidden md:table-cell">
                      <Badge variant="secondary" className="gap-1">
                        <Building2 className="w-3 h-3" />
                        {cat.businessCount}
                      </Badge>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {cat.children && cat.children.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cat.children.map((child: any) => (
                            <Badge key={child.id} variant="outline" className="text-xs">
                              {child.nameEn}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminCategories() {
  return (
    <AdminRouteGuard>
      <CategoriesContent />
    </AdminRouteGuard>
  );
}
