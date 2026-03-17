export const appointmentTypeOptions = ["primeira_consulta", "retorno", "acompanhamento"] as const;
export const appointmentFormatOptions = ["presencial", "online"] as const;
export const preferredPeriodOptions = ["manha", "tarde", "noite"] as const;
export const paymentChoiceOptions = ["taxa_reserva_pix", "pagamento_integral_pix"] as const;
export const paymentStatusOptions = ["pending_payment", "paid_reservation", "paid_full", "cancelled"] as const;
export const appointmentStatusOptions = ["pending_payment", "paid_reservation", "paid_full", "cancelled"] as const;

export type AppointmentType = (typeof appointmentTypeOptions)[number];
export type AppointmentFormat = (typeof appointmentFormatOptions)[number];
export type PreferredPeriod = (typeof preferredPeriodOptions)[number];
export type PaymentChoice = (typeof paymentChoiceOptions)[number];
export type PaymentStatus = (typeof paymentStatusOptions)[number];
export type AppointmentStatus = (typeof appointmentStatusOptions)[number];

export type AppointmentInsert = {
  full_name: string;
  whatsapp: string;
  email: string;
  appointment_type: AppointmentType;
  appointment_format: AppointmentFormat;
  preferred_date: string;
  preferred_period: PreferredPeriod;
  notes: string | null;
  payment_choice: PaymentChoice;
  payment_provider: "abacatepay";
  payment_status: PaymentStatus;
  appointment_status: AppointmentStatus;
  amount_cents: number;
  currency: "BRL";
  external_payment_id: string | null;
  external_payment_payload: Record<string, unknown> | null;
  policy_accepted: boolean;
  contact_authorized: boolean;
};

export type AppointmentRecord = AppointmentInsert & {
  id: string;
  created_at: string;
  updated_at: string;
};
