import type {
  CreatePixChargeInput,
  CreatePixChargeResult,
  PaymentProvider,
  PaymentWebhookEvent
} from "@/lib/payments/types";
import { abacateRequest } from "@/lib/payments/abacatepay/client";
import { safeCompare, sha256 } from "@/lib/utils/hash";

/**
 * Assunções de API v2 do AbacatePay (validar na documentação oficial antes de produção final):
 * - POST /pix/charges cria cobrança e retorna id/status/pix data
 * - webhook possui header x-abacate-signature contendo sha256(rawBody + webhookSecret)
 */
export class AbacatePayProvider implements PaymentProvider {
  providerName = "abacatepay" as const;

  async createPixCharge(input: CreatePixChargeInput): Promise<CreatePixChargeResult> {
    const payload = {
      amount: input.amountCents,
      currency: "BRL",
      paymentMethod: "pix",
      description: input.description,
      metadata: {
        appointmentId: input.appointmentId,
        paymentChoice: input.paymentChoice
      },
      customer: {
        name: input.fullName,
        email: input.email
      }
    };

    const data = await abacateRequest<Record<string, unknown>>("/pix/charges", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return {
      externalPaymentId: String(data.id),
      status: String(data.status ?? "pending"),
      qrCodeImage: typeof data.qrCodeImage === "string" ? data.qrCodeImage : undefined,
      pixCopyPaste: typeof data.pixCopyPaste === "string" ? data.pixCopyPaste : undefined,
      rawPayload: data
    };
  }

  async parseWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent | null> {
    const signature = headers.get("x-abacate-signature");
    const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expected = sha256(`${rawBody}${webhookSecret}`);
      if (!safeCompare(expected, signature)) {
        throw new Error("Assinatura de webhook inválida.");
      }
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const paymentId = String(payload.paymentId ?? payload.id ?? "");
    if (!paymentId) return null;

    const eventType = String(payload.event ?? payload.type ?? "unknown");
    const rawStatus = String(payload.status ?? "pending").toLowerCase();
    const metadata = (payload.metadata ?? {}) as Record<string, unknown>;
    const paymentChoice = String(metadata.paymentChoice ?? "taxa_reserva_pix");

    const normalizedStatus: PaymentWebhookEvent["normalizedStatus"] =
      rawStatus === "paid" || rawStatus === "confirmed"
        ? paymentChoice === "pagamento_integral_pix"
          ? "paid_full"
          : "paid_reservation"
        : rawStatus === "cancelled" || rawStatus === "expired"
          ? "cancelled"
          : "pending_payment";

    return {
      provider: "abacatepay",
      eventType,
      externalPaymentId: paymentId,
      normalizedStatus,
      payload
    };
  }
}
