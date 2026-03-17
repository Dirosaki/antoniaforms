import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pré-agendamento Nutrição",
  description: "Pré-agendamento com pagamento via Pix para consultas de nutrição."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
