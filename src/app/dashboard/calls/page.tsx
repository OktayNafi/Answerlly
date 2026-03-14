import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Topbar from "@/components/layout/topbar";
import { formatDuration, timeAgo } from "@/lib/utils";
import { PhoneIncoming } from "lucide-react";
import Link from "next/link";
import type { Call } from "@/types/database";

export default async function CallsPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) redirect("/auth/login");

  const supabase = createServerSupabaseClient();

  const { data: calls } = await supabase
    .from("calls")
    .select("*")
    .eq("org_id", orgData.organization.id)
    .order("started_at", { ascending: false })
    .limit(50);

  return (
    <>
      <Topbar title="Calls" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          {(calls || []).length === 0 ? (
            <div className="text-center py-20 text-[var(--text-tertiary)]">
              <PhoneIncoming size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm">No calls yet.</div>
              <div className="text-xs mt-1">Once your Twilio number receives calls, they'll appear here.</div>
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
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Date & Time</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {(calls as Call[]).map((call) => (
                    <tr key={call.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        <Link href={`/dashboard/calls/${call.id}`} className="block">
                          <div className="font-medium text-sm">{call.caller_name || "Unknown Caller"}</div>
                          <div className="text-xs text-[var(--text-tertiary)] font-mono">{call.caller_number}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${call.status === "completed" ? "bg-[var(--green-soft)] text-[var(--green)]" : call.status === "missed" ? "bg-[var(--red-soft)] text-[var(--red)]" : "bg-[var(--orange-soft)] text-[var(--orange)]"}`}>{call.status}</span>
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
                {(calls as Call[]).map((call) => (
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
      </div>
    </>
  );
}
