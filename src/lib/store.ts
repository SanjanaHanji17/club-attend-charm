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

const KEY = "cc_attendance_db_v1";
const SESSION_KEY = "cc_attendance_session_v1";

const seed = (): DB => ({
  students: [
    { id: "s1", fullName: "Aarav Sharma", usn: "1MS22CS001", department: "CSE", year: "3rd", phone: "9000000001", password: "demo123" },
    { id: "s2", fullName: "Diya Patel", usn: "1MS22CS002", department: "CSE", year: "3rd", phone: "9000000002", password: "demo123" },
    { id: "s3", fullName: "Rohan Iyer", usn: "1MS22IS010", department: "ISE", year: "3rd", phone: "9000000003", password: "demo123" },
    { id: "s4", fullName: "Meera Reddy", usn: "1MS22EC020", department: "ECE", year: "2nd", phone: "9000000004", password: "demo123" },
  ],
  admins: [
    { id: "a1", fullName: "Volunteer Lead", adminCode: "admin123", usn: "1MS21CS099", year: "4th", department: "CSE", phone: "9999999999", password: "admin123" },
  ],
  sessions: [
    { id: "ss1", title: "Intro to DSA", date: "2025-09-12", host: "Coding Club", resourcePerson: "Prof. Anita Rao", description: "Foundations of arrays, recursion and complexity analysis." },
    { id: "ss2", title: "Competitive Programming Bootcamp", date: "2025-09-26", host: "Coding Club", resourcePerson: "Karthik N.", description: "Greedy, two pointers, and sliding window patterns." },
    { id: "ss3", title: "Web Dev with React", date: "2025-10-10", host: "Coding Club", resourcePerson: "Sneha M.", description: "Hands-on React, hooks, state management." },
    { id: "ss4", title: "AI/ML Hackathon Prep", date: "2025-10-24", host: "Coding Club", resourcePerson: "Dr. Kiran V.", description: "Building rapid ML prototypes with Python." },
    { id: "ss5", title: "System Design 101", date: "2025-11-07", host: "Coding Club", resourcePerson: "Arjun B.", description: "Scalability, caching and load balancing fundamentals." },
  ],
  attendance: [
    { sessionId: "ss1", studentId: "s1", present: true },
    { sessionId: "ss1", studentId: "s2", present: true },
    { sessionId: "ss1", studentId: "s3", present: false },
    { sessionId: "ss2", studentId: "s1", present: true },
    { sessionId: "ss2", studentId: "s2", present: false },
    { sessionId: "ss2", studentId: "s3", present: true },
    { sessionId: "ss3", studentId: "s1", present: true },
    { sessionId: "ss3", studentId: "s2", present: true },
    { sessionId: "ss4", studentId: "s1", present: false },
  ],
  assignments: [
    { id: "as1", title: "Two Sum & Variants", description: "Solve 5 problems on hashing patterns.", dueDate: "2025-10-20", createdAt: "2025-10-01" },
    { id: "as2", title: "Build a To-Do app in React", description: "Use hooks and localStorage.", dueDate: "2025-11-01", createdAt: "2025-10-12" },
    { id: "as3", title: "Graph Traversal Set", description: "BFS/DFS on 4 LeetCode problems.", dueDate: "2025-09-15", createdAt: "2025-09-01" },
  ],
  submissions: [
    { assignmentId: "as1", studentId: "s1", submittedAt: "2025-10-18", note: "Done." },
    { assignmentId: "as3", studentId: "s1", submittedAt: "2025-09-14" },
  ],
  comments: [
    { id: "c1", authorId: "s2", authorName: "Diya Patel", authorRole: "student", text: "Will the React session be recorded?", createdAt: "2025-10-08T10:00:00Z" },
    { id: "c2", authorId: "a1", authorName: "Volunteer Lead", authorRole: "admin", text: "Yes! Recordings will be posted in the resources channel.", createdAt: "2025-10-08T11:30:00Z" },
  ],
});

let listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const load = (): DB => {
  if (typeof window === "undefined") return seed();
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  try { return JSON.parse(raw) as DB; } catch { return seed(); }
};

const save = (db: DB) => {
  localStorage.setItem(KEY, JSON.stringify(db));
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
  // useSyncExternalStore returns referentially-equal data only if selector returns same ref.
  // For SSR safety, give a server snapshot using seed().
  return useSyncExternalStore(subscribe, getSnapshot, () => selector(seed()));
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
