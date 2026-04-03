import { supabaseServer } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return user;
}