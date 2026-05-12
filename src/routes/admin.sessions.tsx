import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useDB } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, CalendarDays, User2, Mic } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/admin/sessions")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

const empty = { id: "", title: "", date: "", time: "", host: "", resourcePerson: "", description: "" };

function Page() {
  const { user } = useAuth();
  const data = useDB();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const save = async () => {
    if (!form.title || !form.date || !form.time || !form.resourcePerson) return toast.error("Fill required fields");
    
    // Prevent previous dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(form.date);
    if (selectedDate < today) {
      return toast.error("Cannot create session for previous dates");
    }

    if (form.id) {
      const { error } = await supabase.from("sessions").update({
        title: form.title,
        date: form.date,
        time: form.time,
        resource_person: form.resourcePerson,
        description: form.description
      }).eq("id", form.id);
      if (error) return toast.error(error.message);
      toast.success("Session updated");
    } else {
      const { error } = await supabase.from("sessions").insert({
        title: form.title,
        date: form.date,
        time: form.time,
        resource_person: form.resourcePerson,
        description: form.description,
        host_id: user?.id
      });
      if (error) return toast.error(error.message);
      toast.success("Session created");
    }
    
    setOpen(false);
    setForm(empty);
    window.location.reload();
  };

  const deleteSession = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    window.location.reload();
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
              <div className="space-y-1.5"><Label>Time</Label><Input type="time" className="glass" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Resource Person</Label><Input className="glass" value={form.resourcePerson} onChange={(e) => setForm({ ...form, resourcePerson: e.target.value })} /></div>
              <div className="col-span-2 space-y-1.5"><Label>Description</Label><Textarea className="glass" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="col-span-2"><Button onClick={save} className="w-full gradient-primary text-primary-foreground border-0">Save</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {data.sessions.length === 0 && (
          <p className="text-sm text-muted-foreground md:col-span-2 text-center py-10">No sessions added yet</p>
        )}
        {data.sessions.map((s: any, i: number) => (
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
                    onClick={() => deleteSession(s.id, s.title)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {new Date(s.date).toLocaleDateString()} {s.time}</span>
                <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> {s.resourcePerson}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
