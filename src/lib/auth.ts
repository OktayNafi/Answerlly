import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Organization, Membership, Profile } from "@/types/database";

export async function getCurrentUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

export async function getCurrentOrg() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get the user's first membership (in v1, users belong to one org)
  const { data: membership } = await supabase
    .from("memberships")
    .select("*, organizations(*)")
    .eq("user_id", user.id)
    .single();

  if (!membership) return null;

  return {
    membership: membership as Membership,
    organization: (membership as any).organizations as Organization,
  };
}
