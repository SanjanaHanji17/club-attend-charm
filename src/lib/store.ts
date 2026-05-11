// Frontend-only data store using localStorage. Mocks the backend.
import { useEffect, useState, useSyncExternalStore } from "react";

export type Role = "student" | "admin";

export interface Student {
  id: string;
  fullName: string;
  usn: string;
  department: string;
  year: string;
  phone: string;
  password: string;
  avatar?: string;
}
export interface Admin {
  id: string;
  fullName: string;
  adminCode: string;
  usn: string;
  year: string;
  department: string;
  phone: string;
  password: string;
  avatar?: string;
}
export interface Session {
  id: string;
  title: string;
  date: string;
  host: string;
  resourcePerson: string;
  description: string;
}
export interface AttendanceRecord {
  sessionId: string;
  studentId: string;
  present: boolean;
}
export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
}
export interface Submission {
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  note?: string;
}
export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  text: string;
  createdAt: string;
  replies?: Comment[];
}

interface DB {
  students: Student[];
  admins: Admin[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  submissions: Submission[];
  comments: Comment[];
}

const KEY = "cc_attendance_db_v2";
const SESSION_KEY = "cc_attendance_session_v1";

// Empty initial database. All data must be created by registration / admin actions.
const seed = (): DB => ({
  students: [],
  admins: [],
  sessions: [],
  attendance: [],
  assignments: [],
  submissions: [],
  comments: [],
});

let listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

let cachedRaw: string | null = null;
let cachedDB: DB | null = null;
const SERVER_SNAPSHOT: DB = seed();

const load = (): DB => {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    cachedRaw = JSON.stringify(s);
    cachedDB = s;
    return s;
  }
  if (raw === cachedRaw && cachedDB) return cachedDB;
  try {
    const parsed = JSON.parse(raw) as DB;
    cachedRaw = raw;
    cachedDB = parsed;
    return parsed;
  } catch {
    return seed();
  }
};

const save = (db: DB) => {
  const raw = JSON.stringify(db);
  localStorage.setItem(KEY, raw);
  cachedRaw = raw;
  cachedDB = db;
  emit();
};

export const db = {
  get(): DB { return load(); },
  set(updater: (d: DB) => DB) {
    const next = updater(load());
    save(next);
  },
  reset() { save(seed()); },
};

export function useDB<T>(selector: (d: DB) => T): T {
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };
  const getSnapshot = () => selector(load());
  return useSyncExternalStore(subscribe, getSnapshot, () => selector(SERVER_SNAPSHOT));
}

// Auth session
export interface AuthSession {
  role: Role;
  userId: string;
}

export const auth = {
  get(): AuthSession | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  },
  set(s: AuthSession | null) {
    if (typeof window === "undefined") return;
    if (!s) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    emit();
  },
};

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  useEffect(() => {
    setSession(auth.get());
    const cb = () => setSession(auth.get());
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  const data = useDB((d) => d);
  const user =
    session?.role === "student"
      ? data.students.find((s) => s.id === session.userId) ?? null
      : session?.role === "admin"
      ? data.admins.find((a) => a.id === session.userId) ?? null
      : null;

  return { session, user, role: session?.role ?? null };
}

// Helpers
export const uid = () => Math.random().toString(36).slice(2, 10);
