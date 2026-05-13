import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({
  usn: z.string().min(1).max(64),
  role: z.enum(["student", "admin"]),
  newPassword: z.string().min(6).max(128),
});

export const resetPasswordByUsn = createServerFn({ method: "POST" })
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const email = `${data.usn.toLowerCase()}@${data.role}.codeclub.app`;

    // Find user by email by searching paginated list
    let userId: string | null = null;
    let page = 1;
    while (page < 20 && !userId) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const found = list.users.find((u) => u.email?.toLowerCase() === email);
      if (found) userId = found.id;
      if (list.users.length < 200) break;
      page++;
    }

    if (!userId) throw new Error("No account found with that USN and role");

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.newPassword,
    });
    if (updateError) throw new Error(updateError.message);

    return { success: true };
  });
