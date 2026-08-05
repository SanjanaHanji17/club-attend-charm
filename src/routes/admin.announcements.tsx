import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useDB, useRefreshData } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Trash2, AlertTriangle, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";


export const Route = createFileRoute("/admin/announcements")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const { user } = useAuth();
  const data = useDB();
  const refresh = useRefreshData();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [important, setImportant] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error("Title and content required");
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      content: content.trim(),
      important,
      author_id: user.id,
    } as any);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Announcement posted");
    setTitle("");
    setContent("");
    setImportant(false);
    await refresh();
  };

  const [editing, setEditing] = useState<any | null>(null);

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.content.trim()) return toast.error("Title and content required");
    const { error } = await supabase
      .from("announcements")
      .update({ title: editing.title.trim(), content: editing.content.trim(), important: editing.important } as any)
      .eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("Announcement updated");
    setEditing(null);
    await refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    await refresh();
  };

  const list = [...(data.announcements || [])].sort((a: any, b: any) => {
    if (!!a.important !== !!b.important) return a.important ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="w-8 h-8 text-primary" /> Announcements
        </h1>
        <p className="text-muted-foreground mt-1">Post club-wide updates visible to all students.</p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="text-base">New announcement</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <Input className="glass" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea className="glass min-h-28" placeholder="Write the announcement..." value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="flex items-center gap-3">
              <Switch id="important" checked={important} onCheckedChange={setImportant} />
              <Label htmlFor="important" className="flex items-center gap-1.5 cursor-pointer">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Mark as important
              </Label>
            </div>
            <Button disabled={loading} type="submit" className="gradient-primary text-primary-foreground border-0 shadow-glow">
              Post announcement
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader><CardTitle className="text-base">All announcements</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No announcements yet</p>
          ) : (
            list.map((a: any) => (
              <div key={a.id} className={`glass rounded-xl p-4 border-l-4 ${a.important ? "border-destructive" : "border-primary/40"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold flex items-center gap-2">
                      {a.title}
                      {a.important && <Badge className="bg-destructive/20 text-destructive border-destructive/30">Important</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{a.content}</p>
                  </div>
                  <div className="flex items-center shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setEditing({ id: a.id, title: a.title, content: a.content, important: !!a.important })}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(a.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o: boolean) => !o && setEditing(null)}>
        <DialogContent className="glass-strong border-border/60">
          <DialogHeader><DialogTitle>Edit announcement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input className="glass" value={editing?.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Textarea className="glass min-h-28" value={editing?.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
            <div className="flex items-center gap-3">
              <Switch id="edit-important" checked={!!editing?.important} onCheckedChange={(v) => setEditing({ ...editing, important: v })} />
              <Label htmlFor="edit-important" className="flex items-center gap-1.5 cursor-pointer">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Mark as important
              </Label>
            </div>
            <Button className="w-full gradient-primary text-primary-foreground border-0" onClick={saveEdit}>Save changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
}
