import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { auth, db, Role } from "@/lib/store";
import { Code2, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Background video */}
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="https://images.pexels.com/videos/34911968/pictures/preview-0.jpg"
      >
        <source src="https://videos.pexels.com/video-files/34911968/14935293_1920_1080_30fps.mp4" type="video/mp4" />
      </video>
      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/70 to-background/85" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.5 }} />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl gradient-aurora grid place-items-center shadow-glow">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">CodeClub</span>
        </Link>

        <div className="glass-strong rounded-3xl p-7 shadow-elegant">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to continue to your dashboard.</p>

          <Tabs defaultValue="student" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full glass">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="admin">Admin / Volunteer</TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="mt-5"><StudentLogin /></TabsContent>
            <TabsContent value="admin" className="mt-5"><AdminLogin /></TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center mt-6">
            New here?{" "}
            <Link to="/register" className="text-primary story-link">Create an account</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

function PasswordField({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className="glass pr-10" required />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function StudentLogin() {
  const navigate = useNavigate();
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = db.get();
    const user = data.students.find((s) => s.usn.toLowerCase() === usn.toLowerCase());
    if (!user) return toast.error("USN not found");
    if (user.password !== password) return toast.error("Incorrect password");
    auth.set({ role: "student", userId: user.id });
    toast.success(`Welcome, ${(user.fullName || "Student").split(" ")[0]}`);
    navigate({ to: "/student/dashboard" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="usn">USN</Label>
        <Input id="usn" value={usn} onChange={(e) => setUsn(e.target.value)} placeholder="Your USN" className="glass" required />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="spw">Password</Label>
          <button type="button" onClick={() => setForgot(true)} className="text-xs text-primary story-link">Forgot?</button>
        </div>
        <PasswordField id="spw" value={password} onChange={setPassword} />
      </div>
      <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
        <KeyRound className="w-4 h-4 mr-2" /> Sign in
      </Button>
      <ForgotPasswordDialog open={forgot} onOpenChange={setForgot} role="student" />
    </form>
  );
}

function AdminLogin() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = db.get();
    const admin = data.admins.find((a) => a.adminCode === code);
    if (!admin) return toast.error("Admin code not found");
    if (admin.password !== password) return toast.error("Incorrect password");
    auth.set({ role: "admin", userId: admin.id });
    toast.success(`Welcome, ${(admin.fullName || "Admin").split(" ")[0]}`);
    navigate({ to: "/admin/dashboard" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ac">Admin Registration Code</Label>
        <Input id="ac" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Your admin code" className="glass" required />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="apw">Password</Label>
          <button type="button" onClick={() => setForgot(true)} className="text-xs text-primary story-link">Forgot?</button>
        </div>
        <PasswordField id="apw" value={password} onChange={setPassword} />
      </div>
      <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
        <ShieldCheck className="w-4 h-4 mr-2" /> Sign in as Admin
      </Button>
      <ForgotPasswordDialog open={forgot} onOpenChange={setForgot} role="admin" />
    </form>
  );
}

export function ForgotPasswordDialog({
  open, onOpenChange, role,
}: { open: boolean; onOpenChange: (v: boolean) => void; role: Role }) {
  const [identifier, setIdentifier] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  const reset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return toast.error(role === "student" ? "Enter your USN" : "Enter admin code");
    if (pw1.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw1 !== pw2) return toast.error("Passwords do not match");
    let ok = false;
    db.set((d) => {
      if (role === "student") {
        const i = d.students.findIndex((s) => s.usn.toLowerCase() === identifier.toLowerCase());
        if (i >= 0) { d.students[i] = { ...d.students[i], password: pw1 }; ok = true; }
      } else {
        const i = d.admins.findIndex((a) => a.adminCode === identifier);
        if (i >= 0) { d.admins[i] = { ...d.admins[i], password: pw1 }; ok = true; }
      }
      return { ...d };
    });
    if (!ok) return toast.error("Account not found");
    toast.success("Password updated. Please sign in.");
    onOpenChange(false);
    setIdentifier(""); setPw1(""); setPw2("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/60">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            {role === "student" ? "Enter your USN and a new password." : "Enter your admin code and a new password."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={reset} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{role === "student" ? "USN" : "Admin Code"}</Label>
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="glass" required />
          </div>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} className="glass" required />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm password</Label>
            <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="glass" required />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0">Update password</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
