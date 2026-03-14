import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Topbar from "@/components/layout/topbar";
import { Phone, PhoneMissed, Clock, Zap, PhoneIncoming, Bell } from "lucide-react";
import { formatDuration, timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { Call, Notification } from "@/types/database";

export default async function DashboardPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) redirect("/auth/login");

  const supabase = createServerSupabaseClient();
  const { organization } = orgData;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: callsToday } = await supabase
    .from("calls")
    .select("*")
    .eq("org_id", organization.id)
    .gte("started_at", todayStart.toISOString())
    .order("started_at", { ascending: false });

  const { data: recentCalls } = await supabase
    .from("calls")
    .select("*")
    .eq("org_id", organization.id)
    .order("started_at", { ascending: false })
    .limit(5);

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("org_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const calls = (callsToday || []) as Call[];
  const missedToday = calls.filter((c) => c.status === "missed").length;
  const avgDuration =
    calls.length > 0
      ? Math.round(
          calls.reduce((sum, c) => sum + c.duration_seconds, 0) / calls.length
        )
      : 0;

  const metrics = [
    {
      label: "Calls Today",
      value: calls.length,
      sub: "Total incoming",
      color: "var(--blue)",
      bg: "var(--blue-soft)",
      icon: Phone,
    },
    {
      label: "Missed Calls",
      value: missedToday,
      sub: calls.length > 0
        ? `${Math.round(((calls.length - missedToday) / calls.length) * 100)}% answer rate`
        : "No calls yet",
      color: "var(--red)",
      bg: "var(--red-soft)",
      icon: PhoneMissed,
    },
    {
      label: "Avg Duration",
      value: formatDuration(avgDuration),
      sub: "Across today's calls",
      color: "var(--green)",
      bg: "var(--green-soft)",
      icon: Clock,
    },
    {
      label: "Active Leads",
      value: calls.filter((c) => c.status === "completed").length,
      sub: `${calls.filter((c) => c.urgency === "high").length} high priority`,
      color: "var(--orange)",
      bg: "var(--orange-soft)",
      icon: Zap,
    },
  ];

  return (
    <>
      <Topbar title="Overview" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 md:p-5 hover:border-[var(--border-bright)] transition-colors"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-[11px] md:text-[13px] text-[var(--text-secondary)] font-medium uppercase tracking-wide">
                  {m.label}
                </span>
                <div
                  className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center"
                  style={{ background: m.bg, color: m.color }}
                >
                  <m.icon size={16} />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums">
                {m.value}
              </div>
              <div className="text-[11px] md:text-xs text-[var(--text-tertiary)] mt-1">
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Calls */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold tracking-tight">
            Recent Calls
          </h2>
          <Link
            href="/dashboard/calls"
            className="text-xs text-[var(--accent-text)] font-medium hover:underline"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden mb-6">
          {(recentCalls || []).length === 0 ? (
            <div className="text-center py-16 text-[var(--text-tertiary)]">
              <PhoneIncoming size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm">No calls yet.</div>
              <div className="text-xs mt-1">Once calls start coming in, they'll appear here.</div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="w-full hidden md:table">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[rgba(255,255,255,0.01)]">
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Caller</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Duration</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Time</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentCalls as Call[]).map((call) => (
                    <tr key={call.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="px-4 py-3.5">
                        <Link href={`/dashboard/calls/${call.id}`}>
                          <div className="font-medium text-sm">{call.caller_name || "Unknown Caller"}</div>
                          <div className="text-xs text-[var(--text-tertiary)] font-mono">{call.caller_number}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${call.status === "completed" ? "bg-[var(--green-soft)] text-[var(--green)]" : "bg-[var(--red-soft)] text-[var(--red)]"}`}>{call.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{formatDuration(call.duration_seconds)}</td>
                      <td className="px-4 py-3.5 text-sm text-[var(--text-tertiary)]">{timeAgo(call.started_at)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-medium capitalize ${call.urgency === "high" ? "text-[var(--red)]" : call.urgency === "medium" ? "text-[var(--orange)]" : "text-[var(--green)]"}`}>{call.urgency}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[var(--border)]">
                {(recentCalls as Call[]).map((call) => (
                  <Link key={call.id} href={`/dashboard/calls/${call.id}`} className="block px-4 py-3.5 hover:bg-[var(--bg-card-hover)] transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-medium text-sm">{call.caller_name || "Unknown Caller"}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${call.status === "completed" ? "bg-[var(--green-soft)] text-[var(--green)]" : "bg-[var(--red-soft)] text-[var(--red)]"}`}>{call.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                      <span className="font-mono">{call.caller_number}</span>
                      <span>{formatDuration(call.duration_seconds)}</span>
                      <span>{timeAgo(call.started_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold tracking-tight">Notifications</h2>
          <Link href="/dashboard/notifications" className="text-xs text-[var(--accent-text)] font-medium hover:underline">View all &rarr;</Link>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          {(notifications || []).length === 0 ? (
            <div className="text-center py-12 text-[var(--text-tertiary)]">
              <Bell size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm">No notifications yet.</div>
            </div>
          ) : (
            (notifications as Notification[]).map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-card-hover)] transition-colors">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? "bg-[var(--border-bright)]" : "bg-[var(--accent-text)]"}`} />
                <div>
                  <div className="text-[13.5px] font-medium">{n.title}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{n.message}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-1">{timeAgo(n.created_at)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
