import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Topbar from "@/components/layout/topbar";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Phone, MessageSquare, CheckCircle } from "lucide-react";
import type { Call, Message } from "@/types/database";

export default async function CallDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const orgData = await getCurrentOrg();
  if (!orgData) redirect("/auth/login");

  const supabase = createServerSupabaseClient();

  const { data: call } = await supabase
    .from("calls")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", orgData.organization.id)
    .single();

  if (!call) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("call_id", call.id)
    .order("created_at", { ascending: true });

  const typedCall = call as Call;
  const typedMessages = (messages || []) as Message[];

  const callTime = new Date(typedCall.started_at).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <Topbar title="Call Detail" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Back button */}
        <Link
          href="/dashboard/calls"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] text-sm hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to calls
        </Link>

        {/* Meta cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Caller</div>
            <div className="font-medium">{typedCall.caller_name || "Unknown Caller"}</div>
            <div className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">{typedCall.caller_number}</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Status & Duration</div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${typedCall.status === "completed" ? "bg-[var(--green-soft)] text-[var(--green)]" : "bg-[var(--red-soft)] text-[var(--red)]"}`}>{typedCall.status}</span>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">{formatDuration(typedCall.duration_seconds)}</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Date & Time</div>
            <div className="font-medium text-sm">{callTime}</div>
            {typedCall.to_number && (
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">To: {typedCall.to_number}</div>
            )}
          </div>
        </div>

        {/* AI Summary */}
        {typedCall.summary && (
          <div className="bg-[var(--accent-soft)] border border-[rgba(109,90,205,0.2)] rounded-xl p-4 mb-6">
            <div className="text-[11px] uppercase tracking-wide text-[var(--accent-text)] font-semibold mb-1.5">AI Summary</div>
            <div className="text-sm leading-relaxed">{typedCall.summary}</div>
          </div>
        )}

        {/* Transcript */}
        <h2 className="text-base font-semibold tracking-tight mb-4">Transcript</h2>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 md:p-5">
          {typedMessages.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-tertiary)] text-sm">
              No transcript available for this call.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {typedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] md:max-w-[72%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed ${
                    msg.role === "ai"
                      ? "self-start bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-bl-sm"
                      : "self-end bg-[var(--accent)] text-white rounded-br-sm"
                  }`}
                >
                  <div className={`text-[10px] uppercase tracking-wide font-semibold mb-1 ${msg.role === "ai" ? "text-[var(--accent-text)]" : "text-white/60"}`}>
                    {msg.role === "ai" ? "Answerly AI" : "Caller"}
                  </div>
                  {msg.content}
                  <div className={`text-[10px] mt-1 ${msg.role === "ai" ? "text-[var(--text-tertiary)]" : "text-white/40"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[#7c6bd6] transition-colors">
            <Phone size={16} />
            Call Back
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] transition-colors">
            <MessageSquare size={16} />
            Send SMS
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:border-[var(--green)] hover:text-[var(--green)] transition-colors">
            <CheckCircle size={16} />
            Mark Resolved
          </button>
        </div>
      </div>
    </>
  );
}
