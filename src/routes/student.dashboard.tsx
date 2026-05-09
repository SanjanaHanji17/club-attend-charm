import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useDB, Student } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Flame, TrendingUp, Sparkles } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/student/dashboard")({
  component: () => <AuthGate role="student"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const { user } = useAuth();
  const student = user as Student;
  const data = useDB((d) => d);
  const myAttendance = data.attendance.filter((a) => a.studentId === student.id);
  const total = data.sessions.length;
  const attended = myAttendance.filter((a) => a.present).length;
  const percent = total ? Math.round((attended / total) * 100) : 0;

  const trend = data.sessions.map((s, i) => {
    const upTo = data.sessions.slice(0, i + 1);
    const att = upTo.filter((ss) => myAttendance.find((a) => a.sessionId === ss.id && a.present)).length;
    return { name: s.title.slice(0, 8), value: Math.round((att / (i + 1)) * 100) };
  });

  const pie = [
    { name: "Attended", value: attended },
    { name: "Missed", value: total - attended },
  ];
  const COLORS = ["oklch(0.72 0.19 295)", "oklch(0.27 0.04 270)"];

  const myAssignments = data.assignments.map((a) => ({
    ...a,
    submitted: !!data.submissions.find((s) => s.assignmentId === a.id && s.studentId === student.id),
  }));

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome banner */}
      <div className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden animate-fade-in-up">
        <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full gradient-aurora opacity-30 blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Welcome back</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">Hi, {student.fullName.split(" ")[0]} 👋</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">Here's a snapshot of your coding club journey. Keep the streak going!</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="glass">{student.department}</Badge>
            <Badge variant="outline" className="glass">{student.year} year</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle2, label: "Attended", value: attended, color: "text-success" },
          { icon: CalendarDays, label: "Total Sessions", value: total, color: "text-primary" },
          { icon: TrendingUp, label: "Attendance %", value: `${percent}%`, color: "text-accent" },
          { icon: Flame, label: "Current Streak", value: streak(myAttendance, data.sessions.map((s) => s.id)), color: "text-warning" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-3xl font-bold mt-2">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="glass border-border/50 lg:col-span-2 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Attendance Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.72 0.19 295)" />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 200)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 270)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 270)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="value" stroke="url(#g)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.72 0.19 295)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Attendance Split</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4} stroke="none">
                  {pie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 270)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 text-xs -mt-6">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[0] }} /> Attended</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[1] }} /> Missed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress + assignments preview */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Overall progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-muted-foreground">Attendance</span>
              <span className="text-2xl font-bold gradient-text">{percent}%</span>
            </div>
            <Progress value={percent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-3">
              {percent >= 75 ? "Excellent — you're on track!" : "Boost it past 75% by attending the next sessions."}
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Assignments at a glance</CardTitle></CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer>
              <BarChart data={[
                { name: "Submitted", value: myAssignments.filter((a) => a.submitted).length },
                { name: "Pending", value: myAssignments.filter((a) => !a.submitted).length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 270)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 270)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="oklch(0.72 0.19 295)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function streak(records: { sessionId: string; present: boolean }[], orderedIds: string[]) {
  let s = 0;
  for (let i = orderedIds.length - 1; i >= 0; i--) {
    const r = records.find((x) => x.sessionId === orderedIds[i]);
    if (r?.present) s++; else break;
  }
  return s;
}
