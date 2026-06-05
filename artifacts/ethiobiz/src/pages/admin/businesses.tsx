import { useState } from "react";
import { Link } from "wouter";
import { useListBusinesses, useVerifyBusiness, useDeleteBusiness } from "@workspace/api-client-react";
import { Building2, CheckCircle2, Trash2, Eye, ArrowLeft, ChevronLeft, ChevronRight, Filter, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AdminBusinesses() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");

  const { data, isLoading, refetch } = useListBusinesses({
    q: q || undefined,
    verified: (filter === "verified" ? true : filter === "pending" ? false : undefined) as any,
    page: page as any,
    limit: 20 as any,
  } as any);
  const { mutate: verify } = useVerifyBusiness();
  const { mutate: deleteBiz } = useDeleteBusiness();

  const businesses = data?.businesses ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleVerify = (id: string) => {
    verify({ id: parseInt(id, 10) }, {
      onSuccess: () => { toast({ title: "Business verified!" }); refetch(); },
      onError: () => toast({ title: "Error verifying", variant: "destructive" }),
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteBiz({ id: parseInt(id, 10) }, {
      onSuccess: () => { toast({ title: "Business deleted" }); refetch(); },
      onError: () => toast({ title: "Error deleting", variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b py-6">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-3 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif font-bold">Manage Businesses</h1>
            <form onSubmit={(e) => { e.preventDefault(); setQ(searchInput); setPage(1); }} className="flex gap-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search businesses..."
                className="w-56"
              />
              <Button type="submit" variant="outline">Search</Button>
            </form>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter("all"); setPage(1); }}
              className="gap-1"
            >
              <Filter className="w-3.5 h-3.5" /> All
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter("pending"); setPage(1); }}
              className="gap-1"
            >
              <Clock className="w-3.5 h-3.5" /> Pending
            </Button>
            <Button
              variant={filter === "verified" ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilter("verified"); setPage(1); }}
              className="gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No businesses found</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Business</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Location</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">Category</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((biz: any, i: number) => (
                  <tr key={biz.id} className={`border-t ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                    <td className="p-4">
                      <div className="font-medium text-sm">{biz.nameEn}</div>
                      {biz.email && <div className="text-xs text-muted-foreground">{biz.email}</div>}
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                      {biz.city}{biz.subcity ? `, ${biz.subcity}` : ""}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {biz.categoryNameEn && <Badge variant="secondary" className="text-xs">{biz.categoryNameEn}</Badge>}
                    </td>
                    <td className="p-4">
                      {biz.verified ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">Pending</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/businesses/${biz.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {!biz.verified && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleVerify(String(biz.id))}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(String(biz.id), biz.nameEn)}
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
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
