import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { auth, db, uid } from "@/lib/store";
import { Code2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full gradient-aurora opacity-30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="relative z-10 w-full max-w-lg animate-scale-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl gradient-aurora grid place-items-center shadow-glow">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">CodeClub</span>
        </Link>
        <div className="glass-strong rounded-3xl p-7 shadow-elegant">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Pick your role to get started.</p>
          <Tabs defaultValue="student" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full glass">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="admin">Admin / Volunteer</TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="mt-5"><StudentSignup /></TabsContent>
            <TabsContent value="admin" className="mt-5"><AdminSignup /></TabsContent>
          </Tabs>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary story-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...p }: any) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input className="glass" {...p} />
    </div>
  );
}

function StudentSignup() {
  const navigate = useNavigate();
  const [f, setF] = useState({ fullName: "", usn: "", department: "", year: "", phone: "", password: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(f).some((v) => !v)) return toast.error("Please fill all fields");
    if (f.password.length < 6) return toast.error("Password must be at least 6 characters");
    let id = "";
    db.set((d) => {
      if (d.students.some((s) => s.usn.toLowerCase() === f.usn.toLowerCase())) {
        toast.error("USN already registered");
        return d;
      }
      id = uid();
      return { ...d, students: [...d.students, { id, ...f }] };
    });
    if (!id) return;
    auth.set({ role: "student", userId: id });
    toast.success("Account created!");
    navigate({ to: "/student/dashboard" });
  };
  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><Field label="Full Name" value={f.fullName} onChange={(e: any) => setF({ ...f, fullName: e.target.value })} /></div>
      <Field label="USN" value={f.usn} onChange={(e: any) => setF({ ...f, usn: e.target.value })} />
      <Field label="Department" value={f.department} onChange={(e: any) => setF({ ...f, department: e.target.value })} placeholder="CSE / ISE..." />
      <Field label="Class / Year" value={f.year} onChange={(e: any) => setF({ ...f, year: e.target.value })} placeholder="3rd" />
      <Field label="Phone Number" value={f.phone} onChange={(e: any) => setF({ ...f, phone: e.target.value })} />
      <div className="col-span-2"><Field label="Password" type="password" value={f.password} onChange={(e: any) => setF({ ...f, password: e.target.value })} /></div>
      <div className="col-span-2 mt-1">
        <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">Create account</Button>
      </div>
    </form>
  );
}

function AdminSignup() {
  const navigate = useNavigate();
  const [f, setF] = useState({ fullName: "", adminCode: "", usn: "", year: "", department: "", phone: "", password: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(f).some((v) => !v)) return toast.error("Please fill all fields");
    if (f.adminCode !== "admin123") return toast.error("Invalid admin registration code");
    if (f.password.length < 6) return toast.error("Password must be at least 6 characters");
    const id = uid();
    db.set((d) => ({ ...d, admins: [...d.admins, { id, ...f }] }));
    auth.set({ role: "admin", userId: id });
    toast.success("Admin account created!");
    navigate({ to: "/admin/dashboard" });
  };
  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><Field label="Full Name" value={f.fullName} onChange={(e: any) => setF({ ...f, fullName: e.target.value })} /></div>
      <div className="col-span-2"><Field label="Admin Registration Code" value={f.adminCode} onChange={(e: any) => setF({ ...f, adminCode: e.target.value })} placeholder="admin123" /></div>
      <Field label="USN" value={f.usn} onChange={(e: any) => setF({ ...f, usn: e.target.value })} />
      <Field label="Year" value={f.year} onChange={(e: any) => setF({ ...f, year: e.target.value })} />
      <Field label="Department" value={f.department} onChange={(e: any) => setF({ ...f, department: e.target.value })} />
      <Field label="Phone" value={f.phone} onChange={(e: any) => setF({ ...f, phone: e.target.value })} />
      <div className="col-span-2"><Field label="Password" type="password" value={f.password} onChange={(e: any) => setF({ ...f, password: e.target.value })} /></div>
      <div className="col-span-2 mt-1">
        <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">Register as Admin</Button>
      </div>
    </form>
  );
}
