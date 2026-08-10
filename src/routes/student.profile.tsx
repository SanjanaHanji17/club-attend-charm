import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, useRefreshData } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { DepartmentField } from "@/components/DepartmentField";
import { normalizeDepartment } from "@/lib/departments";
import { toast } from "sonner";


export const Route = createFileRoute("/student/profile")({
  component: () => <AuthGate role="student"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const { user } = useAuth();
  const refresh = useRefreshData();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    fullName: "",
    usn: "",
    department: "",
    year: "",
    phone: "",
    avatar: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setF({
        fullName: user.fullName || "",
        usn: user.usn || "",
        department: user.department || "",
        year: user.year || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  if (!user) {
    return <div className="text-muted-foreground">Loading profile…</div>;
  }

  const me = user;

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setF((x) => ({ ...x, avatar: r.result as string }));
    r.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: f.fullName,
        usn: f.usn,
        department: normalizeDepartment(f.department),
        year: f.year,
        phone: f.phone,
      })
      .eq("id", me.id);
    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }
    if (newPassword.trim().length >= 6) {
      const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword });
      if (pwErr) {
        setSaving(false);
        toast.error(pwErr.message);
        return;
      }
      setNewPassword("");
    }
    await refresh();
    setSaving(false);
    toast.success("Profile updated");
  };

  const initials = (f.fullName || "U").split(" ").map((s: string) => s[0]).slice(0, 2).join("");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal details and avatar.</p>
      </div>
      <Card className="glass border-border/50 animate-fade-in-up">
        <CardHeader><CardTitle className="text-base">Avatar</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-primary/40 shadow-glow">
              {f.avatar && <AvatarImage src={f.avatar} />}
              <AvatarFallback className="gradient-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full gradient-primary grid place-items-center shadow-glow hover-lift"
            >
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
          </div>
          <div>
            <p className="font-semibold">{f.fullName || "—"}</p>
            <p className="text-sm text-muted-foreground">{f.usn || "—"} · {f.department || "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50 animate-fade-in-up">
        <CardHeader><CardTitle className="text-base">Personal details</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Full Name</Label><Input className="glass" value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>USN</Label><Input className="glass" value={f.usn} onChange={(e) => setF({ ...f, usn: e.target.value })} /></div>
          <DepartmentField value={f.department} onChange={(v) => setF({ ...f, department: v })} />
          <div className="space-y-1.5"><Label>Class / Year</Label><Input className="glass" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input className="glass" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>New Password (optional)</Label><Input type="password" className="glass" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" /></div>
          <div className="md:col-span-2">
            <Button disabled={saving} className="gradient-primary text-primary-foreground border-0 shadow-glow hover-lift" onClick={save}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
