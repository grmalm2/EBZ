import { Router, type IRouter } from "express";
import { db, businessesTable, usersTable, adsTable, claimsTable, categoriesTable } from "@workspace/db";
import { eq, count, desc, sql, inArray } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [{ total: totalBusinesses }] = await db.select({ total: count() }).from(businessesTable);
  const [{ total: verifiedBusinesses }] = await db
    .select({ total: count() })
    .from(businessesTable)
    .where(eq(businessesTable.verified, true));
  const [{ total: pendingClaims }] = await db
    .select({ total: count() })
    .from(claimsTable)
    .where(eq(claimsTable.status, "pending"));
  const [{ total: totalUsers }] = await db.select({ total: count() }).from(usersTable);
  const [{ total: totalAds }] = await db.select({ total: count() }).from(adsTable);
  const [{ total: activeAds }] = await db
    .select({ total: count() })
    .from(adsTable)
    .where(eq(adsTable.status, "active"));

  const recentBizRaw = await db
    .select()
    .from(businessesTable)
    .orderBy(desc(businessesTable.createdAt))
    .limit(5);

  const recentBusinesses = recentBizRaw.map((b) => ({
    id: b.id,
    nameEn: b.nameEn,
    nameAm: b.nameAm,
    nameOrm: b.nameOrm,
    descriptionEn: b.descriptionEn,
    descriptionAm: b.descriptionAm,
    descriptionOrm: b.descriptionOrm,
    categoryId: b.categoryId,
    categoryNameEn: null,
    categoryNameAm: null,
    categoryNameOrm: null,
    city: b.city,
    subcity: b.subcity,
    address: b.address,
    phone: b.phone,
    email: b.email,
    website: b.website,
    logoUrl: b.logoUrl,
    gallery: b.gallery ?? [],
    services: b.services ?? [],
    products: b.products ?? [],
    socialLinks: b.socialLinks ?? {},
    latitude: b.latitude,
    longitude: b.longitude,
    verified: b.verified,
    featured: b.featured,
    claimStatus: b.claimStatus,
    ownerId: b.ownerId,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt,
  }));

  const catStats = await db
    .select({
      categoryId: businessesTable.categoryId,
      count: count(),
    })
    .from(businessesTable)
    .groupBy(businessesTable.categoryId)
    .orderBy(desc(count()))
    .limit(5);

  const catIds = catStats.map((s) => s.categoryId);
  const cats = catIds.length
    ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds))
    : [];
  const catMap = new Map(cats.map((c) => [c.id, c]));

  const topCategories = catStats.map((s) => ({
    categoryId: s.categoryId,
    nameEn: catMap.get(s.categoryId)?.nameEn ?? "Unknown",
    nameAm: catMap.get(s.categoryId)?.nameAm ?? "Unknown",
    nameOrm: catMap.get(s.categoryId)?.nameOrm ?? "Unknown",
    icon: catMap.get(s.categoryId)?.icon ?? null,
    count: Number(s.count),
    verifiedCount: 0,
  }));

  res.json({
    totalBusinesses: Number(totalBusinesses),
    verifiedBusinesses: Number(verifiedBusinesses),
    pendingClaims: Number(pendingClaims),
    totalUsers: Number(totalUsers),
    totalAds: Number(totalAds),
    activeAds: Number(activeAds),
    recentBusinesses,
    topCategories,
  });
});

export default router;
