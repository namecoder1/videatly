import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/utils/stripe/stripe'
import { Stripe } from 'stripe'

let endpointSecret: string;
let baseUrl: string;

if (process.env.NODE_ENV === "development") {
  endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST!;
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL_TEST!;
} else {
  endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
}


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

  // Route subscription events to subscription handler
  if (event.type.startsWith('customer.subscription.') || 
      (event.type === 'invoice.paid' && typeof (event.data.object as any).subscription === 'string')) {
    console.log('Routing to subscription handler')
    const response = await fetch(`${baseUrl}/api/stripe/webhook/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': sig!
      },
      body: rawBody
    })
    return response
  }

  // Route one-off payment events to one-off handler
  if (event.type === 'checkout.session.completed' || 
      event.type === 'payment_intent.succeeded' || 
      event.type === 'charge.succeeded' ||
      (event.type === 'invoice.paid' && typeof (event.data.object as any).subscription !== 'string')) {
    console.log('Routing to one-off handler')
    const response = await fetch(`${baseUrl}/api/stripe/webhook/one-off`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': sig!
      },
      body: rawBody
    })
    return response
  }

  // --- Altri eventi: logga e ignora ---
  console.log('Evento Stripe non gestito:', event.type)
  return NextResponse.json({ received: true })
}