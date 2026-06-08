import { Router, type IRouter } from "express";
import { supabaseAdmin, getUserFromToken } from "@workspace/db/supabase";
import { db } from "@workspace/db";

const router: IRouter = Router();

function isAdmin(user: any): boolean {
  return user?.email?.toLowerCase() === "admin@ethioobiz.et";
}

function formatUser(user: any): any {
  if (!user) return null;
  return {
    id: user.id,
    username: user.email?.split("@")[0] || "user",
    email: user.email,
    role: isAdmin(user) ? "admin" : "user",
    suspended: false,
    createdAt: user.created_at || new Date().toISOString(),
  };
}

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json(formatUser(user));
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ success: true });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    res.status(401).json({ error: error?.message || "Invalid credentials" });
    return;
  }

  res.json({
    user: formatUser(data.user),
    session: {
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      expiresAt: data.session?.expires_at,
    },
  });
});

export default router;
