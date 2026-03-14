import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Topbar from "@/components/layout/topbar";
import { timeAgo } from "@/lib/utils";
import { Bell } from "lucide-react";
import MarkReadButton from "@/components/ui/mark-read-button";
import MarkAllReadButton from "@/components/ui/mark-all-read-button";
import type { Notification } from "@/types/database";

export default async function NotificationsPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) redirect("/auth/login");

  const supabase = createServerSupabaseClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("org_id", orgData.organization.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const hasUnread = (notifications || []).some((n: any) => !n.is_read);

  return (
    <>
      <Topbar title="Notifications" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {hasUnread && (
          <div className="flex justify-end mb-3">
            <MarkAllReadButton />
          </div>
        )}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          {(notifications || []).length === 0 ? (
            <div className="text-center py-20 text-[var(--text-tertiary)]">
              <Bell size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm">No notifications yet.</div>
              <div className="text-xs mt-1">They'll appear here when calls come in.</div>
            </div>
          ) : (
            (notifications as Notification[]).map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    n.is_read
                      ? "bg-[var(--border-bright)]"
                      : "bg-[var(--accent-text)]"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium">{n.title}</div>
                  {n.message && (
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {n.message}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-[var(--text-tertiary)]">
                      {timeAgo(n.created_at)}
                    </span>
                    {!n.is_read && <MarkReadButton id={n.id} />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
