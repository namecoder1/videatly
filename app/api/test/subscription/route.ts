import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import stripe from '@/utils/stripe/stripe'

export async function POST(req: NextRequest) {
  // Verifica il secret per sicurezza
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    // Prima verifica che l'utente esista e abbia un abbonamento attivo
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Current user state:', user)

    if (user.subscription === 'free') {
      return NextResponse.json({ error: 'User already has free subscription' }, { status: 400 })
    }

    // Trova il customer Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    if (customers.data.length > 0) {
      const customer = customers.data[0]
      
      // Trova l'abbonamento attivo del customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      })

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0]
        
        // Cancella l'abbonamento immediatamente
        await stripe.subscriptions.cancel(subscription.id)
        console.log('Stripe subscription cancelled:', subscription.id)
      }
    }

    // Imposta la data di scadenza a 1 minuto fa
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    
    // Aggiorna l'utente
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        subscription_end: oneMinuteAgo,
        subscription_renewal: false,
        subscription_status: 'canceled'
      })
      .eq('auth_user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating subscription:', updateError)
      return NextResponse.json({ error: 'Error updating subscription' }, { status: 500 })
    }

    console.log('User after first update:', updatedUser)

    // Esegui il check delle sottoscrizioni
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/check-subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error checking subscriptions')
    }

    const result = await response.json()
    console.log('Check subscriptions result:', result)

    // Verifica che l'utente sia stato effettivamente downgradato
    const { data: finalUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', userId)
      .single()

    if (checkError || !finalUser) {
      return NextResponse.json({ error: 'Error verifying update' }, { status: 500 })
    }

    console.log('Final user state:', finalUser)

    // Se l'utente non è stato downgradato, prova a forzare l'aggiornamento
    if (finalUser.subscription !== 'free') {
      console.log('Forcing subscription update to free...')
      const { data: forcedUpdate, error: forceError } = await supabase
        .from('users')
        .update({
          subscription: 'free',
          subscription_status: 'canceled',
          subscription_start: null,
          subscription_end: null,
          subscription_renewal: false,
        })
        .eq('auth_user_id', userId)
        .select()
        .single()

      if (forceError) {
        console.error('Error forcing update:', forceError)
      } else {
        console.log('Forced update result:', forcedUpdate)
      }
    }

    return NextResponse.json({ 
      success: true,
      testResult: result,
      userBefore: user,
      userAfter: finalUser
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
} 