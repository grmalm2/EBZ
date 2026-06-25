// Admin API client - uses adminToken from localStorage instead of Supabase session
const API_BASE = "/api";

function getAdminToken(): string | null {
  return localStorage.getItem("adminToken");
}

function getAdminUser(): AdminUser | null {
  const stored = localStorage.getItem("adminUser");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "super_admin" | "moderator";
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface DashboardStats {
  totalBusinesses: number;
  verifiedBusinesses: number;
  pendingClaims: number;
  totalUsers: number;
  totalAds: number;
  activeAds: number;
  recentBusinesses: Business[];
  topCategories: TopCategory[];
}

export interface Business {
  id: number;
  nameEn: string;
  nameAm?: string;
  nameOrm?: string;
  descriptionEn?: string;
  descriptionAm?: string;
  descriptionOrm?: string;
  categoryId: number;
  categoryNameEn?: string | null;
  categoryNameAm?: string | null;
  categoryNameOrm?: string | null;
  city?: string;
  subcity?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  gallery: string[];
  services: string[];
  products: string[];
  socialLinks: Record<string, string | null>;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  featured: boolean;
  claimStatus?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopCategory {
  categoryId: number;
  nameEn: string;
  nameAm: string;
  nameOrm: string;
  icon?: string;
  count: number;
  verifiedCount: number;
}

export interface BusinessPage {
  businesses: Business[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminListItem {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "super_admin" | "moderator";
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Generic fetch with admin token
async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  if (!token) {
    throw new Error("No admin token found");
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Admin Auth API
export async function loginAdmin(email: string, password: string): Promise<{ admin: AdminUser; session: { accessToken: string } }> {
  const response = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Login failed" }));
    throw new Error(errorData.error || "Login failed");
  }

  return response.json();
}

export async function getCurrentAdmin(): Promise<AdminUser> {
  return adminFetch<AdminUser>("/admin/me");
}

export async function verifyAdminEmail(): Promise<{ message: string; admin: AdminUser }> {
  return adminFetch("/admin/verify-email", { method: "POST" });
}

// Dashboard API
export async function getDashboardStats(): Promise<DashboardStats> {
  return adminFetch<DashboardStats>("/dashboard/stats");
}

// Business Management API
export async function listBusinesses(params?: {
  q?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
}): Promise<BusinessPage> {
  const searchParams = new URLSearchParams();
  if (params?.q) searchParams.append("q", params.q);
  if (params?.verified !== undefined) searchParams.append("verified", String(params.verified));
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const query = searchParams.toString();
  return adminFetch<BusinessPage>(`/businesses${query ? `?${query}` : ""}`);
}

export async function getBusiness(id: number): Promise<Business> {
  return adminFetch<Business>(`/businesses/${id}`);
}

export async function verifyBusiness(id: number): Promise<Business> {
  return adminFetch<Business>(`/businesses/${id}/verify`, { method: "POST" });
}

export async function deleteBusiness(id: number): Promise<void> {
  return adminFetch<void>(`/businesses/${id}`, { method: "DELETE" });
}

export async function updateBusiness(id: number, data: Partial<Business>): Promise<Business> {
  return adminFetch<Business>(`/businesses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Admin Management API (super_admin only)
export async function listAdmins(): Promise<AdminListItem[]> {
  return adminFetch<AdminListItem[]>("/admin/admins");
}

export async function createAdmin(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "super_admin" | "moderator";
}): Promise<AdminListItem> {
  return adminFetch<AdminListItem>("/admin/admins", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdmin(
  id: string,
  data: { firstName?: string; lastName?: string; role?: string; active?: boolean }
): Promise<AdminListItem> {
  return adminFetch<AdminListItem>(`/admin/admins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAdmin(id: string): Promise<void> {
  return adminFetch<void>(`/admin/admins/${id}`, { method: "DELETE" });
}

// User Management API
export interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: string;
  suspended: boolean;
  createdAt: string;
}

export async function listUsers(): Promise<UserListItem[]> {
  return adminFetch<UserListItem[]>("/users");
}

export async function updateUser(id: string, data: { role?: string; suspended?: boolean }): Promise<UserListItem> {
  return adminFetch<UserListItem>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Categories API
export interface Category {
  id: number;
  slug: string;
  nameEn: string;
  nameAm: string;
  nameOrm: string;
  icon?: string;
  parentId?: number;
  businessCount: number;
  children: Category[];
}

export async function listCategories(): Promise<Category[]> {
  return adminFetch<Category[]>("/categories");
}

export async function createCategory(data: {
  slug: string;
  nameEn: string;
  nameAm: string;
  nameOrm: string;
  icon?: string;
  parentId?: number;
}): Promise<Category> {
  return adminFetch<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  return adminFetch<void>(`/categories/${id}`, { method: "DELETE" });
}

export { getAdminToken, getAdminUser };
