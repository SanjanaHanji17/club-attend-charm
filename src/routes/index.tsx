import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, ArrowRight, Sparkles, TerminalSquare, Users, CalendarDays, Mic, BellRing } from "lucide-react";
import { useAuth, useDB } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isAuthenticated, role } = useAuth();
  const data = useDB();
  const dashPath = isAuthenticated ? (role === "admin" ? "/admin/dashboard" : "/student/dashboard") : "/login";

  const totalMembers = data.students.length;
  const totalSessions = data.sessions.length;

  // Average attendance: % of (student, session) pairs marked present
  const presentCount = (data.attendance || []).filter((a: any) => a.present).length;
  const denom = totalMembers * totalSessions;
  const avgAttendance = denom > 0 ? Math.round((presentCount / denom) * 100) : 0;

  // Active/live sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeSessions = data.sessions
    .filter((s: any) => new Date(s.date) >= today)
    .sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date));

  // Announcements
  const announcements = data.announcements || [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] gradient-aurora opacity-20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/20 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      
      <header className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl gradient-aurora grid place-items-center shadow-glow group-hover:scale-105 transition-transform duration-300">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">CodeClub</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#sessions" className="hover:text-foreground transition-colors">Sessions</a>
          <a href="#announcements" className="hover:text-foreground transition-colors">Announcements</a>
        </nav>
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <Button asChild variant="outline" className="glass border-primary/30 hover-lift px-5 rounded-full">
              <Link to="/register">Register</Link>
            </Button>
          )}
          <Button asChild className="gradient-primary text-primary-foreground border-0 shadow-glow hover-lift px-6 rounded-full">
            <Link to={dashPath}>{isAuthenticated ? "Dashboard" : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-24 pb-32 relative z-10 text-center">
        <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up border-primary/20 text-primary">
          <Sparkles className="w-3.5 h-3.5 mr-2 inline" /> Empowering student developers
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          The modern platform for our <span className="text-transparent bg-clip-text gradient-primary">Coding Club</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8 mb-12 animate-fade-in-up leading-relaxed" style={{ animationDelay: "200ms" }}>
          Manage attendance with QR codes, track assignments, join discussions, and stay updated with live sessions seamlessly.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-32 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <Card className="glass border-border/50 hover-lift bg-background/40 backdrop-blur-xl">
            <CardContent className="p-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-1">{totalMembers}</h3>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50 hover-lift bg-background/40 backdrop-blur-xl">
            <CardContent className="p-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-1">{totalSessions}</h3>
              <p className="text-sm text-muted-foreground">Sessions Hosted</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50 hover-lift bg-background/40 backdrop-blur-xl">
            <CardContent className="p-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <TerminalSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-1">{data.assignments.length}</h3>
              <p className="text-sm text-muted-foreground">Assignments</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50 hover-lift bg-background/40 backdrop-blur-xl">
            <CardContent className="p-6 text-left">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-1">0%</h3>
              <p className="text-sm text-muted-foreground">Average Attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Sessions */}
        <section id="sessions" className="max-w-5xl mx-auto text-left mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center text-primary"><CalendarDays className="w-5 h-5" /></div>
            <h2 className="text-3xl font-bold tracking-tight">Active & Upcoming Sessions</h2>
          </div>
          {activeSessions.length === 0 ? (
            <p className="text-muted-foreground glass p-6 rounded-xl border border-border/50 text-center">No active or upcoming sessions currently available.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activeSessions.map((s: any) => (
                <Card key={s.id} className="glass border-border/50 hover-lift">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg">{s.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {new Date(s.date).toLocaleDateString()} {s.time}</span>
                      <span className="flex items-center gap-1.5"><Mic className="w-4 h-4" /> {s.resourcePerson}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Announcements */}
        <section id="announcements" className="max-w-5xl mx-auto text-left mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center text-primary"><BellRing className="w-5 h-5" /></div>
            <h2 className="text-3xl font-bold tracking-tight">Important Announcements</h2>
          </div>
          {announcements.length === 0 ? (
            <p className="text-muted-foreground glass p-6 rounded-xl border border-border/50 text-center">No recent announcements.</p>
          ) : (
            <div className="grid gap-4">
              {announcements.map((a: any) => (
                <Card key={a.id} className="glass border-border/50 hover-lift">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg">{a.title}</h3>
                    <p className="text-muted-foreground mt-2">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-4">{new Date(a.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
