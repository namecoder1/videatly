import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/utils/stripe/stripe'

export async function POST(req: NextRequest) {
  const { priceId } = await req.json()
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
  })
  return NextResponse.json({ url: session.url })
}