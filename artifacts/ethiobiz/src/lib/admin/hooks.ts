import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardStats,
  listBusinesses,
  verifyBusiness,
  deleteBusiness,
  updateBusiness,
  listAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  listUsers,
  listCategories,
  type Business,
  type AdminListItem,
  type DashboardStats,
  type BusinessPage,
  type Category,
} from "./api";

// Dashboard
export function useAdminDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: getDashboardStats,
    staleTime: 30000,
    retry: 1,
  });
}

// Businesses
export function useAdminBusinesses(params?: {
  q?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery<BusinessPage>({
    queryKey: ["admin", "businesses", params],
    queryFn: () => listBusinesses(params),
    staleTime: 10000,
  });
}

export function useVerifyBusinessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => verifyBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "stats"] });
    },
  });
}

export function useDeleteBusinessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "stats"] });
    },
  });
}

export function useUpdateBusinessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Business> }) => updateBusiness(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "stats"] });
    },
  });
}

// Admins
export function useAdminList() {
  return useQuery<AdminListItem[]>({
    queryKey: ["admin", "admins"],
    queryFn: listAdmins,
    staleTime: 30000,
  });
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
    },
  });
}

export function useUpdateAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAdmin>[1] }) =>
      updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
    },
  });
}

export function useDeleteAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
    },
  });
}

// Users
export function useAdminUserList() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: listUsers,
    staleTime: 30000,
  });
}

// Categories
export function useAdminCategoryList() {
  return useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: listCategories,
    staleTime: 60000,
  });
}
