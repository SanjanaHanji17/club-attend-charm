import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useDB } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, QrCode, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Scanner } from '@yudiel/react-qr-scanner';

export const Route = createFileRoute("/admin/attendance")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const data = useDB();
  const [sid, setSid] = useState<string>("");
  const [showScanner, setShowScanner] = useState(false);

  // Default to most recent session
  useEffect(() => {
    if (!sid && data.sessions.length > 0) {
      setSid(data.sessions[0].id);
    }
  }, [data.sessions, sid]);

  const toggle = async (att: any, present: boolean) => {
    if (!sid) return;
    const { error } = await supabase.from("attendance")
      .upsert({ session_id: sid, student_id: att.id, present }, { onConflict: "session_id,student_id" });
    if (error) return toast.error(error.message);
    toast.success("Attendance updated");
    window.location.reload();
  };

  const markAll = async (present: boolean) => {
    if (!sid) return;
    if (!confirm(`Mark all ${present ? "Present" : "Absent"}?`)) return;
    
    const records = data.students.map((s: any) => ({
      session_id: sid,
      student_id: s.id,
      present
    }));

    const { error } = await supabase.from("attendance")
      .upsert(records, { onConflict: "session_id,student_id" });
    if (error) return toast.error(error.message);
    toast.success(`All students marked ${present ? "present" : "absent"}`);
    window.location.reload();
  };

  const handleScan = async (result: any) => {
    if (!result || !result[0]) return;
    const scannedQr = result[0].rawValue;
    
    const student = data.students.find((s: any) => s.qrCode === scannedQr);
    if (!student) {
      toast.error("Invalid QR Code or student not found!");
      return;
    }

    const alreadyMarked = data.attendance.find((a: any) => a.sessionId === sid && a.studentId === student.id && a.present);
    if (alreadyMarked) {
      toast.info(`${student.fullName} is already marked present.`);
      setShowScanner(false);
      return;
    }

    const { error } = await supabase.from("attendance")
      .upsert({ session_id: sid, student_id: student.id, present: true }, { onConflict: "session_id,student_id" });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Attendance marked successfully for ${student.fullName}`);
    }
    
    setShowScanner(false);
    window.location.reload();
  };

  const session = data.sessions.find((x: any) => x.id === sid);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ClipboardCheck className="w-8 h-8 text-primary" /> Attendance</h1>
          <p className="text-muted-foreground mt-1">Track and manage session attendance</p>
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
          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button onClick={() => markAll(true)} variant="outline" className="flex-1 sm:flex-none glass hover:bg-success/10 hover:text-success border-border/60">Mark All Present</Button>
            <Button onClick={() => setShowScanner(!showScanner)} className="flex-1 sm:flex-none gradient-primary text-primary-foreground border-0 shadow-glow">
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
          <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
            <h3 className="font-medium flex items-center gap-2"><CalendarDays className="w-4 h-4 text-muted-foreground" /> Student List</h3>
            <Badge variant="outline" className="glass">{data.students.length} Total</Badge>
          </div>
          <div className="divide-y divide-border/50">
            {data.students.map((st: any) => {
              const att = data.attendance.find((a: any) => a.sessionId === sid && a.studentId === st.id);
              const present = att?.present;
              return (
                <div key={st.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">{st.fullName}</p>
                    <p className="text-xs text-muted-foreground">{st.usn} • {st.department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {present ? (
                      <Badge className="bg-success/20 text-success hover:bg-success/30 border-success/30 transition-colors cursor-pointer" onClick={() => toggle(st, false)}>Present</Badge>
                    ) : (
                      <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/30 transition-colors cursor-pointer" onClick={() => toggle(st, true)}>Absent</Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {data.students.length === 0 && <p className="p-6 text-center text-muted-foreground">No students registered yet.</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
