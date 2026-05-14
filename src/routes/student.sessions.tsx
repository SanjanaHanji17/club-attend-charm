import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useDB, useRefreshData } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User2, Mic, Search, CheckCircle2, XCircle, Clock, Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/sessions")({
  component: () => <AuthGate role="student"><DashShell><Page /></DashShell></AuthGate>,
});

function sessionEnded(s: { date: string; time?: string }) {
  const dt = new Date(`${s.date}T${s.time || "23:59"}`);
  return !isNaN(dt.getTime()) && dt.getTime() < Date.now();
}

function FeedbackBlock({ sessionId, studentId }: { sessionId: string; studentId: string }) {
  const data = useDB((d) => d) as any;
  const refresh = useRefreshData();
  const mine = (data.feedback || []).find((f: any) => f.sessionId === sessionId && f.studentId === studentId);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);

  if (mine) {
    return (
      <div className="mt-4 glass rounded-xl p-3 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold">Your feedback</span>
          <span className="text-muted-foreground">· {mine.rating ? `${mine.rating}★` : ""}</span>
          <span className="ml-auto text-muted-foreground">{new Date(mine.createdAt).toLocaleString()}</span>
        </div>
        <p className="text-muted-foreground whitespace-pre-wrap">{mine.comment}</p>
      </div>
    );
  }

  const submit = async () => {
    if (!comment.trim()) return toast.error("Write a short feedback");
    setBusy(true);
    const { error } = await (supabase.from as any)("feedback").insert({
      session_id: sessionId,
      student_id: studentId,
      rating,
      comment: comment.trim(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setComment("");
    await refresh();
    toast.success("Feedback submitted");
  };

  return (
    <div className="mt-4 glass rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <MessageSquare className="w-3.5 h-3.5 text-primary" /> Leave feedback
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className="text-warning">
            <Star className={`w-4 h-4 ${n <= rating ? "fill-warning" : ""}`} />
          </button>
        ))}
      </div>
      <Textarea className="glass min-h-20" placeholder="How was the session?" value={comment} onChange={(e) => setComment(e.target.value)} />
      <Button size="sm" disabled={busy} onClick={submit} className="gradient-primary text-primary-foreground border-0">
        {busy ? "Submitting…" : "Submit feedback"}
      </Button>
    </div>
  );
}

function Page() {
  const { user } = useAuth();
  const data = useDB((d) => d);
  const [q, setQ] = useState("");

  if (!user) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  const me = user;
  const sessions = data.sessions
    .filter((s) => s.title.toLowerCase().includes(q.toLowerCase()) || s.resourcePerson.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Sessions</h1>
        <p className="text-muted-foreground">View current and past sessions. Submit feedback after a session ends.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="glass pl-9" placeholder="Search by title or resource person…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {sessions.map((s, i) => {
          const att = data.attendance.find((a) => a.sessionId === s.id && a.studentId === me.id);
          const present = att?.present;
          const ended = sessionEnded(s);
          return (
            <Card key={s.id} className="glass border-border/50 hover-lift animate-fade-in-up overflow-hidden" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    {ended ? (
                      <Badge className="bg-muted/40 text-muted-foreground border-muted-foreground/20"><Clock className="w-3 h-3 mr-1" /> Session Ended</Badge>
                    ) : (
                      <Badge variant="outline" className="glass">Upcoming</Badge>
                    )}
                    {att && (present ? (
                      <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Present</Badge>
                    ) : (
                      <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1" /> Absent</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {new Date(s.date).toLocaleDateString()} {s.time || ""}</span>
                  <span className="flex items-center gap-1.5"><User2 className="w-3.5 h-3.5" /> Host: {s.host}</span>
                  <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> {s.resourcePerson}</span>
                </div>
                {ended && <FeedbackBlock sessionId={s.id} studentId={me.id} />}
              </CardContent>
            </Card>
          );
        })}
        {!sessions.length && <p className="text-muted-foreground">No sessions found.</p>}
      </div>
    </div>
  );
}
