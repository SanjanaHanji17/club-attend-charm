import { useState } from "react";
import { useAuth, useDB, db, uid } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

export function DiscussionBoard() {
  const { user, role } = useAuth();
  const data = useDB((d) => d);
  const [text, setText] = useState("");
  if (!user || !role) return null;

  const post = () => {
    if (!text.trim()) return;
    const c = {
      id: uid(),
      authorId: user.id,
      authorName: user.fullName,
      authorRole: role,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    db.set((d) => ({ ...d, comments: [c, ...d.comments] }));
    setText("");
    toast.success("Posted!");
  };

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
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{text.length}/1000</span>
            <Button onClick={post} className="gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
              <Send className="w-4 h-4 mr-1.5" /> Post
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {data.comments.map((c, i) => {
          const initials = c.authorName.split(" ").map((s) => s[0]).slice(0, 2).join("");
          return (
            <Card key={c.id} className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-5 flex gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-primary/30 shrink-0">
                  <AvatarFallback className="gradient-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.authorName}</span>
                    {c.authorRole === "admin" && <Badge className="bg-accent/20 text-accent border-accent/30">Volunteer</Badge>}
                    <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm mt-1.5 whitespace-pre-wrap break-words">{c.text}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {!data.comments.length && <p className="text-muted-foreground text-center py-10">No posts yet — be the first!</p>}
      </div>
    </div>
  );
}
