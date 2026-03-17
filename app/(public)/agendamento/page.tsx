import { PrebookingForm } from "@/components/appointment/prebooking-form";

export default function AgendamentoPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-10">
      <header className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold text-brand-700">Pré-agendamento de consulta nutricional</h1>
        <p className="text-slate-600">
          Escolha seu tipo de consulta, informe seus dados e finalize a reserva com Pix em poucos minutos.
        </p>
      </header>
      <PrebookingForm />
    </main>
  );
}
