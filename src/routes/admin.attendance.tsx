import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useDB, db } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/attendance")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const data = useDB((d) => d);
  const [sessionId, setSessionId] = useState<string>(data.sessions[0]?.id ?? "");
  const [q, setQ] = useState("");
  const session = data.sessions.find((s) => s.id === sessionId);
  const list = data.students.filter((s) =>
    [s.fullName, s.usn].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const toggle = (studentId: string, present: boolean) => {
    db.set((d) => {
      const idx = d.attendance.findIndex((a) => a.sessionId === sessionId && a.studentId === studentId);
      if (idx >= 0) d.attendance[idx] = { ...d.attendance[idx], present };
      else d.attendance.push({ sessionId, studentId, present });
      return { ...d, attendance: [...d.attendance] };
    });
  };

  const markAll = (present: boolean) => {
    db.set((d) => {
      const others = d.attendance.filter((a) => a.sessionId !== sessionId);
      const next = d.students.map((s) => ({ sessionId, studentId: s.id, present }));
      return { ...d, attendance: [...others, ...next] };
    });
    toast.success(present ? "All marked present" : "All marked absent");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><ClipboardCheck className="w-7 h-7 text-primary" /> Mark Attendance</h1>
        <p className="text-muted-foreground">Select a session and mark students.</p>
      </div>

      <Card className="glass-strong border-border/50">
        <CardContent className="p-5 grid md:grid-cols-3 gap-3">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Session</Label>
            <Select value={sessionId} onValueChange={setSessionId}>
              <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
              <SelectContent className="glass-strong">
                {data.sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.title} — {new Date(s.date).toLocaleDateString()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Search student</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="glass pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or USN" />
            </div>
          </div>
          <div className="md:col-span-3 flex gap-2">
            <button onClick={() => markAll(true)} className="text-xs px-3 py-1.5 rounded-lg bg-success/15 text-success hover:bg-success/25 transition">Mark all present</button>
            <button onClick={() => markAll(false)} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 transition">Mark all absent</button>
          </div>
        </CardContent>
      </Card>

      {session && (
        <div className="glass rounded-2xl p-4 text-sm">
          <p className="font-medium">{session.title}</p>
          <p className="text-muted-foreground text-xs">{session.description}</p>
        </div>
      )}

      {data.sessions.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">No sessions added yet</p>
      )}
      {data.sessions.length > 0 && data.students.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">No students registered yet</p>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        {data.sessions.length > 0 && list.map((s, i) => {
          const att = data.attendance.find((a) => a.sessionId === sessionId && a.studentId === s.id);
          const present = att?.present ?? false;
          return (
            <div key={s.id} className="glass rounded-2xl p-4 flex items-center justify-between hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
              <div>
                <p className="font-medium">{s.fullName}</p>
                <p className="text-xs text-muted-foreground font-mono">{s.usn} · {s.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${present ? "text-success" : "text-muted-foreground"}`}>{present ? "Present" : "Absent"}</span>
                <Switch checked={present} onCheckedChange={(v) => toggle(s.id, v)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
