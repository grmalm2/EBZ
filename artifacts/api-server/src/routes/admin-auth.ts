import { Router, type IRouter, type Request, type Response } from "express";
import { supabaseAdmin, getUserFromToken } from "@workspace/db/supabase";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Helper function to check if user is admin
async function isAdminUser(userId: string): Promise<boolean> {
  try {
    const admin = await db.select().from(adminsTable).where(eq(adminsTable.id, userId)).limit(1);
    return admin.length > 0 && admin[0].active && admin[0].emailVerified;
  } catch {
    return false;
  }
}

// Format admin response
function formatAdmin(admin: any): any {
  return {
    id: admin.id,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    role: admin.role,
    emailVerified: admin.emailVerified,
    active: admin.active,
    createdAt: admin.createdAt,
    lastLogin: admin.lastLogin,
  };
}

// Get current admin
router.get("/admin/me", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const isAdmin = await isAdminUser(user.id);
    if (!isAdmin) {
      res.status(403).json({ error: "Forbidden: Not an admin" });
      return;
    }

    const admin = await db.select().from(adminsTable).where(eq(adminsTable.id, user.id)).limit(1);
    if (admin.length === 0) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.json(formatAdmin(admin[0]));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin login with email verification check
router.post("/admin/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      res.status(401).json({ error: error?.message || "Invalid credentials" });
      return;
    }

    // Check if user is an admin in our database
    const admin = await db.select().from(adminsTable).where(eq(adminsTable.id, data.user.id)).limit(1);

    if (admin.length === 0) {
      res.status(403).json({ error: "Forbidden: Not an admin user" });
      return;
    }

    if (!admin[0].active) {
      res.status(403).json({ error: "Forbidden: Admin account is inactive" });
      return;
    }

    if (!admin[0].emailVerified) {
      res.status(403).json({ error: "Email not verified. Please check your email to verify your admin account." });
      return;
    }

    // Update last login
    await db.update(adminsTable).set({ lastLogin: new Date() }).where(eq(adminsTable.id, data.user.id));

    res.json({
      admin: formatAdmin(admin[0]),
      session: {
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        expiresAt: data.session?.expires_at,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request email verification for admin account
router.post("/admin/request-verification", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const admin = await db.select().from(adminsTable).where(eq(adminsTable.id, user.id)).limit(1);

    if (admin.length === 0) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    // Send verification email via Supabase
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: admin[0].email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/verify-email`,
      },
    });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify admin email (called after user clicks verification link)
router.post("/admin/verify-email", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Mark email as verified
    await db.update(adminsTable).set({ emailVerified: true }).where(eq(adminsTable.id, user.id));

    const admin = await db.select().from(adminsTable).where(eq(adminsTable.id, user.id)).limit(1);

    res.json({
      message: "Email verified successfully",
      admin: formatAdmin(admin[0]),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// List all admins (super admin only)
router.get("/admin/admins", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if current user is super admin
    const currentAdmin = await db.select().from(adminsTable).where(eq(adminsTable.id, user.id)).limit(1);

    if (currentAdmin.length === 0 || currentAdmin[0].role !== "super_admin") {
      res.status(403).json({ error: "Forbidden: Only super admins can list admins" });
      return;
    }

    const admins = await db.select().from(adminsTable);
    res.json(admins.map(formatAdmin));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add new admin (super admin only)
router.post("/admin/admins", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { email, firstName, lastName, role } = req.body;

  if (!email || !role) {
    res.status(400).json({ error: "Email and role required" });
    return;
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if current user is super admin
    const currentAdmin = await db.select().from(adminsTable).where(eq(adminsTable.id, user.id)).limit(1);

    if (currentAdmin.length === 0 || currentAdmin[0].role !== "super_admin") {
      res.status(403).json({ error: "Forbidden: Only super admins can add admins" });
      return;
    }

    // Create user in Supabase Auth (they'll set password later)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false, // Require email verification
    });

    if (authError || !authUser.user) {
      res.status(400).json({ error: authError?.message || "Failed to create user" });
      return;
    }

    // Add to admins table
    const newAdmin = await db.insert(adminsTable).values({
      id: authUser.user.id,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      role: role || "admin",
      emailVerified: false,
      active: true,
    }).returning();

    // Send invitation email
    const { error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/setup-password`,
      },
    });

    if (linkError) {
      console.error("Failed to send invitation email:", linkError);
    }

    res.status(201).json(formatAdmin(newAdmin[0]));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update admin (super admin only)
router.patch("/admin/admins/:id", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.params;
  const { firstName, lastName, role, active } = req.body;

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if current user is super admin
    const currentAdmin = await db.select().from(adminsTable).where(eq(adminsTable.id, user.id)).limit(1);

    if (currentAdmin.length === 0 || currentAdmin[0].role !== "super_admin") {
      res.status(403).json({ error: "Forbidden: Only super admins can update admins" });
      return;
    }

    const updates: any = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (role !== undefined) updates.role = role;
    if (active !== undefined) updates.active = active;

    const updated = await db.update(adminsTable).set(updates).where(eq(adminsTable.id, id)).returning();

    if (updated.length === 0) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    res.json(formatAdmin(updated[0]));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete admin (super admin only)
router.delete("/admin/admins/:id", async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.params;

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if current user is super admin
    const currentAdmin = await db.select().from(adminsTable).where(eq(adminsTable.id, user.id)).limit(1);

    if (currentAdmin.length === 0 || currentAdmin[0].role !== "super_admin") {
      res.status(403).json({ error: "Forbidden: Only super admins can delete admins" });
      return;
    }

    // Don't allow deleting the last super admin
    if (id === currentAdmin[0].id) {
      res.status(400).json({ error: "Cannot delete your own admin account" });
      return;
    }

    await db.delete(adminsTable).where(eq(adminsTable.id, id));

    // Also delete from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(id);

    res.json({ message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
