"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { APPOINTMENT_PRICES_CENTS, CANCELLATION_POLICY_TEXT } from "@/lib/constants/policy";
import { formatBRL } from "@/lib/utils/currency";
import { appointmentFormSchema, type AppointmentFormInput } from "@/lib/validations/appointment";

export function PrebookingForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AppointmentFormInput>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      paymentChoice: "taxa_reserva_pix"
    }
  });

  const paymentChoice = watch("paymentChoice");
  const selectedPrice = useMemo(
    () =>
      paymentChoice === "pagamento_integral_pix"
        ? APPOINTMENT_PRICES_CENTS.full
        : APPOINTMENT_PRICES_CENTS.reservation,
    [paymentChoice]
  );

  const onSubmit = async (data: AppointmentFormInput) => {
    setServerError(null);
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = (await response.json()) as { id?: string; error?: string };
    if (!response.ok || !result.id) {
      setServerError(result.error ?? "Não foi possível gerar seu Pix agora. Tente novamente em instantes.");
      return;
    }

    router.push(`/agendamento/confirmacao?id=${result.id}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-brand-700">Dados pessoais</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome completo" error={errors.fullName?.message}>
            <input className="input" {...register("fullName")} />
          </Field>
          <Field label="WhatsApp" error={errors.whatsapp?.message}>
            <input className="input" placeholder="(11) 99999-9999" {...register("whatsapp")} />
          </Field>
          <Field label="E-mail" error={errors.email?.message}>
            <input className="input" type="email" {...register("email")} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-brand-700">Agendamento</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tipo de consulta" error={errors.appointmentType?.message}>
            <select className="input" {...register("appointmentType")}>
              <option value="primeira_consulta">Primeira consulta</option>
              <option value="retorno">Retorno</option>
              <option value="acompanhamento">Acompanhamento</option>
            </select>
          </Field>
          <Field label="Formato" error={errors.appointmentFormat?.message}>
            <select className="input" {...register("appointmentFormat")}>
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
            </select>
          </Field>
          <Field label="Data preferencial" error={errors.preferredDate?.message}>
            <input className="input" type="date" {...register("preferredDate")} />
          </Field>
          <Field label="Período preferencial" error={errors.preferredPeriod?.message}>
            <select className="input" {...register("preferredPeriod")}>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>
          </Field>
          <Field label="Observações (opcional)" error={errors.notes?.message}>
            <textarea className="input min-h-24" {...register("notes")} />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-brand-700">Pagamento</h2>
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="radio" value="taxa_reserva_pix" {...register("paymentChoice")} />
            <span>
              <strong>Taxa de reserva via Pix</strong>
              <p className="text-sm text-slate-600">{formatBRL(APPOINTMENT_PRICES_CENTS.reservation)}</p>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="radio" value="pagamento_integral_pix" {...register("paymentChoice")} />
            <span>
              <strong>Pagamento integral via Pix</strong>
              <p className="text-sm text-slate-600">{formatBRL(APPOINTMENT_PRICES_CENTS.full)}</p>
            </span>
          </label>
          <p className="rounded-md bg-brand-50 p-3 text-sm text-brand-700">
            Valor selecionado: <strong>{formatBRL(selectedPrice)}</strong>
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-brand-700">Política de reserva e cancelamento</h2>
        <p className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{CANCELLATION_POLICY_TEXT}</p>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" {...register("policyAccepted")} />
          <span>Li e concordo com a política de reserva e cancelamento.</span>
        </label>
        {errors.policyAccepted && <p className="text-sm text-red-600">{errors.policyAccepted.message}</p>}

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" {...register("contactAuthorized")} />
          <span>Autorizo contato por WhatsApp e e-mail para informações sobre meu agendamento.</span>
        </label>
        {errors.contactAuthorized && <p className="text-sm text-red-600">{errors.contactAuthorized.message}</p>}
      </section>

      {serverError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        {isSubmitting ? "Gerando Pix..." : "Confirmar pré-agendamento"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </label>
  );
}
