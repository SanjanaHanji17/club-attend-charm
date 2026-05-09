import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { auth, useAuth } from "@/lib/store";
import { Role } from "@/lib/store";

export function AuthGate({ role, children }: { role: Role; children: ReactNode }) {
  const navigate = useNavigate();
  const { session } = useAuth();
  useEffect(() => {
    const s = auth.get();
    if (!s) navigate({ to: "/login" });
    else if (s.role !== role) {
      navigate({ to: s.role === "admin" ? "/admin/dashboard" : "/student/dashboard" });
    }
  }, [navigate, role]);
  if (!session || session.role !== role) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="glass rounded-2xl px-8 py-6 animate-pulse">Loading…</div>
      </div>
    );
  }
  return <>{children}</>;
}
