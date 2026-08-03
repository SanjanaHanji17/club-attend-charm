import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Megaphone, AlertTriangle } from "lucide-react";

export type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  important?: boolean;
  created_at: string;
  author_name?: string;
  author_role?: string;
};

export function AnnouncementsPanel({ announcements }: { announcements: AnnouncementItem[] }) {
  const [open, setOpen] = useState<AnnouncementItem | null>(null);

  const list = [...(announcements || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (list.length === 0) return null;

  return (
    <>
      <Card className="glass-strong border-2 border-primary/50 animate-fade-in-up shadow-glow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" /> Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.slice(0, 5).map((a) => (
            <button
              key={a.id}
              onClick={() => setOpen(a)}
              className={`w-full text-left glass rounded-xl p-4 border-l-4 hover-lift transition-colors ${
                a.important ? "border-destructive bg-destructive/5" : "border-primary"
              }`}
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <p className="font-semibold flex items-center gap-2">
                  {a.important && <AlertTriangle className="w-4 h-4 text-destructive" />}
                  {a.title}
                  {a.important && <Badge className="bg-destructive/20 text-destructive border-destructive/30">Important</Badge>}
                </p>
                <span className="text-[11px] text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm mt-2 line-clamp-2 whitespace-pre-wrap">{a.content}</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Posted by <span className="font-medium text-foreground">{a.author_name || "Admin"}</span> · click to read
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="glass-strong border-border/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {open?.important && <AlertTriangle className="w-4 h-4 text-destructive" />}
              {open?.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            {open ? new Date(open.created_at).toLocaleString() : ""} · {open?.author_name || "Admin"}
          </p>
          <p className="text-sm whitespace-pre-wrap">{open?.content}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
