export async function createStripeCheckoutSession({ userId, priceId, plan }: { userId: string, priceId: string, plan: string }) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      priceId,
      plan,
      // puoi aggiungere altri metadata se necessario
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Errore creazione sessione Stripe')
  return data.url // URL di checkout Stripe
} 