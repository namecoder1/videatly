#!/usr/bin/env node

// Carica le variabili d'ambiente dal file .env.local
require("dotenv").config({ path: ".env.local" });

/**
 * Script di debug per verificare la configurazione Stripe in development
 * NOTA: Esegui questo script DOPO aver avviato il server Next.js con NODE_ENV=development
 */

console.log("🔍 Debug Configurazione Stripe Development\n");

// Variabili d'ambiente necessarie per development
const requiredVars = [
  "NODE_ENV",
  "STRIPE_SECRET_KEY_TEST",
  "STRIPE_WEBHOOK_SECRET_TEST",
  "NEXT_PUBLIC_BASE_URL",
];

console.log("📋 Stato Variabili d'Ambiente:");
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? "✅" : "❌";
  const displayValue = value
    ? varName.includes("SECRET")
      ? `${value.substring(0, 8)}...`
      : value
    : "NON IMPOSTATA";

  console.log(`${status} ${varName}: ${displayValue}`);
});

console.log("\n🔑 Verifica Chiavi Stripe:");

// Verifica che si stiano usando le chiavi TEST
const secretKey = process.env.STRIPE_SECRET_KEY_TEST;
if (secretKey) {
  const isTestKey = secretKey.includes("_test_");
  console.log(
    `${isTestKey ? "✅" : "❌"} Chiave segreta: ${isTestKey ? "TEST (corretto)" : "PRODUZIONE (ERRORE!)"}`
  );
} else {
  console.log("❌ STRIPE_SECRET_KEY_TEST non impostata");
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST;
if (webhookSecret) {
  const isValid = webhookSecret.startsWith("whsec_");
  console.log(
    `${isValid ? "✅" : "⚠️"} Webhook secret: ${isValid ? "Formato corretto" : "Formato inaspettato"}`
  );
} else {
  console.log("❌ STRIPE_WEBHOOK_SECRET_TEST non impostata");
}

console.log("\n🌐 Configurazione URL:");
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const isLocalhost = baseUrl && baseUrl.includes("localhost");
console.log(
  `${isLocalhost ? "✅" : "⚠️"} Base URL: ${baseUrl || "NON IMPOSTATA"}`
);

console.log("\n🎯 Azioni Raccomandate:");

if (!process.env.STRIPE_SECRET_KEY_TEST) {
  console.log("1. ❌ Aggiungi STRIPE_SECRET_KEY_TEST al tuo .env.local");
}

if (!process.env.STRIPE_WEBHOOK_SECRET_TEST) {
  console.log("2. ❌ Aggiungi STRIPE_WEBHOOK_SECRET_TEST al tuo .env.local");
}

if (secretKey && !secretKey.includes("_test_")) {
  console.log(
    "3. ❌ CRITICO: Stai usando la chiave di PRODUZIONE in development!"
  );
}

if (!isLocalhost) {
  console.log(
    "4. ⚠️ NEXT_PUBLIC_BASE_URL dovrebbe puntare a localhost per development"
  );
}

console.log("\n📝 Esempio .env.local corretto:");
console.log(`
# Stripe Development
STRIPE_SECRET_KEY_TEST=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxx

# Base URL Development  
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
`);

console.log("\n🔧 Per risolvere il problema webhook:");
console.log("1. Crea/aggiorna il file .env.local con le variabili sopra");
console.log("2. Riavvia il server Next.js (npm run dev)");
console.log("3. Riavvia Stripe CLI (npm run stripe)");
console.log("4. Testa un pagamento");
