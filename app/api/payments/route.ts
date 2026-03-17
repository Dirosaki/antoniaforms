import { NextResponse } from "next/server";
import { APPOINTMENT_PRICES_CENTS } from "@/lib/constants/policy";
import { getPaymentProvider } from "@/lib/payments";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { appointmentFormSchema } from "@/lib/validations/appointment";
import type { AppointmentInsert } from "@/types/appointment";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = appointmentFormSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const amountCents =
      input.paymentChoice === "pagamento_integral_pix"
        ? APPOINTMENT_PRICES_CENTS.full
        : APPOINTMENT_PRICES_CENTS.reservation;

    const supabase = getSupabaseAdminClient();

    const duplicateThreshold = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("email", input.email)
      .eq("preferred_date", input.preferredDate)
      .in("appointment_status", ["pending_payment", "paid_reservation", "paid_full"])
      .gte("created_at", duplicateThreshold)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ id: existing.id, reused: true }, { status: 200 });
    }

    const appointmentPayload: AppointmentInsert = {
      full_name: input.fullName,
      whatsapp: input.whatsapp,
      email: input.email,
      appointment_type: input.appointmentType,
      appointment_format: input.appointmentFormat,
      preferred_date: input.preferredDate,
      preferred_period: input.preferredPeriod,
      notes: input.notes ?? null,
      payment_choice: input.paymentChoice,
      payment_provider: "abacatepay",
      payment_status: "pending_payment",
      appointment_status: "pending_payment",
      amount_cents: amountCents,
      currency: "BRL",
      external_payment_id: null,
      external_payment_payload: null,
      policy_accepted: input.policyAccepted,
      contact_authorized: input.contactAuthorized
    };

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert(appointmentPayload)
      .select("id, full_name, email, payment_choice")
      .single();

    if (appointmentError || !appointment) {
      throw appointmentError ?? new Error("Não foi possível criar o agendamento.");
    }

    const paymentProvider = getPaymentProvider();
    const payment = await paymentProvider.createPixCharge({
      appointmentId: appointment.id,
      fullName: appointment.full_name,
      email: appointment.email,
      amountCents,
      paymentChoice: appointment.payment_choice,
      description: `Pré-agendamento consulta nutricional #${appointment.id}`
    });

    const { error: paymentUpdateError } = await supabase
      .from("appointments")
      .update({
        external_payment_id: payment.externalPaymentId,
        external_payment_payload: payment.rawPayload
      })
      .eq("id", appointment.id);

    if (paymentUpdateError) throw paymentUpdateError;

    return NextResponse.json({ id: appointment.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/payments error", error);
    return NextResponse.json(
      { error: "Não foi possível processar sua solicitação agora. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
