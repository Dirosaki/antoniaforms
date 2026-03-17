import { z } from "zod";
import {
  appointmentFormatOptions,
  appointmentTypeOptions,
  paymentChoiceOptions,
  preferredPeriodOptions
} from "@/types/appointment";

const whatsappRegex = /^(\+55)?\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;

export const appointmentFormSchema = z.object({
  fullName: z.string().min(3, "Informe nome completo."),
  whatsapp: z.string().regex(whatsappRegex, "Informe um WhatsApp válido com DDD."),
  email: z.string().email("Informe um e-mail válido."),
  appointmentType: z.enum(appointmentTypeOptions),
  appointmentFormat: z.enum(appointmentFormatOptions),
  preferredDate: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Data preferencial inválida."),
  preferredPeriod: z.enum(preferredPeriodOptions),
  notes: z.string().max(1000, "Observações muito longas.").optional(),
  paymentChoice: z.enum(paymentChoiceOptions),
  policyAccepted: z.literal(true, {
    errorMap: () => ({ message: "Você precisa aceitar a política de reserva e cancelamento." })
  }),
  contactAuthorized: z.literal(true, {
    errorMap: () => ({ message: "Você precisa autorizar o contato para seguirmos com o agendamento." })
  })
});

export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;
