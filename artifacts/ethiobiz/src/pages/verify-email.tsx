import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the current session
        const { data } = await supabaseClient.auth.getSession();

        if (!data.session) {
          setError("No active session found. Please sign up again.");
          setIsVerifying(false);
          return;
        }

        setUserEmail(data.session.user.email || null);

        // Check if email is already confirmed
        if (data.session.user.email_confirmed_at) {
          setIsSuccess(true);
          setIsVerifying(false);

          toast({
            title: "Email verified!",
            description: "Your email has been verified successfully.",
          });

          // Redirect to home after 2 seconds
          setTimeout(() => {
            setLocation("/");
          }, 2000);
        } else {
          setIsVerifying(false);
          setError(null);
        }
      } catch (err) {
        setError("An error occurred");
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [setLocation, toast]);

  const handleResendEmail = async () => {
    try {
      if (!userEmail) {
        toast({
          title: "Error",
          description: "Email address not found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabaseClient.auth.resendEntirely({
        email: userEmail,
        type: "signup",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Verification email sent",
        description: `Check your email at ${userEmail} for the verification link.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-serif">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerifying && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                Checking your email verification status...
              </p>
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
                  Redirecting to home page...
                </p>
              </div>
            </div>
          )}

          {!isSuccess && !isVerifying && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <Mail className="w-12 h-12 text-primary opacity-50" />
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Check your email</p>
                  {userEmail && (
                    <p className="text-sm text-muted-foreground">
                      We sent a verification link to <strong>{userEmail}</strong>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Click the link in the email to verify your account.
                  </p>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                <p className="font-medium text-sm">Didn't receive the email?</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Check your spam folder</li>
                  <li>Click the button below to send another email</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation("/login")}
                >
                  Back to Login
                </Button>
                <Button className="w-full" onClick={handleResendEmail}>
                  Resend Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
