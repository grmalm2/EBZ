import { useState } from "react";
import { Link } from "wouter";
import {
  useAdminBusinesses,
  useVerifyBusinessMutation,
  useDeleteBusinessMutation,
  type Business,
} from "@/lib/admin";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminRouteGuard } from "@/components/admin/route-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  CheckCircle2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  ShieldCheck,
  Search,
  X,
  MapPin,
  Globe,
  Phone,
  Mail,
} from "lucide-react";

function BusinessDetailDialog({
  business,
  open,
  onClose,
}: {
  business: Business | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!business) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{business.nameEn}</DialogTitle>
          <DialogDescription>Business details and information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {business.logoUrl && (
            <div className="w-full h-48 rounded-xl overflow-hidden bg-muted">
              <img
                src={business.logoUrl}
                alt={business.nameEn}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge className={business.verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
              {business.verified ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</> : <><Clock className="w-3 h-3 mr-1" /> Pending</>}
            </Badge>
            {business.featured && (
              <Badge className="bg-purple-100 text-purple-700">Featured</Badge>
            )}
            {business.categoryNameEn && (
              <Badge variant="outline">{business.categoryNameEn}</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {business.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{business.email}</span>
              </div>
            )}
            {business.website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span className="truncate">{business.website}</span>
              </div>
            )}
            {business.city && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{business.city}{business.subcity ? `, ${business.subcity}` : ""}</span>
              </div>
            )}
          </div>

          {business.address && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <span className="font-medium text-foreground">Address:</span> {business.address}
            </p>
          )}

          {business.descriptionEn && (
            <div>
              <h4 className="font-medium text-sm mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{business.descriptionEn}</p>
            </div>
          )}

          {business.services && business.services.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Services</h4>
              <div className="flex flex-wrap gap-1.5">
                {business.services.map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {business.products && business.products.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Products</h4>
              <div className="flex flex-wrap gap-1.5">
                {business.products.map((p, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                ))}
              </div>
            </div>
          )}

          {business.socialLinks && Object.keys(business.socialLinks).length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Social Links</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(business.socialLinks).filter(([, v]) => v).map(([key, value]) => (
                  <a
                    key={key}
                    href={value || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline capitalize"
                  >
                    {key}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BusinessesContent() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const verified = filter === "verified" ? true : filter === "pending" ? false : undefined;

  const { data, isLoading, refetch } = useAdminBusinesses({
    q: q || undefined,
    verified,
    page,
    limit: 20,
  });

  const verifyMutation = useVerifyBusinessMutation();
  const deleteMutation = useDeleteBusinessMutation();

  const businesses = data?.businesses ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleVerify = (id: number) => {
    verifyMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Business verified successfully!" });
          refetch();
        },
        onError: (err: any) => {
          toast({
            title: "Error verifying business",
            description: err?.message || "Please try again",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Business deleted" });
          refetch();
        },
        onError: (err: any) => {
          toast({
            title: "Error deleting business",
            description: err?.message || "Please try again",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setQ("");
    setPage(1);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manage Businesses</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {total.toLocaleString()} businesses total &middot; Review, verify, and manage submissions
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search businesses..."
                  className="w-64 pl-9"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter("all"); setPage(1); }}
              className="gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" /> All
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter("pending"); setPage(1); }}
              className="gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> Pending
            </Button>
            <Button
              variant={filter === "verified" ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter("verified"); setPage(1); }}
              className="gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-card rounded-xl border border-dashed">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No businesses found</p>
            <p className="text-sm mt-1">
              {q ? "Try adjusting your search or filters" : "Businesses will appear here once submitted"}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Business
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                        Location
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                        Category
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((biz: Business, i: number) => (
                      <tr
                        key={biz.id}
                        className={`border-t hover:bg-muted/30 transition-colors ${
                          i % 2 === 0 ? "bg-background" : "bg-muted/10"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              {biz.logoUrl ? (
                                <img
                                  src={biz.logoUrl}
                                  alt={biz.nameEn}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{biz.nameEn}</div>
                              {biz.email && (
                                <div className="text-xs text-muted-foreground truncate">{biz.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                          {biz.city}
                          {biz.subcity ? `, ${biz.subcity}` : ""}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          {biz.categoryNameEn && (
                            <Badge variant="secondary" className="text-xs">
                              {biz.categoryNameEn}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          {biz.verified ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 text-xs">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-yellow-600 border-yellow-300 bg-yellow-50 text-xs"
                            >
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedBusiness(biz)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!biz.verified && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleVerify(biz.id)}
                                disabled={verifyMutation.isPending}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(biz.id, biz.nameEn)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} &middot; {total} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Business Detail Dialog */}
      <BusinessDetailDialog
        business={selectedBusiness}
        open={!!selectedBusiness}
        onClose={() => setSelectedBusiness(null)}
      />
    </AdminLayout>
  );
}

export default function AdminBusinesses() {
  return (
    <AdminRouteGuard>
      <BusinessesContent />
    </AdminRouteGuard>
  );
}
