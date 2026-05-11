import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useDB } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User2, Mic, Search, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/student/sessions")({
  component: () => <AuthGate role="student"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const { user } = useAuth();
  const data = useDB((d) => d);
  const [q, setQ] = useState("");

  if (!user) {
    return <p className="text-muted-foreground">No data available</p>;
  }

  const me = user;
  const sessions = data.sessions
    .filter((s) => s.title.toLowerCase().includes(q.toLowerCase()) || s.resourcePerson.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">Your coding club sessions, with attendance status.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="glass pl-9" placeholder="Search by title or resource person…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {sessions.map((s, i) => {
          const att = data.attendance.find((a) => a.sessionId === s.id && a.studentId === me.id);
          const present = att?.present;
          return (
            <Card key={s.id} className="glass border-border/50 hover-lift animate-fade-in-up overflow-hidden" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                  </div>
                  {att ? (
                    present ? (
                      <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Present</Badge>
                    ) : (
                      <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1" /> Absent</Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="glass">Upcoming</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {new Date(s.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><User2 className="w-3.5 h-3.5" /> Host: {s.host}</span>
                  <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> {s.resourcePerson}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!sessions.length && <p className="text-muted-foreground">No sessions found.</p>}
      </div>
    </div>
  );
}
