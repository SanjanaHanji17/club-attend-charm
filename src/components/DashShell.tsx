import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import {
  LayoutDashboard, CalendarDays, ClipboardCheck, FileText,
  MessagesSquare, Users, UserCircle, BarChart3,
} from "lucide-react";
import { useAuth } from "@/lib/store";

export function DashShell({ children }: { children: ReactNode }) {
  const { role } = useAuth();
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
  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav items={items} />
        <main className="flex-1 p-4 md:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
