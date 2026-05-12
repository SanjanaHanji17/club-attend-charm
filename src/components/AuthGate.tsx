import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { auth, useAuth } from "@/lib/store";
import { Role } from "@/lib/store";

export function AuthGate({ role, children }: { role: Role; children: ReactNode }) {
  const navigate = useNavigate();
  const { session, user, isAuthenticated } = useAuth();
  useEffect(() => {
    const s = auth.get();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }

    if (s.role === role && !user) {
      auth.signOut().then(() => { window.location.href = '/login'; });
      navigate({ to: "/login" });
      return;
    }

    if (s.role !== role) {
      navigate({ to: s.role === "admin" ? "/admin/dashboard" : "/student/dashboard" });
    }
  }, [navigate, role, session, user]);
  if (!session || session.role !== role || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="glass rounded-2xl px-8 py-6 animate-pulse">Loading…</div>
      </div>
    );
  }
  return <>{children}</>;
}
