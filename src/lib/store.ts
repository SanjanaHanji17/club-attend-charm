import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export type Role = "student" | "admin";

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  usn: string;
  department?: string;
  year?: string;
  phone?: string;
  qr_code?: string;
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  resource_person: string;
  description: string;
  host_id: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  present: boolean;
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  note: string;
  submitted_at: string;
}

export interface Comment {
  id: string;
  author_id: string;
  text: string;
  parent_id?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

// For backwards compatibility while migrating components
interface LegacyDB {
  students: any[];
  admins: any[];
  sessions: { id: string; title: string; date: string; time?: string; host: string; resourcePerson: string; description: string; }[];
  attendance: { sessionId: string; studentId: string; present: boolean; }[];
  assignments: { id: string; title: string; description: string; dueDate: string; createdAt: string; }[];
  submissions: { assignmentId: string; studentId: string; submittedAt: string; note: string; }[];
  comments: { id: string; authorId: string; authorName: string; authorRole: string; text: string; createdAt: string; replies?: any[]; }[];
  announcements: any[];
}

export function useDB<T = LegacyDB>(selector?: (d: LegacyDB) => T): T {
  const { data } = useQuery({
    queryKey: ["app_data"],
    queryFn: async () => {
      const [
        { data: profiles },
        { data: sessions },
        { data: attendance },
        { data: assignments },
        { data: submissions },
        { data: comments },
        { data: announcements }
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("sessions").select("*"),
        supabase.from("attendance").select("*"),
        supabase.from("assignments").select("*"),
        supabase.from("submissions").select("*"),
        supabase.from("comments").select("*"),
        supabase.from("announcements").select("*")
      ]);
      
      const students = profiles?.filter(p => p.role === "student").map(p => ({
        id: p.id,
        fullName: p.full_name,
        usn: p.usn,
        department: p.department || "",
        year: p.year || "",
        phone: p.phone || "",
        avatar: "",
        qrCode: p.qr_code
      })) || [];
      
      const admins = profiles?.filter(p => p.role === "admin").map(p => ({
        id: p.id,
        fullName: p.full_name,
        adminCode: "admin123", // deprecated
        usn: p.usn,
        year: p.year || "",
        department: p.department || "",
        phone: p.phone || "",
        avatar: ""
      })) || [];

      return {
        students,
        admins,
        sessions: (sessions || []).map(s => ({
          id: s.id,
          title: s.title,
          date: s.date,
          time: s.time,
          host: s.host_id || "",
          resourcePerson: s.resource_person,
          description: s.description || ""
        })),
        attendance: (attendance || []).map(a => ({
          sessionId: a.session_id,
          studentId: a.student_id,
          present: a.present || false
        })),
        assignments: (assignments || []).map(a => ({
          id: a.id,
          title: a.title,
          description: a.description || "",
          dueDate: a.due_date || "",
          createdAt: a.created_at || ""
        })),
        submissions: (submissions || []).map(s => ({
          assignmentId: s.assignment_id,
          studentId: s.student_id,
          submittedAt: s.submitted_at || "",
          note: s.note || ""
        })),
        comments: (comments || []).map(c => {
          const author = profiles?.find(p => p.id === c.author_id);
          return {
            id: c.id,
            authorId: c.author_id,
            authorName: author?.full_name || "Unknown",
            authorRole: author?.role || "student",
            text: c.text,
            createdAt: c.created_at || ""
          };
        }),
        announcements: announcements || []
      };
    }
  });

  const fullData = data || {
    students: [],
    admins: [],
    sessions: [],
    attendance: [],
    assignments: [],
    submissions: [],
    comments: [],
    announcements: []
  };

  return (selector ? selector(fullData as LegacyDB) : fullData) as unknown as T;
}

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => {
          if (data) {
            setUserProfile({
              id: data.id,
              role: data.role,
              fullName: data.full_name,
              usn: data.usn,
              department: data.department,
              year: data.year,
              phone: data.phone,
              qrCode: data.qr_code
            });
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => {
          if (data) {
            setUserProfile({
              id: data.id,
              role: data.role,
              fullName: data.full_name,
              usn: data.usn,
              department: data.department,
              year: data.year,
              phone: data.phone,
              qrCode: data.qr_code
            });
          }
        });
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session: session ? { role: userProfile?.role, userId: session.user.id } : null,
    user: userProfile,
    role: userProfile?.role || null,
    isAuthenticated: !!session && !!userProfile,
    loading
  };
}

export const auth = {
  signOut: async () => await supabase.auth.signOut(),
};

// Deprecated local db operations to prevent crashes until we rewrite
export const db = {
  get: () => ({ students: [], admins: [], sessions: [], attendance: [], assignments: [], submissions: [], comments: [], announcements: [] }),
  set: (updater: (d: any) => any) => {},
  reset: () => {}
};
