import { Router, type IRouter } from "express";
import { db, businessesTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike, sql, desc, count, inArray } from "drizzle-orm";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const { q, categoryId, city, subcity, page = "1", limit = "20" } = req.query as Record<string, string>;

  if (!q) {
    res.status(400).json({ error: "q is required" });
    return;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, parseInt(limit, 10) || 20);
  const offset = (pageNum - 1) * limitNum;

  const searchClause = sql`(
    ${businessesTable.nameEn} ILIKE ${'%' + q + '%'}
    OR ${businessesTable.nameAm} ILIKE ${'%' + q + '%'}
    OR ${businessesTable.nameOrm} ILIKE ${'%' + q + '%'}
    OR ${businessesTable.descriptionEn} ILIKE ${'%' + q + '%'}
    OR ${businessesTable.city} ILIKE ${'%' + q + '%'}
    OR ${businessesTable.address} ILIKE ${'%' + q + '%'}
  )`;

  const conditions: any[] = [searchClause];
  if (categoryId) conditions.push(eq(businessesTable.categoryId, parseInt(categoryId, 10)));
  if (city) conditions.push(ilike(businessesTable.city, `%${city}%`));
  if (subcity) conditions.push(ilike(businessesTable.subcity, `%${subcity}%`));

  const whereClause = and(...conditions);

  const [{ total }] = await db.select({ total: count() }).from(businessesTable).where(whereClause);

  const businesses = await db
    .select()
    .from(businessesTable)
    .where(whereClause)
    .orderBy(desc(businessesTable.featured), desc(businessesTable.verified), desc(businessesTable.createdAt))
    .limit(limitNum)
    .offset(offset);

  const catIds = [...new Set(businesses.map((b) => b.categoryId))];
  const cats = catIds.length
    ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds))
    : [];
  const catMap = new Map(cats.map((c) => [c.id, c]));

  res.json({
    businesses: businesses.map((b) => {
      const cat = catMap.get(b.categoryId);
      return {
        id: b.id,
        nameEn: b.nameEn,
        nameAm: b.nameAm,
        nameOrm: b.nameOrm,
        descriptionEn: b.descriptionEn,
        descriptionAm: b.descriptionAm,
        descriptionOrm: b.descriptionOrm,
        categoryId: b.categoryId,
        categoryNameEn: cat?.nameEn ?? null,
        categoryNameAm: cat?.nameAm ?? null,
        categoryNameOrm: cat?.nameOrm ?? null,
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
      };
    }),
    total: Number(total),
    page: pageNum,
    totalPages: Math.ceil(Number(total) / limitNum),
  });
});

export default router;
