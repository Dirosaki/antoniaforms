import type { PaymentChoice } from "@/types/appointment";

export type CreatePixChargeInput = {
  appointmentId: string;
  fullName: string;
  email: string;
  cpfOrCnpj?: string;
  amountCents: number;
  paymentChoice: PaymentChoice;
  description: string;
};

export type CreatePixChargeResult = {
  externalPaymentId: string;
  status: string;
  qrCodeImage?: string;
  pixCopyPaste?: string;
  rawPayload: Record<string, unknown>;
};

export type PaymentWebhookEvent = {
  provider: "abacatepay";
  eventType: string;
  externalPaymentId: string;
  normalizedStatus: "pending_payment" | "paid_reservation" | "paid_full" | "cancelled";
  payload: Record<string, unknown>;
};

export interface PaymentProvider {
  providerName: "abacatepay";
  createPixCharge(input: CreatePixChargeInput): Promise<CreatePixChargeResult>;
  parseWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent | null>;
}
