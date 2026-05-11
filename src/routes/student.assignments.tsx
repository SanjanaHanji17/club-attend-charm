import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useDB, db } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Clock, FileText, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/assignments")({
  component: () => <AuthGate role="student"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const { user } = useAuth();
  const data = useDB((d) => d);
  const today = new Date();

  if (!user) {
    return <p className="text-muted-foreground">No data available</p>;
  }

  const me = user;
  const items = data.assignments.map((a) => ({
    ...a,
    submitted: !!data.submissions.find((s) => s.assignmentId === a.id && s.studentId === me.id),
    overdue: new Date(a.dueDate) < today,
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
        <Card key={a.id} className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary grid place-items-center shrink-0"><FileText className="w-5 h-5 text-primary-foreground" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold truncate">{a.title}</h3>
                  {a.submitted ? (
                    <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Submitted</Badge>
                  ) : (
                    <Badge className="bg-warning/20 text-warning border-warning/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Due {new Date(a.dueDate).toLocaleDateString()}</span>
                  {!a.submitted && (
                    <Button size="sm" variant="outline" className="glass" onClick={() => {
                      db.set((d) => ({ ...d, submissions: [...d.submissions, { assignmentId: a.id, studentId: meId, submittedAt: new Date().toISOString(), note: "Submitted via dashboard" }] }));
                      toast.success("Marked as submitted");
                    }}>
                      <Send className="w-3.5 h-3.5 mr-1" /> Submit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
