import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Twilio sends status updates here (ringing, in-progress, completed, etc.)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as string;
    const callDuration = formData.get("CallDuration") as string;

    if (!callSid) {
      return NextResponse.json({ error: "Missing CallSid" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Map Twilio status to our status enum
    const statusMap: Record<string, string> = {
      queued: "ringing",
      ringing: "ringing",
      "in-progress": "in_progress",
      completed: "completed",
      busy: "missed",
      "no-answer": "missed",
      canceled: "missed",
      failed: "failed",
    };

    const status = statusMap[callStatus] || "completed";
    const duration = callDuration ? parseInt(callDuration, 10) : 0;

    // Update the call record
    const { error } = await supabase
      .from("calls")
      .update({
        status,
        duration_seconds: duration,
        ended_at: new Date().toISOString(),
      })
      .eq("twilio_call_sid", callSid);

    if (error) {
      console.error("Failed to update call:", error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Status callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
