import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, ClipboardCheck, FileText,
  MessagesSquare, Users, UserCircle, LogOut, Code2, BarChart3, Megaphone,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { auth, useAuth } from "@/lib/store";

export function AppSidebar() {
  const { user, role } = useAuth();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const studentItems = [
    { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/sessions", label: "Sessions", icon: CalendarDays },
    { to: "/student/assignments", label: "Assignments", icon: FileText },
    { to: "/student/discussion", label: "Discussion", icon: MessagesSquare },
    { to: "/student/profile", label: "Profile", icon: UserCircle },
  ];
  const adminItems = [
    { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/sessions", label: "Sessions", icon: CalendarDays },
    { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
    { to: "/admin/assignments", label: "Assignments", icon: FileText },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/discussion", label: "Discussion", icon: MessagesSquare },
  ];
  const items = role === "admin" ? adminItems : studentItems;

  const initials = (user?.fullName ?? "U").split(" ").map((s: any) => s[0]).slice(0, 2).join("");

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col glass-strong border-r border-border/50 sticky top-0 h-screen">
      <div className="p-6 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl gradient-aurora grid place-items-center shadow-glow">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold tracking-tight">CodeClub</p>
            <p className="text-[11px] text-muted-foreground -mt-0.5">Attendance OS</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((it, i) => {
          const active = path === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 animate-fade-in-up ${
                active
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-9 h-9 ring-2 ring-primary/40">
            {user?.avatar && <AvatarImage src={user.avatar} />}
            <AvatarFallback className="gradient-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{user?.fullName}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 mt-1 text-muted-foreground hover:text-destructive"
          onClick={() => { auth.signOut().then(() => { window.location.href = '/login'; }); navigate({ to: "/login" }); }}
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </aside>
  );
}
