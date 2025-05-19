import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import stripe from '@/utils/stripe/stripe'

export async function POST(req: NextRequest) {
  const { priceId, tokens, tool } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Log per debug
  console.log('Ricevuto:', { priceId, tokens, tool, user: user?.id })

  if (!user || !priceId || !tokens || !tool) {
    return NextResponse.json({ error: 'Dati mancanti per la creazione della sessione Stripe' }, { status: 400 })
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

    console.group('Customers: ', customers)
    console.log('Customer: ', customer)
    console.groupEnd()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer: customer.id, // Associate with the customer
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop?canceled=1`,
      metadata: {
        user_id: user.id,
        tokens: tokens.toString(),
        tool,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Errore creazione sessione Stripe:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
