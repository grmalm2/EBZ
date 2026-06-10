import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_API_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_JWT;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "SUPABASE_API_URL and SUPABASE_SERVICE_ROLE_JWT must be set for server-side Supabase client.",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function getUserFromToken(token: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
