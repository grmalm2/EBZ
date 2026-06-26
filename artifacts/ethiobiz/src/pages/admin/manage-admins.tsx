import { useState } from "react";
import { useAdminAuth, useAdminList, useCreateAdminMutation, useDeleteAdminMutation } from "@/lib/admin";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminRouteGuard } from "@/components/admin/route-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Shield, AlertCircle, Crown, UserCog, User, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const addAdminSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["admin", "super_admin", "moderator"]),
});

function getRoleBadgeColor(role: string) {
  switch (role) {
    case "super_admin":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "admin":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "moderator":
      return "bg-purple-100 text-purple-700 border-purple-300";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case "super_admin":
      return Crown;
    case "admin":
      return UserCog;
    default:
      return User;
  }
}

function getRoleDisplay(role: string) {
  return role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function ManageAdminsContent() {
  const { toast } = useToast();
  const { admin: currentUser } = useAdminAuth();
  const [openDialog, setOpenDialog] = useState(false);

  const { data: admins, isLoading } = useAdminList();
  const createMutation = useCreateAdminMutation();
  const deleteMutation = useDeleteAdminMutation();

  const form = useForm<z.infer<typeof addAdminSchema>>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "admin",
    },
  });

  const onSubmit = async (values: z.infer<typeof addAdminSchema>) => {
    try {
      await createMutation.mutateAsync(values);
      form.reset();
      setOpenDialog(false);
      toast({
        title: "Admin added",
        description: `${values.email} has been added as an admin.`,
      });
    } catch (err: any) {
      toast({
        title: "Error adding admin",
        description: err?.message || "Failed to add admin",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (adminId: string, adminEmail: string) => {
    if (!confirm(`Remove admin ${adminEmail}? This action cannot be undone.`)) return;
    deleteMutation.mutate(
      { id: adminId },
      {
        onSuccess: () => {
          toast({ title: "Admin removed", description: `${adminEmail} has been removed.` });
        },
        onError: (err: any) => {
          toast({
            title: "Error removing admin",
            description: err?.message || "Failed to remove admin",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manage Admins</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Add, edit, and remove admin accounts
              </p>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                  <DialogDescription>
                    Create a new admin account. An invitation email will be sent.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@ethioobiz.et" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Admin"
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : !admins || admins.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No admins found</p>
                <p className="text-sm mt-1">Add your first admin to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border overflow-hidden bg-card">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Role
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Last Login
                  </th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => {
                  const RoleIcon = getRoleIcon(admin.role);
                  const isCurrentUser = admin.id === currentUser?.id;
                  return (
                    <tr
                      key={admin.id}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {(admin.firstName?.[0] || admin.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {admin.firstName && admin.lastName
                                ? `${admin.firstName} ${admin.lastName}`
                                : admin.firstName || admin.email.split("@")[0]}
                            </p>
                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <Badge className={`${getRoleBadgeColor(admin.role)} gap-1`}>
                          <RoleIcon className="w-3 h-3" />
                          {getRoleDisplay(admin.role)}
                        </Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          {admin.emailVerified ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                              Pending
                            </Badge>
                          )}
                          {!admin.active && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                        {admin.lastLogin
                          ? new Date(admin.lastLogin).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {!isCurrentUser && currentUser?.role === "super_admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(admin.id, admin.email)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs bg-primary/5">
                              You
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function ManageAdmins() {
  return (
    <AdminRouteGuard requireSuperAdmin>
      <ManageAdminsContent />
    </AdminRouteGuard>
  );
}
