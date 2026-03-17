import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { sha256 } from "@/lib/utils/hash";

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    const provider = getPaymentProvider();
    const event = await provider.parseWebhook(rawBody, request.headers);

    if (!event) {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const supabase = getSupabaseAdminClient();
    const payloadHash = sha256(`${event.provider}:${event.externalPaymentId}:${event.eventType}:${rawBody}`);

    const { data: existingLog } = await supabase
      .from("payment_logs")
      .select("id")
      .eq("payload_hash", payloadHash)
      .maybeSingle();

    if (existingLog) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, payment_status, appointment_status")
      .eq("external_payment_id", event.externalPaymentId)
      .maybeSingle();

    await supabase.from("payment_logs").insert({
      appointment_id: appointment?.id ?? null,
      provider: event.provider,
      event_type: appointment ? event.eventType : `${event.eventType}_unmatched`,
      external_payment_id: event.externalPaymentId,
      payload_hash: payloadHash,
      payload: event.payload
    });

    if (!appointment) {
      return NextResponse.json({ received: true, unmatched: true }, { status: 200 });
    }

    const isSameStatus =
      appointment.payment_status === event.normalizedStatus &&
      appointment.appointment_status === event.normalizedStatus;

    if (!isSameStatus) {
      await supabase
        .from("appointments")
        .update({
          payment_status: event.normalizedStatus,
          appointment_status: event.normalizedStatus,
          external_payment_payload: event.payload
        })
        .eq("id", appointment.id);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("AbacatePay webhook error", error);
    return NextResponse.json({ error: "Webhook inválido." }, { status: 400 });
  }
}
