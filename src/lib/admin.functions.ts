import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteStudentById = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ studentId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // Verify caller is admin
    const { data: caller } = await context.supabase
      .from("profiles")
      .select("role")
      .eq("id", context.userId)
      .single();
    if (caller?.role !== "admin") throw new Error("Forbidden");

    // Only student accounts may be removed — admins can never delete another admin
    const { data: target } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", data.studentId)
      .maybeSingle();
    if (!target) throw new Error("Profile not found");
    if (target.role !== "student") throw new Error("Forbidden: only student accounts can be removed");



    // Delete dependent rows first (no FK cascade defined)
    await supabaseAdmin.from("attendance").delete().eq("student_id", data.studentId);
    await supabaseAdmin.from("submissions").delete().eq("student_id", data.studentId);
    await supabaseAdmin.from("feedback").delete().eq("student_id", data.studentId);
    await supabaseAdmin.from("profiles").delete().eq("id", data.studentId);

    // Delete auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.studentId);
    if (error) throw new Error(error.message);

    return { success: true };
  });
