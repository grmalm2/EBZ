import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useI18n } from "@/lib/i18n";
import { useCreateBusiness, useListCategories } from "@workspace/api-client-react";
import { Building2, Plus, X, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const CITIES = ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Adama", "Jimma"];

const addBusinessSchema = z.object({
  nameEn: z.string().min(2, "Business name is required"),
  nameAm: z.string().optional(),
  nameOrm: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAm: z.string().optional(),
  descriptionOrm: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  city: z.string().min(1, "City is required"),
  subcity: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

type AddBusinessForm = z.infer<typeof addBusinessSchema>;

export default function AddBusiness() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: categories } = useListCategories();
  const { mutate: createBusiness, isPending } = useCreateBusiness();

  const [services, setServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [productInput, setProductInput] = useState("");

  const form = useForm<AddBusinessForm>({
    resolver: zodResolver(addBusinessSchema),
    defaultValues: {
      nameEn: "",
      nameAm: "",
      nameOrm: "",
      descriptionEn: "",
      descriptionAm: "",
      descriptionOrm: "",
      categoryId: "",
      city: "",
      subcity: "",
      address: "",
      phone: "",
      email: "",
      website: "",
    },
  });

  const addTag = (type: "service" | "product", value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (type === "service") {
      if (!services.includes(trimmed)) setServices([...services, trimmed]);
      setServiceInput("");
    } else {
      if (!products.includes(trimmed)) setProducts([...products, trimmed]);
      setProductInput("");
    }
  };

  const removeTag = (type: "service" | "product", tag: string) => {
    if (type === "service") setServices(services.filter((s) => s !== tag));
    else setProducts(products.filter((p) => p !== tag));
  };

  const onSubmit = (values: AddBusinessForm) => {
    const payload = {
      data: {
        nameEn: values.nameEn,
        nameAm: values.nameAm || undefined,
        nameOrm: values.nameOrm || undefined,
        descriptionEn: values.descriptionEn || undefined,
        descriptionAm: values.descriptionAm || undefined,
        descriptionOrm: values.descriptionOrm || undefined,
        categoryId: parseInt(values.categoryId, 10),
        city: values.city,
        subcity: values.subcity || undefined,
        address: values.address || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        website: values.website || undefined,
        services,
        products,
      } as any,
    };

    createBusiness(payload, {
      onSuccess: (biz) => {
        toast({ title: "Business submitted!", description: "It will be reviewed and published shortly." });
        setLocation(`/businesses/${biz.id}`);
      },
      onError: (err: any) => {
        toast({
          title: "Error creating listing",
          description: err?.message || "Please check your inputs and try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-3 w-fit transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <h1 className="text-3xl font-serif font-bold">Add Your Business</h1>
          <p className="text-muted-foreground">List your business on EthioOBiz and get discovered by customers across Ethiopia</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Business Name
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nameEn">English *</Label>
                <Input id="nameEn" {...form.register("nameEn")} placeholder="e.g., Skyline Real Estate" />
                {form.formState.errors.nameEn && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.nameEn.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameAm">Amharic</Label>
                  <Input id="nameAm" {...form.register("nameAm")} placeholder="የቅንጦት አፓርት..." />
                </div>
                <div>
                  <Label htmlFor="nameOrm">Afaan Oromoo</Label>
                  <Input id="nameOrm" {...form.register("nameOrm")} placeholder="Maqaa dhaabbata..." />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select value={form.watch("categoryId")} onValueChange={(v) => form.setValue("categoryId", v)}>
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.categoryId.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Select value={form.watch("city")} onValueChange={(v) => form.setValue("city", v)}>
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subcity">Subcity / District</Label>
                  <Input id="subcity" {...form.register("subcity")} placeholder="e.g., Bole" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" {...form.register("address")} placeholder="e.g., Bole Medhanealem Road, Building 12" />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...form.register("phone")} placeholder="+251 9xx xxx xxx" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} placeholder="info@business.et" />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...form.register("website")} placeholder="https://www.business.et" />
                {form.formState.errors.website && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.website.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="descriptionEn">English</Label>
                <Textarea id="descriptionEn" {...form.register("descriptionEn")} placeholder="Describe what your business does..." rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descriptionAm">Amharic</Label>
                  <Textarea id="descriptionAm" {...form.register("descriptionAm")} placeholder="እናዘንድን የደላለውዥ..." rows={3} />
                </div>
                <div>
                  <Label htmlFor="descriptionOrm">Afaan Oromoo</Label>
                  <Textarea id="descriptionOrm" {...form.register("descriptionOrm")} placeholder="Ibsa dhaabbata..." rows={3} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  placeholder="Add a service (e.g., Property Listings)"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("service", serviceInput))}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => addTag("service", serviceInput)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1">
                    {s}
                    <button type="button" onClick={() => removeTag("service", s)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {services.length === 0 && <p className="text-sm text-muted-foreground">No services added yet</p>}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  placeholder="Add a product (e.g., Ethiopian Coffee)"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("product", productInput))}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => addTag("product", productInput)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {products.map((p) => (
                  <Badge key={p} variant="secondary" className="gap-1 pr-1">
                    {p}
                    <button type="button" onClick={() => removeTag("product", p)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {products.length === 0 && <p className="text-sm text-muted-foreground">No products added yet</p>}
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex items-center gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setLocation("/")} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Submitting..." : "Submit Business Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
