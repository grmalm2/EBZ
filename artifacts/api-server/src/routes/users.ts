import { Router, type IRouter } from "express";
import { supabaseAdmin } from "@workspace/db/supabase";
import { requireAdmin, requireSuperAdmin } from "../middlewares/admin-auth";

const router: IRouter = Router();

function formatUser(u: any) {
  return {
    id: u.id,
    username: u.email?.split("@")[0] || "user",
    email: u.email,
    role: u.email?.toLowerCase() === "admin@ethioobiz.et" ? "admin" : "user",
    suspended: false,
    createdAt: u.created_at,
  };
}

// All user routes require admin authentication
router.use("/users", requireAdmin);

router.get("/users", async (_req, res): Promise<void> => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json((data.users || []).map(formatUser));
});

router.patch("/users/:id", requireSuperAdmin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { role, suspended } = req.body;

  const updates: any = {};
  if (role !== undefined) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: { role },
    });
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json(formatUser(data.user));
    return;
  }

  const { data: existing } = await supabaseAdmin.auth.admin.getUserById(id);
  if (!existing?.user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(existing.user));
});

export default router;
