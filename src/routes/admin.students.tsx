import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useDB, useRefreshData } from "@/lib/store";
import { deleteStudentById } from "@/lib/admin.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Trash2, Phone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/students")({
  component: () => <AuthGate role="admin"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const data = useDB((d) => d);
  const refresh = useRefreshData();
  const deleteStudent = useServerFn(deleteStudentById);
  const [q, setQ] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const list = data.students.filter((s) =>
    [s.fullName, s.usn, s.department, s.year].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">Manage all registered students.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="glass pl-9" placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s, i) => {
          const initials = s.fullName.split(" ").map((x: any) => x[0]).slice(0, 2).join("");
          const att = data.attendance.filter((a) => a.studentId === s.id);
          const pct = data.sessions.length ? Math.round((att.filter((a) => a.present).length / data.sessions.length) * 100) : 0;
          return (
            <Card key={s.id} className="glass border-border/50 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                    {s.avatar && <AvatarImage src={s.avatar} />}
                    <AvatarFallback className="gradient-primary text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{s.fullName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{s.usn}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="glass rounded-lg p-2"><p className="text-muted-foreground">Department</p><p className="font-medium">{s.department}</p></div>
                  <div className="glass rounded-lg p-2"><p className="text-muted-foreground">Year</p><p className="font-medium">{s.year}</p></div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3 h-3" /> {s.phone}</span>
                  <span className="font-semibold gradient-text">{pct}%</span>
                </div>
                <Button
                  size="sm" variant="ghost"
                  disabled={deletingId === s.id}
                  className="w-full mt-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={async () => {
                    if (!confirm(`Remove ${s.fullName}? This will permanently delete their account and all related data.`)) return;
                    setDeletingId(s.id);
                    try {
                      await deleteStudent({ data: { studentId: s.id } });
                      await refresh();
                      toast.success("Student removed");
                    } catch (err: any) {
                      toast.error(err?.message || "Failed to delete");
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> {deletingId === s.id ? "Removing…" : "Remove"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {!list.length && <p className="text-muted-foreground">No students found.</p>}
      </div>
    </div>
  );
}
