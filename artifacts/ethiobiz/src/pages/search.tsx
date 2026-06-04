import { useState, useEffect } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { useI18n, getLocalizedField } from "@/lib/i18n";
import { useGlobalSearch, useListCategories } from "@workspace/api-client-react";
import { Search, CheckCircle2, Building2, MapPin, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const { t, language } = useI18n();
  const searchStr = useSearch();
  const [, setLocation] = useLocation();

  const params = new URLSearchParams(searchStr);
  const initialQ = params.get("q") ?? "";
  const initialCat = params.get("categoryId") ?? "";

  const [searchInput, setSearchInput] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  const [categoryId, setCategoryId] = useState(initialCat);
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useListCategories();
  const { data, isLoading } = useGlobalSearch({
    q: q || undefined,
    categoryId: categoryId || undefined,
    page: String(page),
    limit: "20",
  });

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (q) newParams.set("q", q);
    if (categoryId) newParams.set("categoryId", categoryId);
    setLocation(`/search?${newParams.toString()}`, { replace: true });
  }, [q, categoryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(searchInput);
    setPage(1);
  };

  const businesses = data?.businesses ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <form onSubmit={handleSearch} className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex-1 flex items-center gap-2 px-3 bg-gray-50 rounded-xl">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="border-0 bg-transparent focus-visible:ring-0 px-0 h-12 text-black placeholder:text-gray-400"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); setQ(""); }}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <Button type="submit" size="lg" className="h-12 px-6 rounded-xl">
              {t("search")}
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            {q && (
              <h1 className="text-xl font-semibold">
                Results for <span className="text-primary">&ldquo;{q}&rdquo;</span>
                <span className="text-muted-foreground font-normal text-base ml-2">({total} found)</span>
              </h1>
            )}
            {!q && <h1 className="text-xl font-semibold">All Businesses <span className="text-muted-foreground font-normal">({total})</span></h1>}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categoriesData?.map((cat: any) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {getLocalizedField(cat, "name", language)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">{t("noResults")}</p>
            <p className="text-sm mt-2">Try different keywords or browse all categories</p>
            <Link href="/businesses"><Button variant="outline" className="mt-6">Browse All</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((biz: any) => (
              <Link key={biz.id} href={`/businesses/${biz.id}`} className="group block">
                <div className="bg-card border rounded-xl hover:shadow-md transition-all p-5 flex gap-5 items-start">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {biz.logoUrl ? (
                      <img src={biz.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-muted-foreground opacity-30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {getLocalizedField(biz, "name", language)}
                      </h3>
                      {biz.verified && (
                        <Badge className="bg-green-500 text-white text-xs gap-1 hover:bg-green-500">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {getLocalizedField(biz, "description", language)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {biz.categoryNameEn && (
                        <Badge variant="secondary" className="text-xs">{getLocalizedField(biz, "categoryName", language)}</Badge>
                      )}
                      {biz.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{biz.city}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {(data?.totalPages ?? 1) > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {data?.totalPages}</span>
            <Button variant="outline" disabled={page === (data?.totalPages ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
