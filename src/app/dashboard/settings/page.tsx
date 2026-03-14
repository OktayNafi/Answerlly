import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Topbar from "@/components/layout/topbar";
import ToggleSwitch from "@/components/ui/toggle-switch";
import { toggleAiActive, toggleSmsFollowup } from "@/app/dashboard/actions";
import type { OrgSettings, OfficeHours, MembershipWithProfile } from "@/types/database";

const dayLabels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default async function SettingsPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) redirect("/auth/login");

  const supabase = createServerSupabaseClient();
  const orgId = orgData.organization.id;

  const { data: settings } = await supabase
    .from("org_settings")
    .select("*")
    .eq("org_id", orgId)
    .single();

  const { data: hours } = await supabase
    .from("office_hours")
    .select("*")
    .eq("org_id", orgId)
    .order("day_of_week", { ascending: true });

  const { data: members } = await supabase
    .from("memberships")
    .select("*, profiles(*)")
    .eq("org_id", orgId);

  const orgSettings = settings as OrgSettings | null;
  const officeHours = (hours || []) as OfficeHours[];
  const teamMembers = (members || []) as MembershipWithProfile[];

  return (
    <>
      <Topbar title="Settings" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-3xl">
        {/* Twilio */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--border)]">
            Twilio Configuration
          </h2>
          <div className="space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2 border-b border-[rgba(255,255,255,0.03)]">
              <div>
                <div className="text-[13.5px]">Account SID</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Your Twilio account identifier
                </div>
              </div>
              <code className="text-sm text-[var(--text-secondary)] font-mono bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-md border border-[var(--border)]">
                {orgSettings?.twilio_account_sid
                  ? `${orgSettings.twilio_account_sid.slice(0, 4)}${"*".repeat(12)}${orgSettings.twilio_account_sid.slice(-4)}`
                  : "Not configured"}
              </code>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
              <div>
                <div className="text-[13.5px]">Forwarding Number</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Calls forwarded to this Answerly number
                </div>
              </div>
              <code className="text-sm text-[var(--text-secondary)] font-mono bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-md border border-[var(--border)]">
                {orgData.organization.slug ? "Configured" : "Not set"}
              </code>
            </div>
          </div>
        </section>

        {/* AI Receptionist */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--border)]">
            AI Receptionist
          </h2>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)]">
              <div>
                <div className="text-[13.5px]">AI Answering Active</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Enable or disable the AI receptionist
                </div>
              </div>
              <ToggleSwitch
                checked={orgSettings?.ai_active ?? true}
                action={toggleAiActive}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)]">
              <div>
                <div className="text-[13.5px]">SMS Followup</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Send automatic follow-up texts after calls
                </div>
              </div>
              <ToggleSwitch
                checked={orgSettings?.sms_followup ?? false}
                action={toggleSmsFollowup}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
              <div>
                <div className="text-[13.5px]">Greeting</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  What the AI says when answering
                </div>
              </div>
              <code className="text-sm text-[var(--text-secondary)] font-mono bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-md border border-[var(--border)] max-w-full sm:max-w-[280px] truncate">
                {orgData.organization.greeting || "Default greeting"}
              </code>
            </div>
          </div>
        </section>

        {/* Office Hours */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--border)]">
            Office Hours
          </h2>
          <div className="space-y-0">
            {officeHours.length > 0
              ? officeHours.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)] last:border-b-0"
                  >
                    <div className="text-[13.5px]">
                      {dayLabels[h.day_of_week]}
                    </div>
                    <code className="text-sm text-[var(--text-secondary)] font-mono bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-md border border-[var(--border)]">
                      {h.is_closed
                        ? "Closed"
                        : `${h.open_time || "?"} - ${h.close_time || "?"}`}
                    </code>
                  </div>
                ))
              : dayLabels.map((day) => (
                  <div
                    key={day}
                    className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)] last:border-b-0"
                  >
                    <div className="text-[13.5px]">{day}</div>
                    <code className="text-sm text-[var(--text-tertiary)] font-mono bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-md border border-[var(--border)]">
                      Not set
                    </code>
                  </div>
                ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--border)]">
            Team
          </h2>
          <div className="space-y-0">
            {teamMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)] last:border-b-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-text)] flex items-center justify-center text-white font-semibold text-xs">
                    {m.profiles?.full_name
                      ? m.profiles.full_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "??"}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-medium">
                      {m.profiles?.full_name || "Unknown"}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {m.profiles?.email}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium capitalize ${
                    m.role === "owner"
                      ? "text-[var(--accent-text)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Billing */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 pb-2 border-b border-[var(--border)]">
            Billing
          </h2>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-[13.5px]">Current Plan</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Billed monthly
              </div>
            </div>
            <span className="text-sm text-[var(--accent-text)] font-semibold">
              Pro - £150/mo
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
