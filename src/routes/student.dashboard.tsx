import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useDB } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Flame, TrendingUp, Sparkles, Inbox, QrCode, Download, Megaphone } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/student/dashboard")({
  component: () => <AuthGate role="student"><DashShell><Page /></DashShell></AuthGate>,
});

function StatCard({
  icon: Icon, label, value, color, delay,
}: { icon: any; label: string; value: string | number; color: string; delay: number }) {
  return (
    <Card className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
          <Icon className={`w-4 h-4 ${color}`} />
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

function streak(records: { sessionId: string; present: boolean }[], orderedIds: string[]) {
  let s = 0;
  for (let i = orderedIds.length - 1; i >= 0; i--) {
    const r = records.find((x) => x.sessionId === orderedIds[i]);
    if (r?.present) s++;
    else break;
  }
  return s;
}

function Page() {
  const { user } = useAuth();
  const data = useDB((d) => d);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  

  useEffect(() => {
    if (!user) return;
    const ensureQr = async () => {
      let code = user.qrCode;
      if (!code) {
        code = (Math.random().toString(36).slice(2, 10).toUpperCase() + (user.usn || "").slice(-4));
        await supabase.from("profiles").update({ qr_code: code }).eq("id", user.id);
      }
      const payload = JSON.stringify({ usn: user.usn, id: user.id, code });
      setQrValue(payload);
      const url = await QRCode.toDataURL(payload, { width: 320, margin: 2, color: { dark: "#0b0b14", light: "#ffffff" } });
      setQrDataUrl(url);
    };
    ensureQr();
  }, [user]);

  if (!user) {
    return <EmptyState message="Loading your dashboard..." />;
  }

  const student = user;

  const myAttendance = data.attendance.filter((a) => a.studentId === student.id);
  const totalSessions = data.sessions.length;
  const attended = myAttendance.filter((a) => a.present).length;
  const attendancePct = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;
  const currentStreak = totalSessions > 0 ? streak(myAttendance, data.sessions.map((s) => s.id)) : 0;

  const trend = data.sessions.map((s, i) => {
    const upTo = data.sessions.slice(0, i + 1);
    const att = upTo.filter((ss) => myAttendance.find((a) => a.sessionId === ss.id && a.present)).length;
    return { name: s.title.slice(0, 8), value: Math.round((att / (i + 1)) * 100) };
  });

  const pie = totalSessions > 0
    ? [
        { name: "Attended", value: attended },
        { name: "Missed", value: totalSessions - attended },
      ]
    : [];
  const COLORS = ["oklch(0.72 0.19 295)", "oklch(0.27 0.04 270)"];

  const myAssignments = data.assignments.map((a) => ({
    ...a,
    submitted: !!data.submissions.find((s) => s.assignmentId === a.id && s.studentId === student.id),
  }));
  const submittedCount = myAssignments.filter((a) => a.submitted).length;
  const pendingCount = myAssignments.length - submittedCount;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="glass-strong rounded-3xl p-6 md:p-8 relative overflow-hidden animate-fade-in-up">
        <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full gradient-aurora opacity-30 blur-3xl" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Welcome back
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">Hi, {(student.fullName || "Student").split(" ")[0]} 👋</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">Your live coding club journey.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="glass">{student.department || "Department not set"}</Badge>
            <Badge variant="outline" className="glass">{student.year ? `${student.year} year` : "Year not set"}</Badge>
            {student.usn && <Badge variant="outline" className="glass">USN: {student.usn}</Badge>}
          </div>
        </div>
      </div>

      {data.announcements && data.announcements.length > 0 && (
        <Card className="glass border-primary/40 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" /> Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...data.announcements]
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map((a: any) => (
                <div key={a.id} className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{a.title}</p>
                    <span className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      <Card className="glass border-border/50 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" /> My QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-5">
          <div className="bg-white p-3 rounded-xl shadow-glow">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Your attendance QR" className="w-44 h-44" />
            ) : (
              <div className="w-44 h-44 grid place-items-center text-xs text-muted-foreground">Generating...</div>
            )}
          </div>
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">Show this QR to admins for attendance. It is unique to your account and stays the same across logins.</p>
            <p className="text-xs text-muted-foreground break-all">USN: <span className="font-mono">{student.usn}</span></p>
            <Button
              disabled={!qrDataUrl}
              onClick={() => {
                const a = document.createElement("a");
                a.href = qrDataUrl;
                a.download = `qr-${student.usn || student.id}.png`;
                a.click();
              }}
              className="gradient-primary text-primary-foreground border-0 shadow-glow"
            >
              <Download className="w-4 h-4 mr-2" /> Download QR
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Attended" value={attended} color="text-success" delay={0} />
        <StatCard icon={CalendarDays} label="Total Sessions" value={totalSessions} color="text-primary" delay={60} />
        <StatCard icon={TrendingUp} label="Attendance %" value={`${attendancePct}%`} color="text-accent" delay={120} />
        <StatCard icon={Flame} label="Current Streak" value={currentStreak} color="text-warning" delay={180} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="glass border-border/50 lg:col-span-2 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Attendance Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            {trend.length === 0 ? (
              <EmptyState message="No attendance records found" />
            ) : (
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
            )}
          </CardContent>
        </Card>
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Attendance Split</CardTitle></CardHeader>
          <CardContent className="h-72">
            {pie.length === 0 ? (
              <EmptyState message="No sessions available" />
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Overall progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-muted-foreground">Attendance</span>
              <span className="text-2xl font-bold gradient-text">{attendancePct}%</span>
            </div>
            <Progress value={attendancePct} className="h-3" />
            <p className="text-xs text-muted-foreground mt-3">
              {totalSessions === 0
                ? "No sessions available yet."
                : attendancePct >= 75
                ? "Excellent — you're on track!"
                : "Boost it past 75% by attending the next sessions."}
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Assignments at a glance</CardTitle></CardHeader>
          <CardContent className="h-48">
            {myAssignments.length === 0 ? (
              <EmptyState message="No assignments uploaded" />
            ) : (
              <ResponsiveContainer>
                <BarChart data={[
                  { name: "Submitted", value: submittedCount },
                  { name: "Pending", value: pendingCount },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                  <XAxis dataKey="name" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                  <YAxis stroke="oklch(0.7 0.03 270)" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.18 0.03 270)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: 12 }} />
                  <Bar dataKey="value" fill="oklch(0.72 0.19 295)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
