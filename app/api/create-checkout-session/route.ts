import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import stripe from '@/utils/stripe/stripe'

export async function POST(req: NextRequest) {
  const { priceId, tokens, tool, userId, plan } = await req.json()

  const supabase = await createClient()
  let user = null

  // Recupera user da Supabase se non passato direttamente
  if (userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
    if (error || !data) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }
    user = { ...data, id: userId, email: data.email }
  } else {
    const { data: { user: supaUser }, error: userError } = await supabase.auth.getUser()
    if (userError || !supaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }
    user = supaUser
  }

  // Distingui tra acquisto token e subscription
  const isSubscription = !tokens && !tool && !!plan

  if (!user || !priceId) {
    return NextResponse.json({ error: 'Dati mancanti per la creazione della sessione Stripe' }, { status: 400 })
  }

  if (!isSubscription && (!tokens || !tool)) {
    return NextResponse.json({ error: 'Dati mancanti per la creazione della sessione Stripe (token)' }, { status: 400 })
  }

  try {
    // First, create or retrieve a customer
    let customer;
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
    }

    // Per acquisti di token, verifica se esiste già una sessione attiva
    if (!isSubscription) {
      const activeSessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        status: 'open',
        limit: 1
      });

      if (activeSessions.data.length > 0) {
        // Se esiste una sessione attiva, restituisci quella invece di crearne una nuova
        return NextResponse.json({ url: activeSessions.data[0].url });
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: isSubscription ? 'subscription' : 'payment',
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?canceled=1`,
      metadata: {
        user_id: user.id,
        ...(isSubscription ? { plan } : { 
          tokens: tokens?.toString(), 
          tool,
          price_id: priceId 
        }),
      },
      // Aggiungi idempotency key per pagamenti token
      ...(isSubscription ? {} : {
        payment_intent_data: {
          metadata: {
            idempotency_key: `${user.id}_${tool}_${tokens}_${Date.now()}`
          }
        }
      })
    })

    console.log('Created checkout session:', {
      session_id: session.id,
      mode: session.mode,
      metadata: session.metadata,
      customer: session.customer,
      payment_intent: session.payment_intent
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Errore creazione sessione Stripe:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
