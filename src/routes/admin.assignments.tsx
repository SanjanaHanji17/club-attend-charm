import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useDB } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, CheckCircle2, Clock, Paperclip, Download } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/assignments")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const data = useDB((d) => d);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "", dueDate: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState<Record<string, any[]>>({});

  const refresh = () => qc.invalidateQueries({ queryKey: ["app_data"] });

  const create = async () => {
    if (!f.title || !f.dueDate) return toast.error("Title and due date are required");
    setBusy(true);
    let file_url: string | null = null;
    try {
      if (file) {
        const path = `${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("assignments").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("assignments").getPublicUrl(path);
        file_url = pub.publicUrl;
      }
      const { error } = await supabase.from("assignments").insert({
        title: f.title,
        description: f.description,
        due_date: new Date(f.dueDate).toISOString(),
        file_url,
      });
      if (error) throw error;
      toast.success("Assignment created");
      setOpen(false);
      setF({ title: "", description: "", dueDate: "" });
      setFile(null);
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  const loadSubmissions = async (assignmentId: string) => {
    const { data: subs, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });
    if (error) return toast.error(error.message);
    setSubmissionsByAssignment((s) => ({ ...s, [assignmentId]: subs || [] }));
  };

  useEffect(() => {
    data.assignments.forEach((a: any) => {
      if (!submissionsByAssignment[a.id]) loadSubmissions(a.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.assignments]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Manage assignments and track submissions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
              <Plus className="w-4 h-4 mr-1.5" /> New assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-border/60">
            <DialogHeader><DialogTitle>Create assignment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Title</Label><Input className="glass" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea className="glass" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Due date</Label><Input type="date" className="glass" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Attachment (optional)</Label><Input type="file" className="glass" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
              <Button disabled={busy} className="w-full gradient-primary text-primary-foreground border-0" onClick={create}>{busy ? "Saving…" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {data.assignments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">No assignments available</p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {data.assignments.map((a: any, i: number) => {
          const subs = submissionsByAssignment[a.id];
          const submitted = subs?.length ?? 0;
          const total = data.students.length;
          const pct = total ? Math.round((submitted / total) * 100) : 0;
          const closed = !!(a.dueDate && new Date(a.dueDate) < new Date());
          return (
            <Card key={a.id} className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center shrink-0">
                    <FileText className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{a.title}</h3>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(a.id, a.title)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {closed ? (
                      <div className="mt-1 space-y-1 text-xs">
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" /> Status: <span className="text-foreground font-medium">Closed</span>
                        </p>
                        <p className="text-muted-foreground">
                          Submitted: <span className="text-foreground font-medium">{submitted} / {total} students ({pct}%)</span>
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                        {a.file_url && (
                          <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-2 story-link">
                            <Paperclip className="w-3 h-3" /> Attached file
                          </a>
                        )}
                      </>
                    )}

                    <div className="flex items-center justify-between mt-3 text-xs gap-2 flex-wrap">
                      <span className="text-muted-foreground">Due {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}</span>
                      <Button size="sm" variant="outline" className="glass h-7" onClick={() => loadSubmissions(a.id)}>
                        {subs ? `${submitted}/${total} (${pct}%)` : "Load submissions"}
                      </Button>
                    </div>

                    {subs && (
                      <div className="mt-3 grid gap-1.5">
                        {subs.length === 0 && <p className="text-xs text-muted-foreground">No submissions yet</p>}
                        {subs.map((s: any) => {
                          const student = data.students.find((st: any) => st.id === s.student_id);
                          return (
                            <div key={s.id} className="glass rounded-lg px-2.5 py-2 text-xs space-y-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="font-medium truncate">{student?.fullName || "Student"}</span>
                                <span className="text-muted-foreground">{student?.usn || ""}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-muted-foreground">{new Date(s.submitted_at).toLocaleString()}</span>
                                <Badge className="bg-success/20 text-success border-success/30 h-5">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
                                </Badge>
                              </div>
                              {s.file_url ? (
                                <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary">
                                  <Download className="w-3 h-3" /> View Document
                                </a>
                              ) : (
                                <span className="text-muted-foreground">No document uploaded{s.note ? ` · ${s.note}` : ""}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
