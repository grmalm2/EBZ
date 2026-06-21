import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Edit, Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const addAdminSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["admin", "super_admin", "moderator"]),
});

interface Admin {
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

export default function ManageAdmins() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<Admin | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<z.infer<typeof addAdminSchema>>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "admin",
    },
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const userData = localStorage.getItem("adminUser");

        if (!token) {
          setLocation("/admin/login");
          return;
        }

        if (userData) {
          setCurrentUser(JSON.parse(userData));
        }

        const response = await fetch("/api/admin/admins", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            toast({
              title: "Access Denied",
              description: "Only super admins can manage admins",
              variant: "destructive",
            });
            setLocation("/admin");
            return;
          }
          throw new Error("Failed to fetch admins");
        }

        const data = await response.json();
        setAdmins(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load admins",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [setLocation, toast]);

  const onAddAdmin = async (values: z.infer<typeof addAdminSchema>) => {
    setIsAddingAdmin(true);
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add admin");
      }

      const newAdmin = await response.json();
      setAdmins([...admins, newAdmin]);
      form.reset();
      setOpenDialog(false);

      toast({
        title: "Admin added",
        description: `${values.email} has been added as an admin. An invitation email has been sent.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add admin",
        variant: "destructive",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Delete admin ${adminEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete admin");
      }

      setAdmins(admins.filter((a) => a.id !== adminId));

      toast({
        title: "Admin deleted",
        description: `${adminEmail} has been removed as an admin.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete admin",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      case "moderator":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleDisplay = (role: string) => {
    return role.replace("_", " ").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b py-6">
        <div className="container mx-auto px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-3 w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-serif font-bold">Manage Admins</h1>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.role === "super_admin"
                    ? "Add, edit, and remove admin accounts"
                    : "View admin accounts"}
                </p>
              </div>
            </div>
            {currentUser?.role === "super_admin" && (
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
                    <form
                      onSubmit={form.handleSubmit(onAddAdmin)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="admin@ethioobiz.et"
                                type="email"
                                {...field}
                              />
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
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="moderator">
                                  Moderator
                                </SelectItem>
                                <SelectItem value="super_admin">
                                  Super Admin
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isAddingAdmin}
                      >
                        {isAddingAdmin ? "Adding..." : "Add Admin"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {currentUser?.role !== "super_admin" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to manage admins. Only super admins can add or
              remove admin accounts.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No admins found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">
                    Role
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, i) => (
                  <tr
                    key={admin.id}
                    className={`border-t ${
                      i % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-medium text-sm">
                        {admin.firstName && admin.lastName
                          ? `${admin.firstName} ${admin.lastName}`
                          : admin.firstName || admin.email.split("@")[0]}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {admin.email}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <Badge className={getRoleBadgeColor(admin.role)}>
                        {getRoleDisplay(admin.role)}
                      </Badge>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {admin.emailVerified ? (
                          <Badge variant="outline" className="bg-green-50">
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            Pending
                          </Badge>
                        )}
                        {!admin.active && (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {currentUser?.role === "super_admin" &&
                          admin.id !== currentUser?.id && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  handleDeleteAdmin(admin.id, admin.email)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
