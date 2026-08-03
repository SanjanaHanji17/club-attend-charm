import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useDB, useRefreshData } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, QrCode, CalendarDays, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Scanner } from '@yudiel/react-qr-scanner';

export const Route = createFileRoute("/admin/attendance")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const data = useDB();
  const refresh = useRefreshData();
  const [sid, setSid] = useState<string>("");
  const [showScanner, setShowScanner] = useState(false);
  const [present, setPresent] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // Default to most recent session
  useEffect(() => {
    if (!sid && data.sessions.length > 0) {
      setSid(data.sessions[0].id);
    }
  }, [data.sessions, sid]);

  // Everyone starts absent; only saved present records tick the box.
  useEffect(() => {
    if (!sid) return;
    const map: Record<string, boolean> = {};
    data.attendance.forEach((a: any) => {
      if (a.sessionId === sid && a.present) map[a.studentId] = true;
    });
    setPresent(map);
  }, [sid, data.attendance]);

  const save = async () => {
    if (!sid) return;
    setSaving(true);
    const presentIds = Object.keys(present).filter((id) => present[id]);
    const absentIds = data.students.map((s: any) => s.id).filter((id: string) => !present[id]);

    // Only present students are stored; duplicates are prevented by the unique
    // (session, student) index combined with upsert.
    if (presentIds.length > 0) {
      const { error } = await supabase.from("attendance").upsert(
        presentIds.map((id) => ({ session_id: sid, student_id: id, present: true })),
        { onConflict: "session_id,student_id" }
      );
      if (error) { setSaving(false); return toast.error(error.message); }
    }
    if (absentIds.length > 0) {
      const { error } = await supabase.from("attendance").delete().eq("session_id", sid).in("student_id", absentIds);
      if (error) { setSaving(false); return toast.error(error.message); }
    }
    setSaving(false);
    toast.success(`Attendance saved — ${presentIds.length} present`);
    await refresh();
  };

  const markAll = (value: boolean) => {
    const map: Record<string, boolean> = {};
    if (value) data.students.forEach((s: any) => { map[s.id] = true; });
    setPresent(map);
  };

  const handleScan = async (result: any) => {
    if (!result || !result[0] || !sid) return;
    const scannedQr = result[0].rawValue;

    const student = data.students.find((s: any) => s.qrCode === scannedQr);
    if (!student) {
      toast.error("Invalid QR Code or student not found!");
      return;
    }

    if (present[student.id]) {
      toast.info(`${student.fullName} is already marked present.`);
      return;
    }

    const { error } = await supabase.from("attendance")
      .upsert({ session_id: sid, student_id: student.id, present: true }, { onConflict: "session_id,student_id" });

    if (error) return toast.error(error.message);
    setPresent((p) => ({ ...p, [student.id]: true }));
    toast.success(`Attendance marked for ${student.fullName}`);
    await refresh();
  };

  const session = data.sessions.find((x: any) => x.id === sid);
  const students = data.students.filter((s: any) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (s.fullName || "").toLowerCase().includes(q) || (s.usn || "").toLowerCase().includes(q);
  });
  const presentCount = data.students.filter((s: any) => present[s.id]).length;
  const absentCount = data.students.length - presentCount;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ClipboardCheck className="w-8 h-8 text-primary" /> Attendance</h1>
          <p className="text-muted-foreground mt-1">Everyone starts absent — tick who attended, then save.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end glass-strong p-4 rounded-xl border-border/50">
        <div className="w-full sm:w-80 space-y-1.5">
          <label className="text-sm font-medium">Select Session</label>
          <Select value={sid} onValueChange={setSid}>
            <SelectTrigger className="glass bg-background/50"><SelectValue placeholder="Choose a session" /></SelectTrigger>
            <SelectContent>
              {data.sessions.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.title} ({new Date(s.date).toLocaleDateString()})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {session && (
          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 flex-wrap">
            <Button onClick={() => markAll(true)} variant="outline" className="glass border-border/60">Mark All Present</Button>
            <Button onClick={() => markAll(false)} variant="outline" className="glass border-border/60">Clear All</Button>
            <Button onClick={() => setShowScanner(!showScanner)} className="gradient-primary text-primary-foreground border-0 shadow-glow">
              <QrCode className="w-4 h-4 mr-2" /> Scan QR
            </Button>
          </div>
        )}
      </div>

      {showScanner && session && (
        <Card className="glass border-border/50 max-w-md mx-auto overflow-hidden animate-scale-in">
          <CardContent className="p-0">
            <div className="bg-muted p-3 text-center text-sm font-medium border-b border-border/50">
              Scanning for: {session.title}
            </div>
            <div className="aspect-square">
              <Scanner onScan={handleScan} />
            </div>
            <div className="p-3 text-center">
              <Button variant="ghost" size="sm" onClick={() => setShowScanner(false)}>Close Scanner</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!session ? (
        <p className="text-muted-foreground text-center py-10 glass rounded-xl">Please select a session to view attendance.</p>
      ) : (
        <Card className="glass border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-muted/20 flex flex-wrap gap-3 justify-between items-center">
            <h3 className="font-medium flex items-center gap-2"><CalendarDays className="w-4 h-4 text-muted-foreground" /> Student List</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-success/20 text-success border-success/30">{presentCount} Present</Badge>
              <Badge className="bg-destructive/20 text-destructive border-destructive/30">{absentCount} Absent</Badge>
              <Badge variant="outline" className="glass">{data.students.length} Total</Badge>
            </div>
          </div>
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="glass pl-9" placeholder="Search by name or USN" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {students.map((st: any) => (
              <label key={st.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-foreground">{st.fullName}</p>
                  <p className="text-xs text-muted-foreground">{st.usn} • {st.department}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${present[st.id] ? "text-success" : "text-muted-foreground"}`}>
                    {present[st.id] ? "Present" : "Absent"}
                  </span>
                  <Checkbox
                    checked={!!present[st.id]}
                    onCheckedChange={(v) => setPresent((p) => ({ ...p, [st.id]: !!v }))}
                  />
                </div>
              </label>
            ))}
            {students.length === 0 && (
              <p className="p-6 text-center text-muted-foreground">
                {data.students.length === 0 ? "No students registered yet." : "No students match your search."}
              </p>
            )}
          </div>
          {data.students.length > 0 && (
            <div className="p-4 border-t border-border/50 flex justify-end">
              <Button onClick={save} disabled={saving} className="gradient-primary text-primary-foreground border-0 shadow-glow">
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Save Attendance"}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
