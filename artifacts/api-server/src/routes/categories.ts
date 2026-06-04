import { Router, type IRouter } from "express";
import { db, categoriesTable, businessesTable } from "@workspace/db";
import { eq, count, isNull, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const allCats = await db.select().from(categoriesTable).orderBy(categoriesTable.nameEn);

  const counts = await db
    .select({
      categoryId: businessesTable.categoryId,
      count: count(),
    })
    .from(businessesTable)
    .groupBy(businessesTable.categoryId);

  const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));

  const topLevel = allCats.filter((c) => !c.parentId);
  const children = allCats.filter((c) => !!c.parentId);

  const result = topLevel.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    nameEn: cat.nameEn,
    nameAm: cat.nameAm,
    nameOrm: cat.nameOrm,
    icon: cat.icon,
    parentId: cat.parentId,
    businessCount: countMap.get(cat.id) ?? 0,
    children: children
      .filter((c) => c.parentId === cat.id)
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        nameEn: c.nameEn,
        nameAm: c.nameAm,
        nameOrm: c.nameOrm,
        icon: c.icon,
        parentId: c.parentId,
        businessCount: countMap.get(c.id) ?? 0,
        children: [],
      })),
  }));

  res.json(result);
});

router.post("/categories", async (req, res): Promise<void> => {
  const { slug, nameEn, nameAm, nameOrm, icon, parentId } = req.body;
  if (!slug || !nameEn || !nameAm || !nameOrm) {
    res.status(400).json({ error: "slug, nameEn, nameAm, nameOrm are required" });
    return;
  }
  const [cat] = await db
    .insert(categoriesTable)
    .values({ slug, nameEn, nameAm, nameOrm, icon, parentId })
    .returning();
  res.status(201).json({ ...cat, businessCount: 0, children: [] });
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (!cat) { res.status(404).json({ error: "Category not found" }); return; }

  const children = await db.select().from(categoriesTable).where(eq(categoriesTable.parentId, id));
  const [bCount] = await db.select({ count: count() }).from(businessesTable).where(eq(businessesTable.categoryId, id));

  res.json({ ...cat, businessCount: Number(bCount?.count ?? 0), children: children.map(c => ({ ...c, businessCount: 0, children: [] })) });
});

router.patch("/categories/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { nameEn, nameAm, nameOrm, icon } = req.body;
  const updates: Record<string, unknown> = {};
  if (nameEn !== undefined) updates.nameEn = nameEn;
  if (nameAm !== undefined) updates.nameAm = nameAm;
  if (nameOrm !== undefined) updates.nameOrm = nameOrm;
  if (icon !== undefined) updates.icon = icon;

  const [cat] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Category not found" }); return; }

  res.json({ ...cat, businessCount: 0, children: [] });
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.sendStatus(204);
});

export default router;
