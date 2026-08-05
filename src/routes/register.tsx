import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Code2 } from "lucide-react";
import { registerWithUsn } from "@/lib/supabase-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
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

async function usnTaken(usn: string, role: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("usn", usn.trim())
    .eq("role", role as any)
    .maybeSingle();
  return !!data;
}

function validate(f: { fullName: string; usn: string; department: string; phone: string; password: string }) {
  if (Object.values(f).some((v) => !v.trim())) return "Please fill all fields";
  if (!/^\d{10}$/.test(f.phone.trim())) return "Phone number must be exactly 10 digits";
  if (f.password.length < 6) return "Password must be at least 6 characters";
  return null;
}

function StudentSignup() {
  const navigate = useNavigate();
  const [f, setF] = useState({ fullName: "", usn: "", department: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = validate(f);
    if (invalid) return toast.error(invalid);
    setLoading(true);

    if (await usnTaken(f.usn, "student")) {
      toast.error("This USN is already registered. Please sign in instead.");
      setLoading(false);
      return;
    }

    const { data, error } = await registerWithUsn(f.usn.trim(), f.password, "student", {
      fullName: f.fullName,
      usn: f.usn.trim(),
      department: f.department,
      phone: f.phone
    });

    if (error) {
      toast.error(error.message.includes("already registered") ? "This USN is already registered." : error.message);
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      // Ensure a session exists so the profile insert passes row-level security.
      await supabase.auth.signInWithPassword({ email: `${f.usn.trim().toLowerCase()}@student.codeclub.app`, password: f.password });
    }

    if (data.user) {
      const qr_code = Math.random().toString(36).slice(2, 10).toUpperCase() + f.usn.slice(-4);
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        role: "student",
        full_name: f.fullName.trim(),
        usn: f.usn.trim(),
        department: f.department.trim(),
        phone: f.phone.trim(),
        qr_code: qr_code
      });

      if (profileError) {
        toast.error(profileError.message.includes("duplicate") ? "This USN is already registered." : profileError.message);
        setLoading(false);
        return;
      }

      toast.success("Registration successful! Welcome to CodeClub 🎉");
      navigate({ to: "/student/dashboard" });
    }
    setLoading(false);
  };


  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><Field label="Full Name" value={f.fullName} onChange={(e: any) => setF({ ...f, fullName: e.target.value })} /></div>
      <Field label="USN" value={f.usn} onChange={(e: any) => setF({ ...f, usn: e.target.value })} />
      <Field label="Department" value={f.department} onChange={(e: any) => setF({ ...f, department: e.target.value })} placeholder="CSE / ISE..." />
      <Field label="Phone Number" value={f.phone} onChange={(e: any) => setF({ ...f, phone: e.target.value })} />
      <div className="col-span-2"><Field label="Password" type="password" value={f.password} onChange={(e: any) => setF({ ...f, password: e.target.value })} /></div>
      <div className="col-span-2 mt-1">
        <Button disabled={loading} type="submit" className="w-full gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">Create account</Button>
      </div>
    </form>
  );
}

function AdminSignup() {
  const navigate = useNavigate();
  const [f, setF] = useState({ fullName: "", usn: "", department: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = validate(f);
    if (invalid) return toast.error(invalid);
    setLoading(true);

    if (await usnTaken(f.usn, "admin")) {
      toast.error("This USN is already registered as an admin. Please sign in instead.");
      setLoading(false);
      return;
    }

    const { data, error } = await registerWithUsn(f.usn.trim(), f.password, "admin", {
      fullName: f.fullName,
      usn: f.usn.trim(),
      department: f.department,
      phone: f.phone
    });

    if (error) {
      toast.error(error.message.includes("already registered") ? "This USN is already registered." : error.message);
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      await supabase.auth.signInWithPassword({ email: `${f.usn.trim().toLowerCase()}@admin.codeclub.app`, password: f.password });
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        role: "admin",
        full_name: f.fullName.trim(),
        usn: f.usn.trim(),
        department: f.department.trim(),
        phone: f.phone.trim()
      });

      if (profileError) {
        toast.error(profileError.message.includes("duplicate") ? "This USN is already registered." : profileError.message);
        setLoading(false);
        return;
      }

      toast.success("Registration successful! Welcome, Admin 🎉");
      navigate({ to: "/admin/dashboard" });
    }
    setLoading(false);
  };


  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><Field label="Full Name" value={f.fullName} onChange={(e: any) => setF({ ...f, fullName: e.target.value })} /></div>
      <Field label="USN" value={f.usn} onChange={(e: any) => setF({ ...f, usn: e.target.value })} />
      <Field label="Department" value={f.department} onChange={(e: any) => setF({ ...f, department: e.target.value })} />
      <Field label="Phone" value={f.phone} onChange={(e: any) => setF({ ...f, phone: e.target.value })} />
      <div className="col-span-2"><Field label="Password" type="password" value={f.password} onChange={(e: any) => setF({ ...f, password: e.target.value })} /></div>
      <div className="col-span-2 mt-1">
        <Button disabled={loading} type="submit" className="w-full gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">Register as Admin</Button>
      </div>
    </form>
  );
}
