import { Router, type IRouter } from "express";
import { db, adsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/admin-auth";

const router: IRouter = Router();

function formatAd(ad: any) {
  return {
    id: ad.id,
    title: ad.title,
    imageUrl: ad.imageUrl,
    linkUrl: ad.linkUrl,
    type: ad.type,
    status: ad.status,
    businessId: ad.businessId,
    startsAt: ad.startsAt instanceof Date ? ad.startsAt.toISOString() : ad.startsAt,
    endsAt: ad.endsAt instanceof Date ? ad.endsAt.toISOString() : ad.endsAt,
    createdAt: ad.createdAt instanceof Date ? ad.createdAt.toISOString() : ad.createdAt,
  };
}

// Public routes
router.get("/ads/active", async (_req, res): Promise<void> => {
  const ads = await db
    .select()
    .from(adsTable)
    .where(
      and(
        eq(adsTable.status, "active"),
        eq(adsTable.type, "banner")
      )
    )
    .limit(10);
  res.json(ads.map(formatAd));
});

// Admin routes
router.use("/ads", requireAdmin);

router.get("/ads", async (_req, res): Promise<void> => {
  const ads = await db.select().from(adsTable).orderBy(adsTable.createdAt);
  res.json(ads.map(formatAd));
});

router.post("/ads", async (req, res): Promise<void> => {
  const { title, imageUrl, linkUrl, type, businessId, startsAt, endsAt } = req.body;
  if (!title || !type) {
    res.status(400).json({ error: "title and type are required" });
    return;
  }
  const [ad] = await db
    .insert(adsTable)
    .values({
      title,
      imageUrl,
      linkUrl,
      type,
      status: "pending",
      businessId: businessId ? parseInt(businessId, 10) : undefined,
      startsAt: startsAt ? new Date(startsAt) : undefined,
      endsAt: endsAt ? new Date(endsAt) : undefined,
    })
    .returning();
  res.status(201).json(formatAd(ad));
});

router.patch("/ads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updates: Record<string, unknown> = {};
  const { title, imageUrl, linkUrl, status, startsAt, endsAt } = req.body;
  if (title !== undefined) updates.title = title;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (linkUrl !== undefined) updates.linkUrl = linkUrl;
  if (status !== undefined) updates.status = status;
  if (startsAt !== undefined) updates.startsAt = new Date(startsAt);
  if (endsAt !== undefined) updates.endsAt = new Date(endsAt);

  const [ad] = await db.update(adsTable).set(updates).where(eq(adsTable.id, id)).returning();
  if (!ad) { res.status(404).json({ error: "Ad not found" }); return; }

  res.json(formatAd(ad));
});

router.delete("/ads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(adsTable).where(eq(adsTable.id, id));
  res.sendStatus(204);
});

export default router;
