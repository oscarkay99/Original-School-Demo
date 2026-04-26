import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl      = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient      = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const { guardianEmail, studentName, guardianName } = await req.json() as {
      guardianEmail: string;
      studentName: string;
      guardianName: string;
    };

    if (!guardianEmail || !studentName) {
      return new Response(
        JSON.stringify({ error: "guardianEmail and studentName are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === guardianEmail.toLowerCase()
    );

    if (alreadyExists) {
      // User exists — just ensure their role is set to Parent
      const existingUser = existingUsers.users.find(
        (u) => u.email?.toLowerCase() === guardianEmail.toLowerCase()
      )!;
      await adminClient.auth.admin.updateUserById(existingUser.id, {
        user_metadata: { role: "Parent", name: guardianName, linkedStudent: studentName },
      });
      return new Response(
        JSON.stringify({ status: "existing_user_updated", email: guardianEmail }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Invite new parent — sends them an email with a magic link to set their password
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(guardianEmail, {
      data: { role: "Parent", name: guardianName, linkedStudent: studentName },
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ status: "invited", userId: data.user?.id, email: guardianEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
