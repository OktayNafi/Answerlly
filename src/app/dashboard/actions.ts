"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleAiActive() {
  const orgData = await getCurrentOrg();
  if (!orgData) return;

  const supabase = createServerSupabaseClient();
  const { data: settings } = await supabase
    .from("org_settings")
    .select("ai_active")
    .eq("org_id", orgData.organization.id)
    .single();

  await supabase
    .from("org_settings")
    .update({ ai_active: !settings?.ai_active })
    .eq("org_id", orgData.organization.id);

  revalidatePath("/dashboard/settings");
}

export async function toggleSmsFollowup() {
  const orgData = await getCurrentOrg();
  if (!orgData) return;

  const supabase = createServerSupabaseClient();
  const { data: settings } = await supabase
    .from("org_settings")
    .select("sms_followup")
    .eq("org_id", orgData.organization.id)
    .single();

  await supabase
    .from("org_settings")
    .update({ sms_followup: !settings?.sms_followup })
    .eq("org_id", orgData.organization.id);

  revalidatePath("/dashboard/settings");
}

export async function markNotificationRead(notificationId: string) {
  const orgData = await getCurrentOrg();
  if (!orgData) return;

  const supabase = createServerSupabaseClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("org_id", orgData.organization.id);

  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

export async function markAllNotificationsRead() {
  const orgData = await getCurrentOrg();
  if (!orgData) return;

  const supabase = createServerSupabaseClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("org_id", orgData.organization.id)
    .eq("is_read", false);

  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}
