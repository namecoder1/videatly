# Configurazione Stripe per Produzione

## Problema Risolto

Durante il deploy in produzione, stavano verificandosi due problemi principali:

1. **Tutti i pacchetti aprono sempre il Pro plan** - Causato da price ID vuoti
2. **Errori di calcolo tasse automatiche di Stripe** - Configurazione non compatibile

## Variabili d'Ambiente Richieste

Per far funzionare correttamente il sistema di pagamenti in produzione, devi configurare queste variabili d'ambiente nel tuo provider di hosting (Vercel, Netlify, etc.):

### Price ID per Subscription Plans

```bash
STRIPE_PRO_PLAN_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ULTRA_PLAN_PRICE_ID=price_xxxxxxxxxxxxx
```

### Price ID per Token Buckets - Ideas

```bash
STRIPE_BASIC_IDEA_BUCKET_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_STANDARD_IDEA_BUCKET_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PREMIUM_IDEA_BUCKET_PRICE_ID=price_xxxxxxxxxxxxx
```

### Price ID per Token Buckets - Scripts

```bash
STRIPE_BASIC_SCRIPT_BUCKET_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_STANDARD_SCRIPT_BUCKET_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PREMIUM_SCRIPT_BUCKET_PRICE_ID=price_xxxxxxxxxxxxx
```

### Link di Pagamento (Opzionali)

```bash
STRIPE_BASIC_IDEA_BUCKET_LINK=https://buy.stripe.com/xxxxx
STRIPE_STANDARD_IDEA_BUCKET_LINK=https://buy.stripe.com/xxxxx
STRIPE_PREMIUM_IDEA_BUCKET_LINK=https://buy.stripe.com/xxxxx
STRIPE_BASIC_SCRIPT_BUCKET_LINK=https://buy.stripe.com/xxxxx
STRIPE_STANDARD_SCRIPT_BUCKET_LINK=https://buy.stripe.com/xxxxx
STRIPE_PREMIUM_SCRIPT_BUCKET_LINK=https://buy.stripe.com/xxxxx
```

## Come Ottenere i Price ID

1. **Accedi al Dashboard Stripe** (produzione)
2. **Vai su Prodotti** nel menu laterale
3. **Per ogni prodotto esistente** o **creane di nuovi**:
   - Clicca sul prodotto
   - Copia il **Price ID** (inizia con `price_`)
   - Incolla nelle variabili d'ambiente corrispondenti

## Struttura Prodotti Consigliata in Stripe

### Subscription Plans

- **Pro Plan** - Subscription mensile/annuale
- **Ultra Plan** - Subscription mensile/annuale

### Token Buckets - Ideas

- **Basic Idea Bucket** - 2500 tokens - €9.99
- **Standard Idea Bucket** - 5000 tokens - €19.99
- **Premium Idea Bucket** - 25000 tokens - €34.99

### Token Buckets - Scripts

- **Basic Script Bucket** - 5000 tokens - €14.99
- **Standard Script Bucket** - 15000 tokens - €39.99
- **Premium Script Bucket** - 50000 tokens - €69.99

## Verificare la Configurazione

Dopo aver impostato le variabili d'ambiente:

1. **Controlla i log dell'API**: `/api/stripe/get-price-ids`
2. **Cerca questi messaggi**:
   - ✅ `All Stripe environment variables are configured`
   - ❌ `Missing Stripe environment variables in production`

## Risoluzione Errori Comuni

### Errore: "Price ID non configurato"

- **Causa**: Variabile d'ambiente mancante
- **Soluzione**: Aggiungi la variabile corrispondente

### Errore: "Automatic tax calculation requires valid address"

- **Causa**: Stripe automatic tax abilitato senza configurazione
- **Soluzione**: ✅ Già risolto disabilitando automatic tax

### Tutti i pacchetti aprono il Pro plan

- **Causa**: Price ID vuoti ritornano al fallback
- **Soluzione**: ✅ Configurare tutte le variabili d'ambiente sopra

## Test di Verifica

1. **Vai su `/shop`**
2. **Clicca su diversi pacchetti**
3. **Verifica che si aprano checkout diversi**
4. **Controlla che i prezzi siano corretti**

## Debug

Per debuggare problemi di configurazione:

```bash
# Controlla i logs dell'API
curl https://tuosito.com/api/stripe/get-price-ids

# Dovrebbe restituire tutti i price ID senza errori
```

Se vedi ancora errori, controlla:

1. Le variabili d'ambiente sono state salvate correttamente
2. Il deploy è stato completato dopo aver aggiunto le variabili
3. I price ID esistono effettivamente nel tuo account Stripe di produzione
