import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Topbar from "@/components/layout/topbar";
import { formatDuration } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import type { DailyCallStats } from "@/types/database";

export default async function AnalyticsPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) redirect("/auth/login");

  const supabase = createServerSupabaseClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: dailyStats } = await supabase
    .from("daily_call_stats")
    .select("*")
    .eq("org_id", orgData.organization.id)
    .gte("call_date", sevenDaysAgo.toISOString().split("T")[0])
    .order("call_date", { ascending: true });

  const { data: allCalls } = await supabase
    .from("calls")
    .select("status, duration_seconds, urgency")
    .eq("org_id", orgData.organization.id);

  const calls = allCalls || [];
  const totalCalls = calls.length;
  const missedCalls = calls.filter((c) => c.status === "missed").length;
  const completedCalls = calls.filter((c) => c.status === "completed").length;
  const avgDuration =
    completedCalls > 0
      ? Math.round(
          calls
            .filter((c) => c.duration_seconds > 0)
            .reduce((sum, c) => sum + c.duration_seconds, 0) / completedCalls
        )
      : 0;
  const responseRate =
    totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  const stats = (dailyStats as DailyCallStats[]) || [];
  const maxCalls = Math.max(...stats.map((s) => s.total_calls), 1);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <Topbar title="Analytics" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[
            { label: "Total Calls", value: totalCalls, color: "var(--blue)" },
            { label: "Missed Calls", value: missedCalls, color: "var(--red)" },
            { label: "Avg Duration", value: formatDuration(avgDuration), color: "var(--green)" },
            { label: "Response Rate", value: `${responseRate}%`, color: "var(--orange)" },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 md:p-5"
            >
              <div className="text-[11px] md:text-[13px] text-[var(--text-secondary)] font-medium uppercase tracking-wide mb-2.5">
                {m.label}
              </div>
              <div className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: m.color }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <h2 className="text-base font-semibold tracking-tight mb-4">
          Call Volume - Last 7 Days
        </h2>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 md:p-6">
          {stats.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-tertiary)]">
              <BarChart3 size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm">No data yet.</div>
              <div className="text-xs mt-1">Call volume will appear here once calls are recorded.</div>
            </div>
          ) : (
            <div className="flex items-end gap-2 md:gap-3 h-52">
              {stats.map((day) => {
                const date = new Date(day.call_date);
                const dayName = dayNames[date.getDay()];
                const heightPct = (day.total_calls / maxCalls) * 100;

                return (
                  <div key={day.call_date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs text-[var(--text-secondary)] font-semibold tabular-nums">{day.total_calls}</span>
                    <div
                      className="w-full max-w-[48px] rounded-t-md bg-gradient-to-t from-[var(--accent)] to-[var(--accent-text)] transition-all duration-500"
                      style={{ height: `${Math.max(heightPct, 3)}%` }}
                    />
                    <span className="text-[11px] text-[var(--text-tertiary)] font-medium">{dayName}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
