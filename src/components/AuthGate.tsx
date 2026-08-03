import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { auth, useAuth } from "@/lib/store";
import { Role } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function AuthGate({ role, children }: { role: Role; children: ReactNode }) {
  const navigate = useNavigate();
  const { session, user, isAuthenticated, loading, profileMissing } = useAuth();

  useEffect(() => {
    if (loading || profileMissing) return;

    if (!session) {
      navigate({ to: "/login" });
      return;
    }

    if (user && session.role && session.role !== role) {
      navigate({ to: session.role === "admin" ? "/admin/dashboard" : "/student/dashboard" });
    }
  }, [navigate, role, session, user, loading, profileMissing]);

  if (profileMissing) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="glass-strong rounded-2xl px-8 py-7 text-center space-y-3 max-w-md">
          <p className="font-semibold">Your profile could not be loaded</p>
          <p className="text-sm text-muted-foreground">
            This account has no profile record. Please sign in again or register a new account.
          </p>
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => auth.signOut().then(() => navigate({ to: "/login" }))}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !session || !isAuthenticated || !user || session.role !== role) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="glass rounded-2xl px-8 py-6 animate-pulse">Loading…</div>
      </div>
    );
  }
  return <>{children}</>;
}
