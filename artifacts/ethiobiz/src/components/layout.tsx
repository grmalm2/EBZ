import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { MapPin, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useI18n();
  const { data: user } = useGetMe();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-serif font-bold text-xl">
              E
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-foreground hidden sm:inline-block">
              EthiooBiz
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-4">
              <Link href="/businesses" className="hover:text-foreground transition-colors">
                {t('businesses')}
              </Link>
              <Link href="/add-business" className="hover:text-foreground transition-colors">
                Submit Business
              </Link>
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-9 px-3">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline-block font-medium">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('EN')}>English (EN)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('AM')}>አማርኛ (AM)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ORM')}>Afaan Oromoo (ORM)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      {t('admin')}
                    </Button>
                  </Link>
                )}
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="font-semibold">
                  {t('login')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/30 pt-12 pb-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground w-6 h-6 rounded flex items-center justify-center font-serif font-bold">
                  E
                </div>
                <span className="font-serif font-bold text-lg">EthiooBiz</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm mb-4 leading-relaxed">
                The digital town square of a thriving, modern Ethiopia. Find businesses, services, and opportunities in English, Amharic, and Afaan Oromoo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-foreground">Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/businesses" className="hover:text-primary transition-colors">{t('businesses')}</Link></li>
                <li><Link href="/categories" className="hover:text-primary transition-colors">{t('categories')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} EthiooBiz. All rights reserved.</p>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Addis Ababa, Ethiopia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
