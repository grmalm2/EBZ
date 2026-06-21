import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL or localStorage
        const token = localStorage.getItem("adminToken");

        if (!token) {
          setError("No authentication token found. Please log in again.");
          setIsVerifying(false);
          return;
        }

        const response = await fetch("/api/admin/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to verify email");
          setIsVerifying(false);
          return;
        }

        setIsSuccess(true);
        setIsVerifying(false);

        toast({
          title: "Email verified!",
          description: "Your admin email has been verified successfully.",
        });

        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          setLocation("/admin");
        }, 2000);
      } catch (err) {
        setError("An error occurred during verification");
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [setLocation, toast]);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-serif">Verify Email</CardTitle>
          <CardDescription>Verifying your admin email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerifying && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {isSuccess && !isVerifying && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium">Email verified successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to admin dashboard...
                </p>
              </div>
            </div>
          )}

          {error && !isVerifying && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                <Mail className="w-12 h-12 text-muted-foreground opacity-30" />
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Verification Link Expired?</p>
                  <p className="text-sm text-muted-foreground">
                    Request a new verification link or contact your administrator.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/admin/login")}
                >
                  Back to Login
                </Button>
                <Button
                  className="w-full"
                  onClick={async () => {
                    const token = localStorage.getItem("adminToken");
                    if (token) {
                      try {
                        await fetch("/api/admin/request-verification", {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        });
                        toast({
                          title: "Verification email sent",
                          description: "Check your email for the verification link.",
                        });
                      } catch {
                        toast({
                          title: "Error",
                          description: "Failed to send verification email",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                >
                  Resend Link
                </Button>
              </div>
            </div>
          )}

          {!isVerifying && !isSuccess && !error && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/admin/login")}
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
