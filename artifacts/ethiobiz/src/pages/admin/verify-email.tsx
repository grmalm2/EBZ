import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { verifyAdminEmail, getAdminToken } from "@/lib/admin";
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowLeft } from "lucide-react";

export default function AdminVerifyEmail() {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = getAdminToken();

        if (!token) {
          setError("No authentication token found. Please log in again.");
          setIsVerifying(false);
          return;
        }

        const result = await verifyAdminEmail();

        setIsSuccess(true);
        setIsVerifying(false);

        toast({
          title: "Email verified!",
          description: "Your admin email has been verified successfully.",
        });

        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = "/admin";
        }, 2000);
      } catch (err: any) {
        setError(err?.message || "An error occurred during verification");
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [toast]);

  const handleResend = async () => {
    try {
      // The request-verification endpoint sends a magic link
      const token = getAdminToken();
      if (!token) return;

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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-bold text-2xl shadow-xl shadow-primary/20 transition-transform group-hover:scale-105">
              E
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight">EthiooBiz</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-border/60">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Mail className="w-7 h-7" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
            <CardDescription>Verifying your admin email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {isVerifying && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Verifying your email...</p>
              </div>
            )}

            {isSuccess && !isVerifying && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium text-lg">Email verified successfully!</p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to admin dashboard...
                  </p>
                </div>
              </div>
            )}

            {error && !isVerifying && (
              <div className="space-y-4">
                <Alert variant="destructive" className="text-sm">
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
                  <Link href="/admin/login" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Button>
                  </Link>
                  <Button className="w-full" onClick={handleResend}>
                    Resend Link
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
