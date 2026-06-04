import { useRoute, Link } from "wouter";
import { useI18n, getLocalizedField } from "@/lib/i18n";
import { useGetBusiness, useGetMe, useClaimBusiness } from "@workspace/api-client-react";
import {
  CheckCircle2, Building2, MapPin, Phone, Globe, Mail, ArrowLeft,
  Tag, Wrench, Package, Share2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function BusinessDetail() {
  const [, params] = useRoute("/businesses/:id");
  const id = params?.id ?? "";
  const { language, t } = useI18n();
  const { toast } = useToast();

  const numericId = parseInt(id, 10);
  const { data: biz, isLoading } = useGetBusiness(isNaN(numericId) ? 0 : numericId);
  const { data: user } = useGetMe();
  const { mutate: claim, isPending: claiming } = useClaimBusiness();

  const handleClaim = () => {
    claim(
      { id: numericId, data: {} as any },
      {
        onSuccess: () => toast({ title: "Claim submitted!", description: "We'll review your request shortly." }),
        onError: () => toast({ title: "Error", description: "Could not submit claim.", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h2 className="text-2xl font-bold mb-2">Business not found</h2>
        <Link href="/businesses"><Button variant="outline" className="mt-4">Back to Businesses</Button></Link>
      </div>
    );
  }

  const name = getLocalizedField(biz, "name", language);
  const description = getLocalizedField(biz, "description", language);
  const categoryName = getLocalizedField(biz, "categoryName", language);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/businesses" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Businesses
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border rounded-2xl overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {biz.logoUrl ? (
                  <img src={biz.logoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-20 h-20 text-muted-foreground opacity-20" />
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2 leading-tight">{name}</h1>
                    <div className="flex flex-wrap items-center gap-2">
                      {categoryName && (
                        <Badge variant="secondary" className="gap-1">
                          <Tag className="w-3 h-3" />{categoryName}
                        </Badge>
                      )}
                      {biz.verified && (
                        <Badge className="bg-green-500 text-white gap-1 hover:bg-green-500">
                          <CheckCircle2 className="w-3 h-3" />{t("verified")}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {description && (
                  <div>
                    <h2 className="font-semibold mb-2">{t("about")}</h2>
                    <p className="text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                )}
              </div>
            </div>

            {(biz.services?.length > 0 || biz.products?.length > 0) && (
              <div className="bg-card border rounded-2xl p-6 space-y-6">
                {biz.services?.length > 0 && (
                  <div>
                    <h2 className="font-semibold mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />{t("services")}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {biz.services.map((s: string, i: number) => (
                        <Badge key={i} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {biz.products?.length > 0 && (
                  <div>
                    <Separator className="mb-6" />
                    <h2 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />{t("products")}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {biz.products.map((p: string, i: number) => (
                        <Badge key={i} variant="outline">{p}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="bg-card border rounded-2xl p-6 space-y-4">
              <h2 className="font-semibold">{t("contact")}</h2>
              {biz.city && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{biz.city}{biz.subcity ? `, ${biz.subcity}` : ""}</p>
                    {biz.address && <p className="text-muted-foreground text-xs">{biz.address}</p>}
                  </div>
                </div>
              )}
              {biz.phone && (
                <a href={`tel:${biz.phone}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span>{biz.phone}</span>
                </a>
              )}
              {biz.email && (
                <a href={`mailto:${biz.email}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="truncate">{biz.email}</span>
                </a>
              )}
              {biz.website && (
                <a href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="flex items-center gap-1 truncate">
                    {biz.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </span>
                </a>
              )}
            </div>

            {!biz.ownerId && user && (
              <div className="bg-card border border-dashed rounded-2xl p-6 text-center">
                <Building2 className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">Is this your business?</p>
                <Button onClick={handleClaim} disabled={claiming} className="w-full" variant="outline">
                  {claiming ? "Submitting..." : t("claimBusiness")}
                </Button>
              </div>
            )}

            {!user && (
              <div className="bg-card border border-dashed rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">Sign in to claim or manage this listing</p>
                <Link href="/login"><Button variant="outline" className="w-full">{t("login")}</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
