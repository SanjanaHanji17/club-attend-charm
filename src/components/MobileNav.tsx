import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Code2, LogOut } from "lucide-react";
import { auth, useAuth } from "@/lib/store";

export function MobileNav({ items }: { items: { to: string; label: string; icon: any }[] }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { user, role } = useAuth();
  return (
    <header className="md:hidden sticky top-0 z-40 glass-strong border-b border-border/50 px-4 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-aurora grid place-items-center">
          <Code2 className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold">CodeClub</span>
      </Link>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon"><Menu /></Button>
        </SheetTrigger>
        <SheetContent side="right" className="glass-strong border-border/50 p-0">
          <div className="p-6 border-b border-border/50">
            <p className="font-bold">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground uppercase">{role}</p>
          </div>
          <nav className="p-3 space-y-1">
            {items.map((it) => {
              const Icon = it.icon;
              const active = path === it.to;
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                    active ? "gradient-primary text-primary-foreground" : "hover:bg-sidebar-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {it.label}
                </Link>
              );
            })}
            <Button
              variant="ghost" size="sm"
              className="w-full justify-start gap-2 mt-2 text-destructive"
              onClick={() => { auth.set(null); navigate({ to: "/login" }); }}
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
