import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Twilio sends POST requests to this endpoint when a call comes in
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const callSid = formData.get("CallSid") as string;
    const callerNumber = formData.get("From") as string;
    const toNumber = formData.get("To") as string;
    const callStatus = formData.get("CallStatus") as string;

    if (!callSid || !toNumber) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const supabase = createAdminClient();

    // Look up which organization owns this phone number
    const { data: phoneNumber } = await supabase
      .from("phone_numbers")
      .select("id, org_id")
      .eq("phone_number", toNumber)
      .eq("status", "active")
      .single();

    if (!phoneNumber) {
      // No org found for this number — return basic TwiML
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Sorry, this number is not currently active. Please try again later.</Say>
          <Hangup/>
        </Response>`,
        {
          headers: { "Content-Type": "text/xml" },
        }
      );
    }

    // Get the org's greeting
    const { data: org } = await supabase
      .from("organizations")
      .select("greeting")
      .eq("id", phoneNumber.org_id)
      .single();

    // Create a call record
    const { data: call, error: callError } = await supabase
      .from("calls")
      .insert({
        org_id: phoneNumber.org_id,
        phone_number_id: phoneNumber.id,
        twilio_call_sid: callSid,
        caller_number: callerNumber || "Unknown",
        to_number: toNumber,
        status: "completed", // Basic flow — will be 'in_progress' once AI voice is integrated
        urgency: "low",
        duration_seconds: 0,
      })
      .select()
      .single();

    if (callError) {
      console.error("Failed to create call record:", callError);
    }

    // Return TwiML response
    // In v1 this is a simple greeting + hangup
    // In v2 this will connect to AI voice via Twilio Media Streams
    const greeting =
      org?.greeting || "Thanks for calling. We will get back to you shortly.";

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="Polly.Amy">${escapeXml(greeting)}</Say>
      <Pause length="1"/>
      <Say voice="Polly.Amy">We've noted your call and someone from our team will be in touch soon. Thank you.</Say>
      <Hangup/>
    </Response>`;

    return new NextResponse(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Twilio webhook error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>We're experiencing technical difficulties. Please try again later.</Say>
        <Hangup/>
      </Response>`,
      {
        headers: { "Content-Type": "text/xml" },
      }
    );
  }
}

// Escape special XML characters for TwiML
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
