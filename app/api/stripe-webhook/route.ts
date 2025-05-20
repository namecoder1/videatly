import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/utils/stripe/stripe'
import { Stripe } from 'stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Usa la service_role key per il client Supabase solo qui!
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  console.log('--- Stripe Webhook Received ---')
  let rawBody
  try {
    rawBody = await req.text()
    console.log('Raw body length:', rawBody.length)
  } catch (err) {
    console.error('Errore lettura raw body:', err)
    return NextResponse.json({ error: 'Errore lettura raw body' }, { status: 400 })
  }
  const sig = req.headers.get('stripe-signature')
  console.log('Webhook secret (inizio):', endpointSecret?.slice(0, 8) + '...')
  console.log('Stripe signature header:', sig)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret)
    console.log('Evento Stripe ricevuto:', event.type)
  } catch (err) {
    console.error('Errore firma Stripe:', err)
    console.error('Raw body:', rawBody)
    console.error('Signature:', sig)
    return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 })
  }

  // Gestione evento checkout.session.completed (pagamento completato)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('Session metadata:', session.metadata)
    const user_id = session.metadata?.user_id
    const tokens = Number(session.metadata?.tokens)
    const tool = session.metadata?.tool
    const stripe_id = session.id
    console.log(`stripe Id ${stripe_id}`)
    let email = session.customer_email
    const amount = session.amount_total // in centesimi

    // Recupera email dal customer Stripe se non presente
    if (!email && session.customer) {
      try {
        const customer = await stripe.customers.retrieve(session.customer as string)
        if (typeof customer !== 'string') {
          const typedCustomer = customer as Stripe.Customer;
          email = typedCustomer.email ?? null;
        }
      } catch (err) {
        console.error('Errore recupero customer Stripe:', err)
      }
    }

    // Recupera email da Supabase se ancora non presente
    if (!email && user_id) {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('email')
          .eq('auth_user_id', user_id)
          .single()
        if (user?.email) {
          email = user.email
        }
        if (error) {
          console.error('Errore recupero email da Supabase:', error)
        }
      } catch (err) {
        console.error('Errore query Supabase per email:', err)
      }
    }

    // Controlla che i dati siano presenti
    if (!user_id || !tokens || !tool) {
      console.error('Dati mancanti nei metadata:', { user_id, tokens, tool })
      console.error('Session object:', JSON.stringify(session, null, 2))
      return NextResponse.json({ error: 'Dati mancanti nei metadata' }, { status: 400 })
    }

    // 1. Inserisci il pagamento nella tabella invoices
    const { error: insertError } = await supabase.from('invoices').insert([{
      auth_user_id: user_id,
      email,
      amount: amount ?? null,
      currency: session.currency ?? null,
      product: tool,
      stripe_id: session.id,
      stripe_customer_id: session.customer ?? null,
      stripe_payment_intent_id: session.payment_intent ?? null,
      stripe_subscription_id: null,
      stripe_invoice_id: null,
      status: session.payment_status ?? 'succeeded',
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { tokens, tool },
    }])
    if (insertError) {
      console.error('Errore insert invoices:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    // 2. Aggiorna i token dell'utente
    const { error: rpcError } = await supabase.rpc('increment_paid_tokens', {
      p_user_id: user_id,
      p_tool: tool,
      p_amount: tokens,
    })
    if (rpcError) {
      console.error('Errore increment_paid_tokens:', rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 400 })
    }
    console.log('Pagamento e token aggiornati con successo per user:', user_id)
  } else {
    // Logga tutti gli altri eventi per debug
    console.log('Evento Stripe non gestito:', event.type)
  }

  // Rispondi sempre 200 a Stripe per evitare retry infiniti su eventi non critici
  return NextResponse.json({ received: true })
}