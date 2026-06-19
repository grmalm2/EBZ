import { useI18n } from "@/lib/i18n";
import { useGlobalSearch, useGetFeaturedBusinesses, useGetRecentBusinesses, useGetActiveAds } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Search, Building2, Briefcase, Car, Globe, Handshake, Heart, Grid3x3, ArrowRight, CheckCircle2, Home as HomeIcon } from "lucide-react";
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
  { id: 32, name: "House Rentals", icon: HomeIcon, color: "bg-teal-100 text-teal-700" },
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
      <section className="relative pt-32 pb-40 overflow-hidden bg-slate-900 text-white">
        {/* Abstract Sophisticated Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-slate-900 to-slate-900"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-medium text-emerald-50">The Premier Ethiopian Business Network</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
            Discover Ethiopia's <br className="hidden md:block"/>
            <span className="text-emerald-400">Thriving Economy</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Connect with trusted professionals, explore premium opportunities, and engage with the heart of Ethiopian commerce.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl">
              <div className="flex-1 flex items-center px-5 bg-white/5 rounded-xl border border-white/10 transition-colors focus-within:bg-white/10">
                <Search className="w-5 h-5 text-slate-300 mr-3" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="border-0 bg-transparent focus-visible:ring-0 px-0 text-white placeholder:text-slate-400 text-lg h-14"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-10 rounded-xl text-lg font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-900 border-0 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
                {t('search')}
              </Button>
            </div>
          </form>
          
          <div className="mt-12 flex items-center justify-center gap-6 text-sm font-medium text-slate-400">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified Businesses</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Premium Listings</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multilingual Support</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-background relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {t('featuredCategories')}
            </h2>
            <div className="w-12 h-1 bg-primary rounded-full mb-4"></div>
            <p className="text-muted-foreground max-w-2xl">Explore our curated selection of industry sectors and find exactly what you're looking for.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-6">
            {featuredCategories.map((cat) => (
              <Link key={cat.id} href={`/search?categoryId=${cat.id}`} className="group block">
                <div className="bg-card border border-border/50 rounded-2xl p-6 text-center transition-all duration-500 hover:shadow-xl hover:border-primary/30 hover:-translate-y-2 h-full flex flex-col items-center justify-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${cat.color}`}>
                    <cat.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      {recent && recent.length > 0 && (
        <section className="py-24 bg-slate-50/50 dark:bg-slate-900/20 border-y border-border/40">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                  {t('recentBusinesses')}
                </h2>
                <div className="w-12 h-1 bg-primary rounded-full"></div>
              </div>
              <Link href="/businesses" className="text-primary font-medium hover:text-primary/80 flex items-center gap-2 group transition-colors">
                {t('viewAll')} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recent.slice(0, 4).map((biz) => (
                <Link key={biz.id} href={`/businesses/${biz.id}`} className="group block">
                  <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                    <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden flex items-center justify-center">
                      {biz.logoUrl ? (
                        <img src={biz.logoUrl} alt={getLocalizedField(biz, 'name', language)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 text-primary">
                          <Building2 className="w-10 h-10 opacity-30" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {getLocalizedField(biz, 'name', language)}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {getLocalizedField(biz, 'description', language)}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <span className="text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-md">{getLocalizedField(biz, 'categoryName', language)}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> {biz.city}</span>
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
        <section className="py-24 bg-background relative">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                  {t('featuredBusinesses')}
                </h2>
                <div className="w-12 h-1 bg-accent rounded-full"></div>
              </div>
              <Link href="/businesses" className="text-primary font-medium hover:text-primary/80 flex items-center gap-2 group transition-colors">
                {t('viewAll')} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.slice(0, 3).map((biz) => (
                <Link key={biz.id} href={`/businesses/${biz.id}`} className="group block">
                  <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {biz.logoUrl ? (
                        <img src={biz.logoUrl} alt={getLocalizedField(biz, 'name', language)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                          <Building2 className="w-16 h-16 opacity-20" />
                        </div>
                      )}
                      {biz.verified && (
                        <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col justify-end">
                      <div className="mb-3">
                        <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs px-3 py-1 rounded-full font-medium">
                          {getLocalizedField(biz, 'categoryName', language)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors drop-shadow-sm">
                        {getLocalizedField(biz, 'name', language)}
                      </h3>
                      <div className="flex items-center text-sm text-slate-200 mt-2 font-medium">
                        <MapPin className="w-4 h-4 mr-1.5 text-emerald-400" /> {biz.city}
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
