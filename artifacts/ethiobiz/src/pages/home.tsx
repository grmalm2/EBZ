import { useI18n } from "@/lib/i18n";
import { useGlobalSearch, useGetFeaturedBusinesses, useGetRecentBusinesses, useGetActiveAds } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Search, Building2, Briefcase, Car, Globe, Handshake, Heart, Grid3x3, ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getLocalizedField } from "@/lib/i18n";

const featuredCategories = [
  { id: 1, name: "Real Estate", icon: Building2, color: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Jobs", icon: Briefcase, color: "bg-green-100 text-green-700" },
  { id: 3, name: "Cars", icon: Car, color: "bg-yellow-100 text-yellow-700" },
  { id: 4, name: "Import & Export", icon: Globe, color: "bg-purple-100 text-purple-700" },
  { id: 5, name: "Brokers", icon: Handshake, color: "bg-orange-100 text-orange-700" },
  { id: 6, name: "Clinics", icon: Heart, color: "bg-red-100 text-red-700" },
  { id: 7, name: "Miscellaneous", icon: Grid3x3, color: "bg-gray-100 text-gray-700" },
];

export default function Home() {
  const { t, language } = useI18n();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featured } = useGetFeaturedBusinesses();
  const { data: recent } = useGetRecentBusinesses();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight leading-tight">
            Discover Ethiopia's Thriving Business Network
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Find trusted professionals, explore opportunities, and connect with the heart of Ethiopian commerce.
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <Link href="/add-business">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary backdrop-blur-sm h-10 px-5">
                <Building2 className="w-4 h-4 mr-2" />
                Submit Your Business
              </Button>
            </Link>
          </div>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-xl shadow-black/10">
            <div className="flex-1 flex items-center px-4 bg-gray-50 rounded-xl">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="border-0 bg-transparent focus-visible:ring-0 px-0 text-black placeholder:text-gray-400 text-lg h-14"
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 rounded-xl text-lg font-medium shadow-none">
              {t('search')}
            </Button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              {t('featuredCategories')}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {featuredCategories.map((cat) => (
              <Link key={cat.id} href={`/search?categoryId=${cat.id}`} className="group block">
                <div className="bg-card border border-border/50 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
                  <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 ${cat.color}`}>
                    <cat.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      {recent && recent.length > 0 && (
        <section className="py-20 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                {t('recentBusinesses')}
              </h2>
              <Link href="/businesses" className="text-primary font-medium hover:underline flex items-center gap-1">
                {t('viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recent.slice(0, 4).map((biz) => (
                <Link key={biz.id} href={`/businesses/${biz.id}`} className="group block">
                  <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                      {biz.logoUrl ? (
                        <img src={biz.logoUrl} alt={getLocalizedField(biz, 'name', language)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                          <Building2 className="w-10 h-10 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {getLocalizedField(biz, 'name', language)}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                        {getLocalizedField(biz, 'description', language)}
                      </p>
                      <div className="flex items-center justify-between text-xs mt-auto">
                        <span className="text-muted-foreground">{getLocalizedField(biz, 'categoryName', language)}</span>
                        <span className="text-muted-foreground">{biz.city}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      {featured && featured.length > 0 && (
        <section className="py-20 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                {t('featuredBusinesses')}
              </h2>
              <Link href="/businesses" className="text-primary font-medium hover:underline flex items-center gap-1">
                {t('viewAll')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(0, 3).map((biz) => (
                <Link key={biz.id} href={`/businesses/${biz.id}`} className="group block">
                  <div className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {biz.logoUrl ? (
                        <img src={biz.logoUrl} alt={getLocalizedField(biz, 'name', language)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                          <Building2 className="w-12 h-12 opacity-20" />
                        </div>
                      )}
                      {biz.verified && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {getLocalizedField(biz, 'name', language)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {getLocalizedField(biz, 'description', language)}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-sm">
                        <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-medium">
                          {getLocalizedField(biz, 'categoryName', language)}
                        </span>
                        <span className="text-muted-foreground">{biz.city}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
