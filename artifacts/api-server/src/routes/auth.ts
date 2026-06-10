import { Router, type IRouter } from "express";
import type { Request, Response } from "express";

const router: IRouter = Router();

const ADMIN_EMAIL = "admin@ethioobiz.et";
const ADMIN_PASSWORD = "admin_001";

function setSession(res: Response, session: Record<string, unknown>, secret: string) {
  const value = JSON.stringify(session);
  res.cookie("session", value, {
    signed: true,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post("/auth/login", (req: Request, res: Response): void => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  if (
    email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
    password !== ADMIN_PASSWORD
  ) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const session = { userId: "admin", email: ADMIN_EMAIL, role: "admin" };
  setSession(res, session, process.env.SESSION_SECRET ?? "ethioobiz-secret");
  res.json({ user: { id: "admin", username: "admin", email: ADMIN_EMAIL, role: "admin" } });
});

router.post("/auth/logout", (_req: Request, res: Response): void => {
  res.clearCookie("session");
  res.json({ success: true });
});

router.get("/auth/me", (req: Request, res: Response): void => {
  const session = (req as any).session as Record<string, unknown> | undefined;
  if (!session?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({
    id: session.userId,
    username: session.email ? String(session.email).split("@")[0] : "admin",
    email: session.email,
    role: session.role,
  });
});

export default router;
