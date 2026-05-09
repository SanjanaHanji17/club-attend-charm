import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useDB, Admin } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, TrendingUp, FileText, Sparkles, Inbox } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function StatCard({
  icon: Icon, label, value, delay,
}: { icon: any; label: string; value: string | number; delay: number }) {
  return (
    <Card className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full grid place-items-center text-sm text-muted-foreground gap-2">
      <Inbox className="w-6 h-6 opacity-60" />
      <span>{message}</span>
    </div>
  );
}

function Page() {
  const { user } = useAuth();
  const me = user as Admin;
  const data = useDB((d) => d);

  const totalStudents = data.students.length;
  const totalSessions = data.sessions.length;
  const totalAssignments = data.assignments.length;

  const presentCount = data.attendance.filter((a) => a.present).length;
  const possibleCount = totalStudents * totalSessions;
  const avgAttendance = possibleCount > 0 ? Math.round((presentCount / possibleCount) * 100) : 0;

  const pendingSubmissions =
    totalAssignments > 0 && totalStudents > 0
      ? Math.max(0, totalAssignments * totalStudents - data.submissions.length)
      : 0;

  const attendancePerSession = data.sessions.map((s) => {
    const present = data.attendance.filter((a) => a.sessionId === s.id && a.present).length;
    return { name: s.title.slice(0, 12), present };
  });

  const studentsByDept = Object.entries(
    data.students.reduce((acc: Record<string, number>, s) => {
      acc[s.department] = (acc[s.department] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden animate-fade-in-up">
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full gradient-aurora opacity-30 blur-3xl" />
        <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Admin overview
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mt-1">Hi, {me.fullName.split(" ")[0]}</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">Live pulse of your coding club.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={totalStudents} delay={0} />
        <StatCard icon={CalendarDays} label="Total Sessions" value={totalSessions} delay={60} />
        <StatCard icon={TrendingUp} label="Avg Attendance" value={`${avgAttendance}%`} delay={120} />
        <StatCard icon={FileText} label="Pending Submissions" value={pendingSubmissions} delay={180} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="glass border-border/50 lg:col-span-2 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Attendance per session</CardTitle></CardHeader>
          <CardContent className="h-72">
            {attendancePerSession.length === 0 ? (
              <EmptyState message="No attendance records found" />
            ) : (
              <ResponsiveContainer>
                <AreaChart data={attendancePerSession}>
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
            )}
          </CardContent>
        </Card>
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Students by department</CardTitle></CardHeader>
          <CardContent className="h-72">
            {studentsByDept.length === 0 ? (
              <EmptyState message="No students registered yet" />
            ) : (
              <ResponsiveContainer>
                <BarChart data={studentsByDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                  <XAxis dataKey="name" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                  <YAxis stroke="oklch(0.7 0.03 270)" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.18 0.03 270)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: 12 }} />
                  <Bar dataKey="value" fill="oklch(0.7 0.18 200)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50 animate-fade-in-up">
        <CardHeader><CardTitle className="text-base">Recent sessions</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {data.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground md:col-span-2 text-center py-6">No sessions created yet</p>
          ) : (
            data.sessions.slice(0, 4).map((s) => (
              <div key={s.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{s.title}</p>
                  <span className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{s.resourcePerson}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
