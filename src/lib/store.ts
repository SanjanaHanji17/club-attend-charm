import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useSyncExternalStore } from "react";
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
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const [
        { data: profiles },
        { data: sessions },
        { data: attendance },
        { data: assignments },
        { data: submissions },
        { data: comments },
        { data: announcements },
        { data: feedback }
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("sessions").select("*"),
        supabase.from("attendance").select("*"),
        supabase.from("assignments").select("*"),
        supabase.from("submissions").select("*"),
        supabase.from("comments").select("*"),
        supabase.from("announcements").select("*"),
        (supabase.from as any)("feedback").select("*")
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
          createdAt: a.created_at || "",
          file_url: (a as any).file_url || null,
        })),
        submissions: (submissions || []).map(s => ({
          assignmentId: s.assignment_id,
          studentId: s.student_id,
          submittedAt: s.submitted_at || "",
          note: s.note || "",
          file_url: (s as any).file_url || null,
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
        announcements: (announcements || []).map((a: any) => {
          const author = profiles?.find(p => p.id === a.author_id);
          return { ...a, author_name: author?.full_name || "Admin", author_role: author?.role || "admin" };
        }),
        feedback: (feedback || []).map((f: any) => ({
          id: f.id,
          sessionId: f.session_id,
          studentId: f.student_id,
          rating: f.rating,
          comment: f.comment,
          createdAt: f.created_at,
        })),
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
    announcements: [],
    feedback: []
  };

  return (selector ? selector(fullData as LegacyDB) : fullData) as unknown as T;
}

export function useRefreshData() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["app_data"] });
}


type AuthSnapshot = {
  session: { role: Role | null; userId: string } | null;
  user: any | null;
  role: Role | null;
  isAuthenticated: boolean;
  loading: boolean;
  profileMissing: boolean;
};

const EMPTY_AUTH: AuthSnapshot = {
  session: null, user: null, role: null, isAuthenticated: false, loading: true, profileMissing: false,
};

let authSnapshot: AuthSnapshot = EMPTY_AUTH;
const authListeners = new Set<() => void>();
let authInitialized = false;

function setAuthSnapshot(next: AuthSnapshot) {
  authSnapshot = next;
  authListeners.forEach((l) => l());
}

function mapProfile(data: any) {
  return {
    id: data.id,
    role: data.role as Role,
    fullName: data.full_name,
    usn: data.usn,
    department: data.department,
    year: data.year,
    phone: data.phone,
    qrCode: data.qr_code,
  };
}

async function ensureProfile(rawUser: any) {
  // Self-heal: an auth account with no profile row (e.g. the profile insert during
  // registration failed because the session wasn't established yet). Recreate it
  // from the signup metadata instead of forcing the user to register again.
  const meta = rawUser?.user_metadata || {};
  const email: string = rawUser?.email || "";
  const role: Role = email.includes("@admin.") ? "admin" : "student";
  const usn: string = (meta.usn || email.split("@")[0] || "").toUpperCase();
  if (!usn) return null;
  const payload: any = {
    id: rawUser.id,
    role,
    full_name: meta.fullName || meta.full_name || usn,
    usn,
    department: meta.department || null,
    phone: meta.phone || null,
    qr_code: role === "student"
      ? Math.random().toString(36).slice(2, 10).toUpperCase() + usn.slice(-4)
      : null,
  };
  const { data, error } = await supabase.from("profiles").insert(payload).select("*").maybeSingle();
  if (error) {
    // Possibly created concurrently — re-read before giving up.
    const { data: existing } = await supabase.from("profiles").select("*").eq("id", rawUser.id).maybeSingle();
    return existing ?? null;
  }
  return data;
}

async function applySession(rawSession: any) {
  if (!rawSession?.user) {
    setAuthSnapshot({ ...EMPTY_AUTH, loading: false });
    return;
  }
  const userId = rawSession.user.id;
  let { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (!data) {
    data = await ensureProfile(rawSession.user);
  }
  if (data) {
    const profile = mapProfile(data);
    setAuthSnapshot({
      session: { role: profile.role, userId },
      user: profile,
      role: profile.role,
      isAuthenticated: true,
      loading: false,
      profileMissing: false,
    });
  } else {
    // Signed in but no profile row — never leave the UI stuck loading.
    setAuthSnapshot({
      session: { role: null, userId },
      user: null,
      role: null,
      isAuthenticated: false,
      loading: false,
      profileMissing: true,
    });
  }
}

function initAuth() {
  if (authInitialized || typeof window === "undefined") return;
  authInitialized = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    void applySession(session);
  });

  supabase.auth.getSession()
    .then(({ data }) => applySession(data.session))
    .catch(() => setAuthSnapshot({ ...EMPTY_AUTH, loading: false }));
}

export function useAuth(): AuthSnapshot {
  useEffect(() => { initAuth(); }, []);
  return useSyncExternalStore(
    (cb: () => void) => { authListeners.add(cb); return () => { authListeners.delete(cb); }; },
    () => authSnapshot,
    () => EMPTY_AUTH,
  );
}

export const auth = {
  signOut: async () => {
    await supabase.auth.signOut();
    setAuthSnapshot({ ...EMPTY_AUTH, loading: false });
  },
};


// Deprecated local db operations to prevent crashes until we rewrite
export const db = {
  get: () => ({ students: [], admins: [], sessions: [], attendance: [], assignments: [], submissions: [], comments: [], announcements: [] }),
  set: (updater: (d: any) => any) => {},
  reset: () => {}
};
