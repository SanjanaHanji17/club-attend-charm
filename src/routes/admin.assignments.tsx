import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useDB, db, uid, Assignment } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, CheckCircle2, Clock } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/assignments")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const data = useDB((d) => d);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "", dueDate: "" });

  const create = () => {
    if (!f.title || !f.dueDate) return toast.error("Title and due date are required");
    const a: Assignment = { id: uid(), createdAt: new Date().toISOString(), ...f };
    db.set((d) => ({ ...d, assignments: [a, ...d.assignments] }));
    toast.success("Assignment created");
    setOpen(false);
    setF({ title: "", description: "", dueDate: "" });
  };

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
              <Button className="w-full gradient-primary text-primary-foreground border-0" onClick={create}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {data.assignments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">No assignments available</p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {data.assignments.map((a, i) => {
          const submitted = data.submissions.filter((s) => s.assignmentId === a.id).length;
          const total = data.students.length;
          const pct = total ? Math.round((submitted / total) * 100) : 0;
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
                      <Button size="icon" variant="ghost" className="text-destructive"
                        onClick={() => {
                          if (!confirm(`Delete "${a.title}"?`)) return;
                          db.set((d) => ({
                            ...d,
                            assignments: d.assignments.filter((x) => x.id !== a.id),
                            submissions: d.submissions.filter((s) => s.assignmentId !== a.id),
                          }));
                          toast.success("Deleted");
                        }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-muted-foreground">Due {new Date(a.dueDate).toLocaleDateString()}</span>
                      <span className="font-semibold gradient-text">{submitted}/{total} submitted ({pct}%)</span>
                    </div>
                    <div className="mt-3 grid gap-1.5">
                      {data.students.map((st) => {
                        const s = data.submissions.find((x) => x.assignmentId === a.id && x.studentId === st.id);
                        return (
                          <div key={st.id} className="flex items-center justify-between text-xs glass rounded-lg px-2.5 py-1.5">
                            <span className="truncate">{st.fullName}</span>
                            {s ? (
                              <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Submitted</Badge>
                            ) : (
                              <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
