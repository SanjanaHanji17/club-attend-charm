import { supabase } from "@/integrations/supabase/client";

export const makeEmail = (usn: string, role: string) => `${usn.toLowerCase()}@${role}.codeclub.app`;

export async function loginWithUsn(usn: string, password: string, role: string) {
  const email = makeEmail(usn, role);
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function registerWithUsn(usn: string, password: string, role: string, metadata: any) {
  const email = makeEmail(usn, role);
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    }
  });
}
