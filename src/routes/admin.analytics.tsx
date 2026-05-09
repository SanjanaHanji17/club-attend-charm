import { createFileRoute } from "@tanstack/react-router";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useDB } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const data = useDB((d) => d);

  const perStudent = data.students.map((s) => {
    const recs = data.attendance.filter((a) => a.studentId === s.id);
    const present = recs.filter((r) => r.present).length;
    const pct = data.sessions.length ? Math.round((present / data.sessions.length) * 100) : 0;
    return { name: s.fullName.split(" ")[0], pct };
  });

  const trend = data.sessions.map((s) => {
    const recs = data.attendance.filter((a) => a.sessionId === s.id);
    const pct = data.students.length ? Math.round((recs.filter((r) => r.present).length / data.students.length) * 100) : 0;
    return { name: s.title.slice(0, 10), pct };
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Deep insight into engagement.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Per-student attendance %</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer>
              <RadarChart data={perStudent}>
                <PolarGrid stroke="oklch(1 0 0 / 12%)" />
                <PolarAngleAxis dataKey="name" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <PolarRadiusAxis stroke="oklch(0.7 0.03 270)" fontSize={10} />
                <Radar dataKey="pct" stroke="oklch(0.72 0.19 295)" fill="oklch(0.72 0.19 295)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 animate-fade-in-up">
          <CardHeader><CardTitle className="text-base">Attendance trend (% per session)</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
                <XAxis dataKey="name" stroke="oklch(0.7 0.03 270)" fontSize={11} />
                <YAxis stroke="oklch(0.7 0.03 270)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.03 270)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="pct" stroke="oklch(0.7 0.18 200)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
