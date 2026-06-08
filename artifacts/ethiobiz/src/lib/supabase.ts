import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. Auth features will not work.");
}

export const supabaseClient = createClient(
  supabaseUrl || "",
  supabaseAnonKey || "",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);

export async function getSupabaseToken(): Promise<string | null> {
  const { data } = await supabaseClient.auth.getSession();
  return data.session?.access_token ?? null;
}
