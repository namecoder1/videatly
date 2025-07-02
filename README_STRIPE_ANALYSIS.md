# 🔍 Analisi Completa Configurazione Stripe

## 📋 **Stato Attuale dell'Implementazione**

### ✅ **Componenti Funzionanti**

1. **Configurazione Base API**

   - ✅ Separazione corretta delle chiavi per development/production
   - ✅ Versione API aggiornata (`2025-04-30.basil`)
   - ✅ Gestione errori per chiavi mancanti migliorata

2. **Struttura Webhook**

   - ✅ Webhook principale con routing corretto
   - ✅ Separazione tra pagamenti one-off e subscription
   - ✅ Gestione eventi Stripe completa

3. **Funzionalità Implementate**
   - ✅ Creazione sessioni checkout
   - ✅ Gestione portal Stripe
   - ✅ Cancellazione abbonamenti
   - ✅ Gestione invoice e payment failures

### ⚠️ **Problemi Critici Identificati**

#### 1. **Configurazione Inconsistente per Environment**

**Problema**: Alcuni webhook non utilizzano correttamente le variabili d'ambiente.

**File Affetti**:

- `app/api/stripe/webhook/subscription/route.ts`
- `app/api/stripe/webhook/one-off/route.ts`

**Soluzione Applicata**:

```typescript
// Prima (problematico)
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Dopo (corretto)
const supabase = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey);
```

#### 2. **Mappa Price ID Incompleta**

**Problema**: I webhook non riconoscevano i price ID di development.

**Prima**:

```typescript
const PRICE_ID_TO_PLAN: Record<string, string> = {
  price_1RM5g3JIJDFQQRJ08tJCEcVM: "pro",
  price_1RM5gnJIJDFQQRJ0MpzocQBe: "ultra",
};
```

**Dopo (Corretto)**:

```typescript
const PRICE_ID_TO_PLAN: Record<string, string> = {
  // Production Price IDs
  price_1RM5g3JIJDFQQRJ08tJCEcVM: "pro",
  price_1RM5gnJIJDFQQRJ0MpzocQBe: "ultra",

  // Development Price IDs
  price_1RayGcRXT8zipkHSQ6e58rEa: "pro",
  price_1RayHNRXT8zipkHSVsRWGFt9: "ultra",
  price_1RayI5RXT8zipkHSFVT9I6TH: "basic_idea",
  // ... tutti gli altri price ID di development
};
```

#### 3. **Problemi Potenziali con URL Base**

**Problema**: Referenze a `NEXT_PUBLIC_BASE_URL_TEST` che potrebbe non essere configurato.

**Ubicazione**: `app/api/stripe/webhook/route.ts:10`

## 🔧 **Variabili d'Ambiente Richieste**

### Development (.env.local)

```bash
# Stripe Development
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...

# Base URLs
NEXT_PUBLIC_BASE_URL_TEST=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Development (opzionale)
NEXT_PUBLIC_SUPABASE_URL_TEST=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY_TEST=your-service-role-key

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Price IDs (già configurati in constants.ts)
STRIPE_PRO_PLAN_PRICE_ID=price_prod_...
STRIPE_ULTRA_PLAN_PRICE_ID=price_prod_...
# ... altri price ID di produzione
```

### Production (.env)

```bash
# Stripe Production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URLs
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Price IDs Production
STRIPE_PRO_PLAN_PRICE_ID=price_prod_...
STRIPE_ULTRA_PLAN_PRICE_ID=price_prod_...
```

## 🧪 **Test e Verifica**

### 1. **Test Locale (Development)**

```bash
# 1. Avvia Stripe CLI per i webhook
npm run stripe
# oppure
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 2. Testa checkout session
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_1RayGcRXT8zipkHSQ6e58rEa","plan":"pro","userId":"test-user-id"}'

# 3. Verifica webhook
# Crea un pagamento di test e controlla i log del server
```

### 2. **Test Production**

```bash
# 1. Configura webhook endpoint in Stripe Dashboard:
#    URL: https://yourdomain.com/api/stripe/webhook
#    Eventi: customer.subscription.*, invoice.*, checkout.session.completed

# 2. Testa con pagamento reale in modalità test
# 3. Monitora i log dell'applicazione
```

## 🔒 **Sicurezza e Best Practices**

### ✅ **Già Implementato**

- ✅ Verifica firma webhook
- ✅ Logging dettagliato per debugging
- ✅ Gestione errori appropriata
- ✅ Idempotenza per prevenire duplicati

### 🔧 **Raccomandazioni Aggiuntive**

1. **Monitoring**:

   ```typescript
   // Aggiungi monitoring per webhook failures
   if (error) {
     console.error(`Webhook failed: ${event.type}`, {
       eventId: event.id,
       error: error.message,
       timestamp: new Date().toISOString(),
     });
   }
   ```

2. **Rate Limiting**:

   ```typescript
   // Considera l'aggiunta di rate limiting per webhook
   ```

3. **Dead Letter Queue**:
   ```typescript
   // Per webhook che falliscono ripetutamente
   ```

## 📋 **Checklist Pre-Deploy**

### Development ✅

- [x] Stripe CLI configurato
- [x] Webhook endpoint funzionante
- [x] Price ID mappati correttamente
- [x] Test pagamenti completati

### Production 🔄

- [ ] Webhook endpoint configurato in Stripe Dashboard
- [ ] URL di produzione configurati
- [ ] Price ID di produzione configurati
- [ ] SSL certificato valido
- [ ] Monitoring attivo

## 🚨 **Azioni Immediate Richieste**

1. **Aggiorna Constants**: Assicurati che tutti i price ID di produzione siano configurati
2. **Testa Webhook**: Verifica che tutti gli eventi webhook funzionino in entrambi gli ambienti
3. **Configura Monitoring**: Implementa logging centralizzato per i webhook
4. **Documenta Price ID**: Mantieni una lista aggiornata di tutti i price ID

## 🔗 **Script Utili**

### Test Webhook Locale

```bash
#!/bin/bash
# test-webhook.sh
stripe trigger checkout.session.completed --add metadata:user_id=test-user --add metadata:plan=pro
```

### Verifica Configurazione

```typescript
// utils/stripe/verify-config.ts
export function verifyStripeConfig() {
  const requiredVars =
    process.env.NODE_ENV === "development"
      ? ["STRIPE_SECRET_KEY_TEST", "STRIPE_WEBHOOK_SECRET_TEST"]
      : ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"];

  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}
```
