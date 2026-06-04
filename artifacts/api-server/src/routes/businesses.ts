import { Router, type IRouter } from "express";
import { db, businessesTable, categoriesTable, claimsTable } from "@workspace/db";
import { eq, and, ilike, sql, desc, count, inArray } from "drizzle-orm";

const router: IRouter = Router();

function formatBusiness(b: any, cat?: any) {
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
}

router.get("/businesses/featured", async (_req, res): Promise<void> => {
  const businesses = await db
    .select()
    .from(businessesTable)
    .where(eq(businessesTable.featured, true))
    .orderBy(desc(businessesTable.createdAt))
    .limit(12);

  const catIds = [...new Set(businesses.map((b) => b.categoryId))];
  const cats = catIds.length
    ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds))
    : [];
  const catMap = new Map(cats.map((c) => [c.id, c]));

  res.json(businesses.map((b) => formatBusiness(b, catMap.get(b.categoryId))));
});

router.get("/businesses/recent", async (_req, res): Promise<void> => {
  const businesses = await db
    .select()
    .from(businessesTable)
    .orderBy(desc(businessesTable.createdAt))
    .limit(8);

  const catIds = [...new Set(businesses.map((b) => b.categoryId))];
  const cats = catIds.length
    ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds))
    : [];
  const catMap = new Map(cats.map((c) => [c.id, c]));

  res.json(businesses.map((b) => formatBusiness(b, catMap.get(b.categoryId))));
});

router.get("/businesses/stats", async (_req, res): Promise<void> => {
  const stats = await db
    .select({
      categoryId: businessesTable.categoryId,
      count: count(),
    })
    .from(businessesTable)
    .groupBy(businessesTable.categoryId);

  const verifiedStats = await db
    .select({
      categoryId: businessesTable.categoryId,
      count: count(),
    })
    .from(businessesTable)
    .where(eq(businessesTable.verified, true))
    .groupBy(businessesTable.categoryId);

  const verifiedMap = new Map(verifiedStats.map((s) => [s.categoryId, Number(s.count)]));

  const catIds = [...new Set(stats.map((s) => s.categoryId))];
  const cats = catIds.length
    ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds))
    : [];
  const catMap = new Map(cats.map((c) => [c.id, c]));

  res.json(
    stats.map((s) => ({
      categoryId: s.categoryId,
      nameEn: catMap.get(s.categoryId)?.nameEn ?? "Unknown",
      nameAm: catMap.get(s.categoryId)?.nameAm ?? "Unknown",
      nameOrm: catMap.get(s.categoryId)?.nameOrm ?? "Unknown",
      icon: catMap.get(s.categoryId)?.icon ?? null,
      count: Number(s.count),
      verifiedCount: verifiedMap.get(s.categoryId) ?? 0,
    }))
  );
});

router.get("/businesses", async (req, res): Promise<void> => {
  const { q, categoryId, city, subcity, verified, featured, page = "1", limit = "20" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, parseInt(limit, 10) || 20);
  const offset = (pageNum - 1) * limitNum;

  const conditions: ReturnType<typeof eq>[] = [];
  if (categoryId) conditions.push(eq(businessesTable.categoryId, parseInt(categoryId, 10)));
  if (city) conditions.push(ilike(businessesTable.city, `%${city}%`));
  if (subcity) conditions.push(ilike(businessesTable.subcity, `%${subcity}%`));
  if (verified === "true") conditions.push(eq(businessesTable.verified, true));
  if (featured === "true") conditions.push(eq(businessesTable.featured, true));

  let whereClause: any = conditions.length > 0 ? and(...conditions) : undefined;

  if (q) {
    const searchClause = sql`(
      ${businessesTable.nameEn} ILIKE ${'%' + q + '%'}
      OR ${businessesTable.nameAm} ILIKE ${'%' + q + '%'}
      OR ${businessesTable.nameOrm} ILIKE ${'%' + q + '%'}
      OR ${businessesTable.descriptionEn} ILIKE ${'%' + q + '%'}
      OR ${businessesTable.city} ILIKE ${'%' + q + '%'}
    )`;
    whereClause = whereClause ? and(whereClause, searchClause) : searchClause;
  }

  const [{ total }] = await db
    .select({ total: count() })
    .from(businessesTable)
    .where(whereClause);

  const businesses = await db
    .select()
    .from(businessesTable)
    .where(whereClause)
    .orderBy(desc(businessesTable.featured), desc(businessesTable.createdAt))
    .limit(limitNum)
    .offset(offset);

  const catIds = [...new Set(businesses.map((b) => b.categoryId))];
  const cats = catIds.length
    ? await db.select().from(categoriesTable).where(inArray(categoriesTable.id, catIds))
    : [];
  const catMap = new Map(cats.map((c) => [c.id, c]));

  res.json({
    businesses: businesses.map((b) => formatBusiness(b, catMap.get(b.categoryId))),
    total: Number(total),
    page: pageNum,
    totalPages: Math.ceil(Number(total) / limitNum),
  });
});

router.post("/businesses", async (req, res): Promise<void> => {
  const { nameEn, categoryId, ...rest } = req.body;
  if (!nameEn || !categoryId) {
    res.status(400).json({ error: "nameEn and categoryId are required" });
    return;
  }
  const [b] = await db
    .insert(businessesTable)
    .values({ nameEn, categoryId: parseInt(categoryId, 10), ...rest })
    .returning();
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, b.categoryId));
  res.status(201).json(formatBusiness(b, cat));
});

router.get("/businesses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [b] = await db.select().from(businessesTable).where(eq(businessesTable.id, id));
  if (!b) { res.status(404).json({ error: "Business not found" }); return; }

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, b.categoryId));
  res.json(formatBusiness(b, cat));
});

router.patch("/businesses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updates = req.body;
  const [b] = await db.update(businessesTable).set(updates).where(eq(businessesTable.id, id)).returning();
  if (!b) { res.status(404).json({ error: "Business not found" }); return; }

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, b.categoryId));
  res.json(formatBusiness(b, cat));
});

router.delete("/businesses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(businessesTable).where(eq(businessesTable.id, id));
  res.sendStatus(204);
});

router.post("/businesses/:id/verify", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [b] = await db
    .update(businessesTable)
    .set({ verified: true })
    .where(eq(businessesTable.id, id))
    .returning();
  if (!b) { res.status(404).json({ error: "Business not found" }); return; }

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, b.categoryId));
  res.json(formatBusiness(b, cat));
});

router.post("/businesses/:id/claim", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { contactName, contactPhone, tradeLicenseUrl, notes } = req.body;
  if (!contactName || !contactPhone) {
    res.status(400).json({ error: "contactName and contactPhone are required" });
    return;
  }

  await db.insert(claimsTable).values({
    businessId: id,
    userId: "anonymous",
    contactName,
    contactPhone,
    tradeLicenseUrl,
    notes,
    status: "pending",
  });

  await db.update(businessesTable).set({ claimStatus: "pending" }).where(eq(businessesTable.id, id));
  res.status(201).json({ message: "Claim submitted successfully" });
});

export default router;
