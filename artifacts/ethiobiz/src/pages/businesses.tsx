import { useState } from "react";
import { Link } from "wouter";
import { useI18n, getLocalizedField } from "@/lib/i18n";
import { useListBusinesses, useListCategories } from "@workspace/api-client-react";
import { Search, CheckCircle2, Building2, MapPin, Phone, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CITIES = ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Adama", "Jimma"];

export default function Businesses() {
  const { t, language } = useI18n();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [city, setCity] = useState<string>("");

  const { data: categoriesData } = useListCategories();
  const { data, isLoading } = useListBusinesses({
    q: q || undefined,
    categoryId: (categoryId ? parseInt(categoryId, 10) : undefined) as any,
    city: city || undefined,
    page: page as any,
    limit: 12 as any,
  } as any);

  const businesses = data?.businesses ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{t("businesses")}</h1>
          <p className="text-muted-foreground">Browse verified Ethiopian businesses across all industries</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-10"
            />
          </div>
          <Select value={categoryId} onValueChange={(v) => { setCategoryId(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-52">
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
          <Select value={city} onValueChange={(v) => { setCity(v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder={t("allCities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCities")}</SelectItem>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="shrink-0">{t("search")}</Button>
        </form>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">{t("noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz: any) => (
              <Link key={biz.id} href={`/businesses/${biz.id}`} className="group block">
                <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {biz.logoUrl ? (
                      <img src={biz.logoUrl} alt={getLocalizedField(biz, "name", language)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                        <Building2 className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    {biz.verified && (
                      <Badge className="absolute top-3 right-3 bg-green-500 text-white gap-1 hover:bg-green-500">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </Badge>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-snug">
                        {getLocalizedField(biz, "name", language)}
                      </h3>
                      {biz.categoryNameEn && (
                        <span className="text-xs text-muted-foreground">{getLocalizedField(biz, "categoryName", language)}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                      {getLocalizedField(biz, "description", language)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2 border-t">
                      {biz.city && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{biz.city}</span>
                      )}
                      {biz.phone && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{biz.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
