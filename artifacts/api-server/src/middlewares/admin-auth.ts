import { type Request, type Response, type NextFunction } from "express";
import { getUserFromToken } from "@workspace/db/supabase";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Extend Express Request type to include admin user
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  try {
    // Verify the Supabase auth token
    const user = await getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized: Invalid token" });
      return;
    }

    // Check if user exists in the admins table and is active
    const admin = await db.select().from(adminsTable).where(eq(adminsTable.id, user.id)).limit(1);

    if (admin.length === 0) {
      res.status(403).json({ error: "Forbidden: Not an admin user" });
      return;
    }

    if (!admin[0].active) {
      res.status(403).json({ error: "Forbidden: Admin account is inactive" });
      return;
    }

    // Attach admin info to request
    req.adminUser = {
      id: admin[0].id,
      email: admin[0].email,
      role: admin[0].role,
      firstName: admin[0].firstName ?? undefined,
      lastName: admin[0].lastName ?? undefined,
    };

    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function requireSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  // First ensure they're an admin
  await requireAdmin(req, res, () => {
    if (req.adminUser?.role !== "super_admin") {
      res.status(403).json({ error: "Forbidden: Only super admins can perform this action" });
      return;
    }
    next();
  });
}
