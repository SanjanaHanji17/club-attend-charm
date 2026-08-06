import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useDB } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, MessagesSquare, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function DiscussionBoard() {
  const { user, role } = useAuth();
  const data = useDB((d) => d);
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [important, setImportant] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  if (!user || !role) return null;

  const post = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("comments").insert({
      author_id: user.id,
      text: text.trim(),
      ...(role === "admin" ? { important } : {}),
    } as any);
    setBusy(false);
    if (error) return toast.error(error.message);
    setText("");
    if (important) toast.success("Important post published — everyone will see it on their dashboard");
    else toast.success("Posted!");
    setImportant(false);
    qc.invalidateQueries({ queryKey: ["app_data"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["app_data"] });
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return toast.error("Post cannot be empty");
    const { error } = await supabase.from("comments").update({ text: editText.trim() }).eq("id", id);
    if (error) return toast.error(error.message);
    setEditId(null);
    setEditText("");
    toast.success("Post updated");
    qc.invalidateQueries({ queryKey: ["app_data"] });
  };


  const sorted = [...(data.comments || [])].sort((a: any, b: any) => {
    if (!!a.important !== !!b.important) return a.important ? -1 : 1;
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><MessagesSquare className="w-7 h-7 text-primary" /> Discussion</h1>
        <p className="text-muted-foreground">Ask questions, share resources, help each other.</p>
      </div>
      <Card className="glass-strong border-border/50 animate-fade-in-up">
        <CardContent className="p-5">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share something with the club…"
            className="glass min-h-[90px]"
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground">{text.length}/1000</span>
            <div className="flex items-center gap-3">
              {role === "admin" && (
                <div className="flex items-center gap-2">
                  <Checkbox id="disc-important" checked={important} onCheckedChange={(v) => setImportant(!!v)} />
                  <Label htmlFor="disc-important" className="text-xs cursor-pointer">Mark as Important</Label>
                </div>
              )}
              <Button onClick={post} disabled={busy} className="gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
                <Send className="w-4 h-4 mr-1.5" /> {busy ? "Posting…" : "Post"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sorted.map((c: any, i: number) => {
          const initials = (c.authorName || "?").split(" ").map((s: string) => s[0]).slice(0, 2).join("");
          const isOwner = c.authorId === user.id;
          const canDelete = isOwner || role === "admin";
          const canEdit = isOwner;
          const editing = editId === c.id;
          return (
            <Card key={c.id} className={`glass hover-lift animate-fade-in-up ${c.important ? "border-2 border-destructive/50" : "border-border/50"}`} style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-5 flex gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-primary/30 shrink-0">
                  <AvatarFallback className="gradient-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.authorName}</span>
                    {c.authorRole === "admin" ? (
                      <Badge className="bg-accent/20 text-accent border-accent/30">Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="glass">Student</Badge>
                    )}
                    {c.important && (
                      <Badge className="bg-destructive/20 text-destructive border-destructive/30"><AlertTriangle className="w-3 h-3 mr-1" /> Important</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                    <div className="ml-auto flex items-center gap-1">
                      {canEdit && !editing && (
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditId(c.id); setEditText(c.text); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => remove(c.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {editing ? (
                    <div className="mt-2 space-y-2">
                      <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="glass min-h-[80px]" maxLength={1000} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(c.id)} className="gradient-primary text-primary-foreground border-0">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditId(null); setEditText(""); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mt-1.5 whitespace-pre-wrap break-words">{c.text}</p>
                  )}
                </div>

              </CardContent>
            </Card>
          );
        })}
        {!sorted.length && <p className="text-muted-foreground text-center py-10">No posts yet — be the first!</p>}
      </div>
    </div>
  );
}
