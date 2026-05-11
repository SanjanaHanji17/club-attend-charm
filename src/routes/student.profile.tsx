import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { DashShell } from "@/components/DashShell";
import { AuthGate } from "@/components/AuthGate";
import { useAuth, db } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/student/profile")({
  component: () => <AuthGate role="student"><DashShell><Page /></DashShell></AuthGate>,
});

function Page() {
  const { user } = useAuth();
  const [f, setF] = useState(() => ({
    id: "",
    fullName: "",
    usn: "",
    department: "",
    year: "",
    phone: "",
    password: "",
    avatar: "",
  }));
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setF({
        ...user,
        avatar: user.avatar ?? "",
      });
    }
  }, [user]);

  if (!user) {
    return <div className="text-muted-foreground">No data available</div>;
  }

  const me = user;

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setF((x) => ({ ...x, avatar: r.result as string }));
    r.readAsDataURL(file);
  };

  const save = () => {
    db.set((d) => ({ ...d, students: d.students.map((s) => s.id === me.id ? { ...f } : s) }));
    toast.success("Profile updated");
  };

  const initials = me.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("");

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
            <p className="font-semibold">{f.fullName}</p>
            <p className="text-sm text-muted-foreground">{f.usn} · {f.department}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50 animate-fade-in-up">
        <CardHeader><CardTitle className="text-base">Personal details</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {[
            ["Full Name", "fullName"],
            ["USN", "usn"],
            ["Department", "department"],
            ["Class / Year", "year"],
            ["Phone", "phone"],
            ["Password", "password"],
          ].map(([label, key]) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
                className="glass"
                type={key === "password" ? "password" : "text"}
                value={(f as any)[key]}
                onChange={(e) => setF({ ...f, [key]: e.target.value } as any)}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <Button className="gradient-primary text-primary-foreground border-0 shadow-glow hover-lift" onClick={save}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
