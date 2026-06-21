import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertCircle } from "lucide-react";

const adminLoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof adminLoginSchema>) => {
    setIsLoading(true);
    setVerificationError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // Email verification required
          if (data.error?.includes("Email not verified")) {
            setVerificationError(data.error);
            toast({
              title: "Email Verification Required",
              description: "Your admin account needs email verification. Check your email for the verification link.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Access Denied",
              description: data.error || "You don't have admin access.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Login failed",
            description: data.error || "Invalid credentials",
            variant: "destructive",
          });
        }
      } else {
        // Store session/token
        localStorage.setItem("adminToken", data.session.accessToken);
        localStorage.setItem("adminUser", JSON.stringify(data.admin));

        toast({
          title: "Welcome back!",
          description: `Welcome, ${data.admin.firstName || data.admin.email}`,
        });

        // Redirect to admin dashboard
        setLocation("/admin");
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mx-auto mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-serif">Admin Login</CardTitle>
          <CardDescription>Manage EthiooBiz listings and activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="pt-2 text-center text-sm text-muted-foreground">
            <p>
              Not an admin?{" "}
              <Link href="/login" className="text-primary hover:underline">
                User login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
