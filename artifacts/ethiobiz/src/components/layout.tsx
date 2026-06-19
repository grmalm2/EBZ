import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, LogOut, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabaseClient } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function Layout({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useI18n();
  const { data: user } = useGetMe();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    window.location.href = "/";
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-2xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              E
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-foreground hidden sm:inline-block">
              EthiooBiz
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground mr-6">
              <Link href="/" className="hover:text-foreground transition-all duration-200 hover:-translate-y-[1px]">
                Home
              </Link>
              <Link href="/categories/real-estate" className="hover:text-foreground transition-all duration-200 hover:-translate-y-[1px]">
                Real Estate
              </Link>
              <Link href="/categories/house-rentals" className="hover:text-foreground transition-all duration-200 hover:-translate-y-[1px]">
                House Rentals
              </Link>
              <Link href="/categories/jobs" className="hover:text-foreground transition-all duration-200 hover:-translate-y-[1px]">
                Jobs
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-all duration-200 hover:-translate-y-[1px] outline-none cursor-pointer">
                  Categories
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 shadow-xl border-border/40 glass">
                  <DropdownMenuItem asChild>
                    <Link href="/businesses" className="w-full cursor-pointer py-2">All Businesses</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories/restaurants" className="w-full cursor-pointer py-2">Restaurants</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories/technology" className="w-full cursor-pointer py-2">Technology</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories/services" className="w-full cursor-pointer py-2">Services</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories/retail" className="w-full cursor-pointer py-2">Retail</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories/health" className="w-full cursor-pointer py-2">Health</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/categories/education" className="w-full cursor-pointer py-2">Education</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/add-business" className="hover:text-foreground transition-all duration-200 hover:-translate-y-[1px] text-primary hover:text-primary/80">
                Submit Business
              </Link>
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-10 px-4 rounded-full border border-border/40 hover:bg-accent/10 hover:text-accent">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline-block font-medium">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="shadow-lg">
                <DropdownMenuItem onClick={() => setLanguage('EN')}>English (EN)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('AM')}>አማርኛ (AM)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ORM')}>Afaan Oromoo (ORM)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="hidden sm:flex rounded-full">
                      {t('admin')}
                    </Button>
                  </Link>
                )}
                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-background">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={handleLogout} title="Sign out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="font-semibold px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-[1px]">
                  {t('login')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-card/40 pt-16 pb-8 mt-auto backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-serif font-bold shadow-md">
                  E
                </div>
                <span className="font-serif font-bold text-xl tracking-tight">EthiooBiz</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-6">
                The digital town square of a thriving, modern Ethiopia. Find businesses, services, and opportunities in English, Amharic, and Afaan Oromoo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-sm uppercase tracking-widest text-foreground">Explore</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/businesses" className="hover:text-primary hover:translate-x-1 inline-block transition-transform">{t('businesses')}</Link></li>
                <li><Link href="/categories" className="hover:text-primary hover:translate-x-1 inline-block transition-transform">{t('categories')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
            <p>© {new Date().getFullYear()} EthiooBiz. All rights reserved.</p>
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Addis Ababa, Ethiopia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
