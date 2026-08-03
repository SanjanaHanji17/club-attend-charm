import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, Users } from "lucide-react";

export type SessionItem = {
  id: string;
  title: string;
  date: string;
  time?: string;
  resourcePerson: string;
  description?: string;
  host?: string;
};

function startOf(s: SessionItem) {
  return new Date(`${s.date}T${s.time && /^\d{2}:\d{2}/.test(s.time) ? s.time : "23:59"}`).getTime();
}

export function UpcomingSessions({
  sessions,
  hostNameById = {},
}: {
  sessions: SessionItem[];
  hostNameById?: Record<string, string>;
}) {
  const now = Date.now();
  const upcoming = [...(sessions || [])]
    .filter((s) => startOf(s) >= now)
    .sort((a, b) => startOf(a) - startOf(b));

  return (
    <Card className="glass border-border/50 animate-fade-in-up">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" /> Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No upcoming sessions scheduled</p>
        ) : (
          upcoming.slice(0, 5).map((s) => (
            <div key={s.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="font-semibold">{s.title}</p>
                <Badge variant="outline" className="glass">
                  {new Date(s.date).toLocaleDateString()} {s.time ? `• ${s.time}` : ""}
                </Badge>
              </div>
              {s.description && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{s.description}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Resource person: <span className="text-foreground">{s.resourcePerson || "TBA"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Volunteer: <span className="text-foreground">{(s.host && hostNameById[s.host]) || "TBA"}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
