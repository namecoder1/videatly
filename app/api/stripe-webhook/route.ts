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
    const email = session.customer_email
    const amount = session.amount_total // in centesimi

    // Controlla che i dati siano presenti
    if (!user_id || !tokens || !tool) {
      console.error('Dati mancanti nei metadata:', { user_id, tokens, tool })
      console.error('Session object:', JSON.stringify(session, null, 2))
      return NextResponse.json({ error: 'Dati mancanti nei metadata' }, { status: 400 })
    }

    // 1. Inserisci il pagamento
    const { error: insertError } = await supabase.from('stripe_payments').insert([{
      auth_user_id: user_id,
      email,
      amount: amount ? (amount / 100).toString() : null,
      product: tool,
      timestamp: new Date().toISOString(),
      stripe_id,
      created_at: new Date().toISOString(),
    }])
    if (insertError) {
      console.error('Errore insert stripe_payments:', insertError)
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