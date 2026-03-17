import { AbacatePayProvider } from "@/lib/payments/abacatepay/provider";
import type { PaymentProvider } from "@/lib/payments/types";

export function getPaymentProvider(): PaymentProvider {
  // Mantém ponto único para futura expansão (ex.: cartões na fase 2)
  return new AbacatePayProvider();
}
