import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useDB } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Clock, FileText, Send, Paperclip, XCircle, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/assignments")({
  component: () => <AuthGate role="student"><DashShell><Page /></DashShell></AuthGate>,
});

type Stat = { submitted_count: number; total_students: number };

function Page() {
  const { user } = useAuth();
  const data = useDB((d) => d);
  const today = new Date();
  const [stats, setStats] = useState<Record<string, Stat>>({});

  useEffect(() => {
    (async () => {
      const { data: rows } = await (supabase.rpc as any)("assignment_submission_stats");
      if (!rows) return;
      const map: Record<string, Stat> = {};
      (rows as any[]).forEach((r) => {
        map[r.assignment_id] = {
          submitted_count: Number(r.submitted_count) || 0,
          total_students: Number(r.total_students) || 0,
        };
      });
      setStats(map);
    })();
  }, [data.assignments.length, data.submissions.length]);

  if (!user) {
    return <p className="text-muted-foreground">No data available</p>;
  }

  const me = user;
  const items = data.assignments.map((a: any) => ({
    ...a,
    submitted: !!data.submissions.find((s: any) => s.assignmentId === a.id && s.studentId === me.id),
    overdue: a.dueDate ? new Date(a.dueDate) < today : false,
    stat: stats[a.id],
  }));
  const current = items.filter((a) => !a.overdue);
  const previous = items.filter((a) => a.overdue);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">Track your current and past assignments.</p>
      </div>
      <Tabs defaultValue="current">
        <TabsList className="glass">
          <TabsTrigger value="current">Current ({current.length})</TabsTrigger>
          <TabsTrigger value="previous">Previous ({previous.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="mt-5">
          <List items={current} meId={me.id} />
        </TabsContent>
        <TabsContent value="previous" className="mt-5">
          <List items={previous} meId={me.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function List({ items, meId }: { items: any[]; meId: string }) {
  if (!items.length) return <p className="text-muted-foreground">Nothing here.</p>;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((a, i) => (
        <AssignmentCard key={a.id} a={a} meId={meId} delay={i * 60} />
      ))}
    </div>
  );
}

function AssignmentCard({ a, meId, delay }: { a: any; meId: string; delay: number }) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const pct = a.stat && a.stat.total_students
    ? Math.round((a.stat.submitted_count / a.stat.total_students) * 100)
    : 0;

  const submit = async () => {
    if (a.overdue) return toast.error("Submission deadline has passed");
    setBusy(true);
    try {
      let file_url: string | null = null;
      if (file) {
        const path = `${meId}/${a.id}-${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("submissions").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("submissions").getPublicUrl(path);
        file_url = pub.publicUrl;
      }
      const { error } = await supabase.from("submissions").insert({
        assignment_id: a.id,
        student_id: meId,
        note: file ? "File submission" : "Submitted via dashboard",
        file_url,
      });
      if (error) throw error;
      toast.success("Submitted");
      setFile(null);
      qc.invalidateQueries({ queryKey: ["app_data"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center shrink-0"><FileText className="w-5 h-5 text-primary-foreground" /></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold truncate">{a.title}</h3>
              {a.overdue ? (
                <Badge className="bg-muted text-muted-foreground border-border/50">Closed</Badge>
              ) : a.submitted ? (
                <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Submitted</Badge>
              ) : (
                <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
              )}
            </div>

            {!a.overdue && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}

            {!a.overdue && a.file_url && (
              <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2 story-link">
                <Paperclip className="w-3 h-3" /> Assignment file
              </a>
            )}

            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground gap-2 flex-wrap">
              <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}</span>
              {a.stat && (
                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {a.stat.submitted_count}/{a.stat.total_students} submitted ({pct}%)</span>
              )}
            </div>

            {a.overdue ? (
              <div className="mt-3 space-y-2">
                {a.stat && (
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full gradient-primary" style={{ width: `${pct}%` }} />
                  </div>
                )}
                {a.submitted ? (
                  <p className="text-xs text-success flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> You submitted this assignment successfully before the deadline.
                  </p>
                ) : (
                  <p className="text-xs text-destructive flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> You did not submit this assignment before the deadline.
                  </p>
                )}
              </div>
            ) : (
              !a.submitted && (
                <div className="mt-3 space-y-2">
                  <Input type="file" className="glass h-9" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <Button size="sm" disabled={busy} onClick={submit} className="w-full gradient-primary text-primary-foreground border-0">
                    <Send className="w-3.5 h-3.5 mr-1" /> {busy ? "Submitting…" : (file ? "Submit file" : "Submit")}
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
