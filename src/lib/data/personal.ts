import { createClient } from "@/lib/supabase/server";
import type { PersonalTrainer } from "@/types/database";

/** Returns the authenticated trainer's profile, or null if not signed in. */
export async function getPersonal(): Promise<PersonalTrainer | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("personal_trainers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (data as PersonalTrainer) ?? null;
}
