import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useDB, Admin } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, CalendarDays, ClipboardCheck, FileText, TrendingUp, Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const { user } = useAuth();
  const me = user as Admin;
  const data = useDB((d) => d);

  const totalStudents = data.students.length;
  const totalSessions = data.sessions.length;
  const avgAtt = totalSessions ? Math.round(
    (data.attendance.filter((a) => a.present).length / (totalStudents * totalSessions || 1)) * 100
  ) : 0;
  const pendingSubs = data.assignments.length * totalStudents - data.submissions.length;

  const sessionAttendance = data.sessions.map((s) => {
    const records = data.attendance.filter((a) => a.sessionId === s.id);
    const present = records.filter((r) => r.present).length;
    return { name: s.title.slice(0, 12), present, total: totalStudents };
  });

  const deptStats = Object.entries(
    data.students.reduce((acc: Record<string, number>, s) => {
      acc[s.department] = (acc[s.department] || 0) + 1; return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden animate-fade-in-up">
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full gradient-aurora opacity-30 blur-3xl" />
        <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Admin overview</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1">Hi, {me.fullName.split(" ")[0]}</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">Here's the pulse of your coding club.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Students", value: totalStudents },
          { icon: CalendarDays, label: "Sessions", value: totalSessions },
          { icon: TrendingUp, label: "Avg Attendance", value: `${avgAtt}%` },
          { icon: FileText, label: "Pending Submissions", value: Math.max(0, pendingSubs) },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-3xl font-bold mt-2">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="glass border-border/50 lg:col-span-2 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Attendance per session</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <AreaChart data={sessionAttendance}>
                <defs>
                  <linearGradient id="aa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.19 295)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="oklch(0.72 0.19 295)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 270)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 270)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="present" stroke="oklch(0.72 0.19 295)" strokeWidth={3} fill="url(#aa)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Students by department</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 270)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 270)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="oklch(0.7 0.18 200)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50 animate-fade-in-up">
        <CardHeader><CardTitle className="text-base">Recent sessions</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {data.sessions.slice(0, 4).map((s) => (
            <div key={s.id} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{s.title}</p>
                <span className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{s.resourcePerson}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
