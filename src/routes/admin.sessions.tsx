import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useDB, db, uid, Session } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, CalendarDays, User2, Mic } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sessions")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

const empty = { id: "", title: "", date: "", host: "", resourcePerson: "", description: "" };

function Page() {
  const data = useDB((d) => d);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Session>(empty);

  const save = () => {
    if (!form.title || !form.date || !form.host || !form.resourcePerson) return toast.error("Fill required fields");
    db.set((d) => {
      if (form.id) {
        return { ...d, sessions: d.sessions.map((s) => s.id === form.id ? form : s) };
      }
      return { ...d, sessions: [{ ...form, id: uid() }, ...d.sessions] };
    });
    toast.success(form.id ? "Session updated" : "Session created");
    setOpen(false);
    setForm(empty);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">Create, edit and manage sessions.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(empty)} className="gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
              <Plus className="w-4 h-4 mr-1.5" /> New session
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-border/60 max-w-lg">
            <DialogHeader><DialogTitle>{form.id ? "Edit session" : "Create session"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5"><Label>Title</Label><Input className="glass" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Date</Label><Input type="date" className="glass" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Host Name</Label><Input className="glass" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Resource Person</Label><Input className="glass" value={form.resourcePerson} onChange={(e) => setForm({ ...form, resourcePerson: e.target.value })} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Description</Label><Textarea className="glass" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="col-span-2"><Button onClick={save} className="w-full gradient-primary text-primary-foreground border-0">Save</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {data.sessions.map((s, i) => (
          <Card key={s.id} className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setForm(s); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (!confirm(`Delete "${s.title}"?`)) return;
                      db.set((d) => ({
                        ...d,
                        sessions: d.sessions.filter((x) => x.id !== s.id),
                        attendance: d.attendance.filter((a) => a.sessionId !== s.id),
                      }));
                      toast.success("Deleted");
                    }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {new Date(s.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><User2 className="w-3.5 h-3.5" /> {s.host}</span>
                <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> {s.resourcePerson}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
