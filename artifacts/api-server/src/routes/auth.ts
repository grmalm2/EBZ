import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Simple session-based auth using a user ID cookie
// In production this would integrate with a real auth provider

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = (req as any).session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    suspended: user.suspended,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  (req as any).session = null;
  res.json({ success: true });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email required" });
    return;
  }

  // Demo: allow login with admin@ethiobiz.et / admin
  let user = await db.select().from(usersTable).where(eq(usersTable.email, email)).then(r => r[0]);

  if (!user) {
    // Create user on first login (demo mode)
    const [created] = await db.insert(usersTable).values({
      id: `user_${Date.now()}`,
      email,
      username: email.split("@")[0],
      role: email === "admin@ethiobiz.et" ? "admin" : "user",
      suspended: false,
    }).returning();
    user = created;
  }

  if (user.suspended) {
    res.status(403).json({ error: "Account suspended" });
    return;
  }

  (req as any).session = { userId: user.id };
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    suspended: user.suspended,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
