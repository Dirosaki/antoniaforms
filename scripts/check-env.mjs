#!/usr/bin/env node

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESERVATION_FEE_CENTS",
  "FULL_APPOINTMENT_FEE_CENTS",
  "ABACATEPAY_BASE_URL",
  "ABACATEPAY_API_KEY"
];

const optional = ["ABACATEPAY_WEBHOOK_SECRET"];

const missingRequired = required.filter((key) => !process.env[key]);
const missingOptional = optional.filter((key) => !process.env[key]);

if (missingRequired.length > 0) {
  console.error("❌ Variáveis obrigatórias ausentes:");
  for (const key of missingRequired) {
    console.error(`   - ${key}`);
  }
  process.exit(1);
}

console.log("✅ Variáveis obrigatórias OK.");
if (missingOptional.length > 0) {
  console.log("⚠️ Variáveis opcionais ausentes:");
  for (const key of missingOptional) {
    console.log(`   - ${key}`);
  }
}
