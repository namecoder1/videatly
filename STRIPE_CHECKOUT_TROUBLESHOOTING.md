# Stripe Checkout Troubleshooting Guide

## Problemi Identificati

Dall'analisi del codice e degli errori 400 visibili nel Network Inspector, ecco i problemi più comuni e le loro soluzioni:

## 1. Verifica Configurazione Variabili d'Ambiente

### Debug Endpoint

Usa questo endpoint per verificare la configurazione in produzione:

```
GET /api/stripe/debug-config?debug_key=YOUR_CRON_SECRET
```

### Variabili d'Ambiente Richieste in Produzione:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PLAN_PRICE_ID=price_...
STRIPE_ULTRA_PLAN_PRICE_ID=price_...
STRIPE_BASIC_IDEA_BUCKET_PRICE_ID=price_...
STRIPE_STANDARD_IDEA_BUCKET_PRICE_ID=price_...
STRIPE_PREMIUM_IDEA_BUCKET_PRICE_ID=price_...
STRIPE_BASIC_SCRIPT_BUCKET_PRICE_ID=price_...
STRIPE_STANDARD_SCRIPT_BUCKET_PRICE_ID=price_...
STRIPE_PREMIUM_SCRIPT_BUCKET_PRICE_ID=price_...
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 2. Errori Comuni e Soluzioni

### Errore: "User not found" (400)

**Causa**: Problemi con l'autenticazione Supabase
**Soluzione**:

- Verifica che l'utente sia correttamente loggato
- Controlla la configurazione Supabase
- Verifica che i cookies di sessione siano validi

### Errore: "Dati mancanti per la creazione della sessione Stripe" (400)

**Causa**: priceId vuoto o mancante
**Soluzione**:

- Verifica che tutte le variabili d'ambiente dei price IDs siano configurate
- Controlla il file `constants.ts` per price IDs hardcoded in development

### Errore: "Invalid price" (500)

**Causa**: Price ID non valido o non esistente in Stripe
**Soluzione**:

- Verifica che i price IDs in Stripe Dashboard corrispondano alle variabili d'ambiente
- Assicurati di usare price IDs live per produzione e test per development

## 3. Checklist di Verifica

### ✅ Configurazione Stripe

- [ ] Stripe Secret Key configurata per l'ambiente corretto
- [ ] Webhook Secret configurata
- [ ] Tutti i Price IDs configurati e validi
- [ ] Stripe Dashboard configurato per l'ambiente corretto (live/test)

### ✅ Configurazione Supabase

- [ ] Configurazione database corretta
- [ ] Politiche RLS (Row Level Security) configurate
- [ ] Tabelle `users`, `tokens`, `invoices` esistenti

### ✅ Variabili d'Ambiente

- [ ] Tutte le variabili d'ambiente configurate nel provider di hosting
- [ ] NEXT_PUBLIC_BASE_URL corretta per l'ambiente
- [ ] Nessuna variabile vuota o undefined

## 4. Debugging in Produzione

### Controlla i Log del Server

Con il logging aggiunto, ora vedrai output dettagliato che include:

- Dati della richiesta ricevuta
- Processo di recupero utente
- Validazione parametri
- Creazione sessione Stripe
- Dettagli degli errori

### Esempio di Log Normale:

```
=== CHECKOUT SESSION CREATION START ===
Request data received: { userId: "...", priceId: "price_...", plan: "pro" }
Parsed parameters: { priceId: "price_...", userId: "...", plan: "pro" }
Starting user retrieval process...
Fetching user by userId: ...
User query result: { data: "USER_FOUND", error: null }
Transaction type: SUBSCRIPTION
Validation passed. Starting Stripe operations...
Created checkout session: { session_id: "cs_...", url: "https://checkout.stripe.com/..." }
=== CHECKOUT SESSION CREATION SUCCESS ===
```

### Log di Errore Tipico:

```
=== CHECKOUT SESSION CREATION ERROR ===
Error details: { message: "No such price: 'price_invalid'", name: "StripeInvalidRequestError" }
Request context: { priceId: "price_invalid", plan: "pro", isSubscription: true }
```

## 5. Azioni Immediate da Fare

1. **Controlla i log del server** per vedere l'errore specifico
2. **Verifica le variabili d'ambiente** usando l'endpoint di debug
3. **Controlla Stripe Dashboard** per confermare che i price IDs esistano
4. **Testa in development** per isolare se è un problema di configurazione di produzione
5. **Verifica l'autenticazione** dell'utente

## 6. Contatti per Supporto

Se i problemi persistono dopo aver seguito questa guida:

- Condividi i log del server (rimuovendo informazioni sensibili)
- Indica quale ambiente stai usando (development/production)
- Specifica quale tipo di checkout stavi tentando (subscription/token purchase)
