export const CANCELLATION_POLICY_TEXT = `Para garantir o horário reservado no coworking, solicitamos pagamento antecipado no momento do pré-agendamento.

• Em caso de cancelamento com pelo menos 24 horas de antecedência, o valor pago poderá ser reaproveitado na remarcação.
• Cancelamentos com menos de 24 horas ou ausência no horário (no-show) não geram reembolso.
• Se houver necessidade de ajuste por parte da profissional, você poderá remarcar sem custo adicional.

Este conteúdo é informativo e não constitui aconselhamento jurídico.`;

export const PAYMENT_INSTRUCTIONS =
  "Após efetuar o Pix, aguarde a confirmação automática. Você também receberá confirmação por WhatsApp e e-mail.";

export const APPOINTMENT_PRICES_CENTS = {
  reservation: Number(process.env.RESERVATION_FEE_CENTS ?? 5000),
  full: Number(process.env.FULL_APPOINTMENT_FEE_CENTS ?? 22000)
} as const;
