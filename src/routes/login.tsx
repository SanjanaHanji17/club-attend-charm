import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Code2, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { loginWithUsn } from "@/lib/supabase-auth";
import { resetPasswordByUsn } from "@/lib/password.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10">
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

function PasswordField({ value, onChange, id, autoComplete = "current-password" }: { value: string; onChange: (v: string) => void; id: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} name={id} type={show ? "text" : "password"} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} className="glass pr-10" required />
      <button type="button" tabIndex={-1} onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function ForgotPassword({ role }: { role: "student" | "admin" }) {
  const [open, setOpen] = useState(false);
  const [usn, setUsn] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const reset = useServerFn(resetPasswordByUsn);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw !== confirm) return toast.error("Passwords do not match");
    if (!usn.trim()) return toast.error("USN is required");
    setLoading(true);
    try {
      await reset({ data: { usn: usn.trim(), role, newPassword: pw } });
      toast.success("Password updated. You can now sign in.");
      setOpen(false);
      setUsn(""); setPw(""); setConfirm("");
    } catch (err: any) {
      toast.error(err?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-xs text-primary story-link">Forgot password?</button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-border/60">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>Enter your USN and a new password (minimum 6 characters).</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>USN</Label>
            <Input className="glass" value={usn} onChange={(e) => setUsn(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input type="password" className="glass" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm Password</Label>
            <Input type="password" className="glass" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground border-0">
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StudentLogin() {
  const navigate = useNavigate();
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await loginWithUsn(usn, password, "student");
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/student/dashboard" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="usn">USN</Label>
        <Input id="usn" name="usn" autoComplete="username" value={usn} onChange={(e) => setUsn(e.target.value)} placeholder="Your USN" className="glass" required />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="spw">Password</Label>
          <ForgotPassword role="student" />
        </div>
        <PasswordField id="spw" value={password} onChange={setPassword} />
      </div>
      <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
        <KeyRound className="w-4 h-4 mr-2" /> Sign in
      </Button>
    </form>
  );
}

function AdminLogin() {
  const navigate = useNavigate();
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await loginWithUsn(usn, password, "admin");
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Welcome, Admin!");
    navigate({ to: "/admin/dashboard" });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ausn">Admin USN</Label>
        <Input id="ausn" value={usn} onChange={(e) => setUsn(e.target.value)} placeholder="Your USN" className="glass" required />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="apw">Password</Label>
          <ForgotPassword role="admin" />
        </div>
        <PasswordField id="apw" value={password} onChange={setPassword} />
      </div>
      <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
        <ShieldCheck className="w-4 h-4 mr-2" /> Sign in as Admin
      </Button>
    </form>
  );
}
