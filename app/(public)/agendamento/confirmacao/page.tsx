import { PAYMENT_INSTRUCTIONS } from "@/lib/constants/policy";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export default async function ConfirmacaoPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) return <main className="p-8">ID de agendamento ausente.</main>;

  const supabase = getSupabaseAdminClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, full_name, amount_cents, external_payment_payload")
    .eq("id", id)
    .single();

  const paymentData = (appointment?.external_payment_payload ?? {}) as Record<string, unknown>;
  const qrCodeImage = typeof paymentData.qrCodeImage === "string" ? paymentData.qrCodeImage : null;
  const pixCopyPaste = typeof paymentData.pixCopyPaste === "string" ? paymentData.pixCopyPaste : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-10">
      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-700">Pagamento Pix gerado com sucesso</h1>
        <p className="text-slate-700">{appointment?.full_name}, recebemos seu pré-agendamento.</p>
        <p className="text-sm text-slate-600">{PAYMENT_INSTRUCTIONS}</p>

        {qrCodeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrCodeImage} alt="QR Code Pix" className="mx-auto w-full max-w-xs rounded-lg border p-2" />
        ) : (
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
            QR Code indisponível no momento. Use o código Pix abaixo.
          </p>
        )}

        {pixCopyPaste ? (
          <div className="space-y-2">
            <h2 className="font-semibold">Pix copia e cola</h2>
            <code className="block break-all rounded-md bg-slate-100 p-3 text-xs">{pixCopyPaste}</code>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Código Pix não retornado pelo provedor.</p>
        )}
      </div>
    </main>
  );
}
