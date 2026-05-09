import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Code2, Sparkles, BarChart3, Users, CalendarCheck, MessageSquare, ArrowRight, Github } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full gradient-aurora opacity-30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-1/2 -right-40 w-[28rem] h-[28rem] rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      {/* Nav */}
      <header className="relative z-10 px-6 md:px-12 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-aurora grid place-items-center shadow-glow">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">CodeClub</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="story-link">Features</a>
          <a href="#dashboard" className="story-link">Dashboard</a>
          <a href="#community" className="story-link">Community</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
          <Button asChild size="sm" className="gradient-primary text-primary-foreground border-0 shadow-glow">
            <Link to="/register">Get started <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-12 pt-12 md:pt-24 pb-16 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">The premium attendance OS for coding clubs</span>
        </div>
        <h1 className="mt-6 text-4xl md:text-7xl font-bold tracking-tight leading-[1.05] animate-fade-in-up">
          Run your <span className="gradient-text">coding club</span><br />like a product team.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          Track attendance, manage sessions, ship assignments and grow a community —
          all from one beautifully crafted dashboard built for students and volunteers.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Button asChild size="lg" className="gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
            <Link to="/register">Create an account</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="glass border-border/60">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>

        {/* Stat strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { k: "120+", l: "Active members" },
            { k: "48", l: "Sessions hosted" },
            { k: "92%", l: "Avg. attendance" },
            { k: "4.9", l: "Member rating" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 hover-lift animate-fade-in-up" style={{ animationDelay: `${400 + i * 80}ms` }}>
              <p className="text-3xl font-bold gradient-text">{s.k}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center">Everything your club needs</h2>
        <p className="text-muted-foreground text-center mt-3 max-w-xl mx-auto">From check-ins to community — beautifully integrated.</p>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { icon: CalendarCheck, t: "Sessions & Attendance", d: "Schedule sessions, mark attendance and watch streaks build automatically." },
            { icon: BarChart3, t: "Live Analytics", d: "Animated dashboards with attendance %, trends and engagement metrics." },
            { icon: Users, t: "Member Management", d: "Roles for students and volunteers with granular permissions." },
            { icon: MessageSquare, t: "Discussion Hub", d: "An always-on community thread with replies, reactions and Q&A." },
            { icon: Sparkles, t: "Assignments", d: "Drop assignments, track submissions, send gentle reminders." },
            { icon: Github, t: "Project-ready", d: "Modern, responsive, themable UI built with React and Tailwind." },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass rounded-2xl p-6 hover-lift animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-11 h-11 rounded-xl gradient-primary grid place-items-center shadow-glow mb-4">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold">{f.t}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{f.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section id="community" className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-4xl mx-auto glass-strong rounded-3xl p-10 md:p-14 text-center shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to level up your club?</h2>
          <p className="mt-3 text-muted-foreground">Sign in as a student or register as a volunteer with code <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-mono text-sm">admin123</span>.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gradient-primary text-primary-foreground border-0 shadow-glow hover-lift">
              <Link to="/register">Create account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 md:px-12 pb-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CodeClub. Crafted with care.
      </footer>
    </div>
  );
}
