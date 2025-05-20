import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import stripe from '@/utils/stripe/stripe'

export async function POST(req: NextRequest) {
  // Verifica il secret per sicurezza
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    // Trova tutti gli utenti con abbonamenti scaduti o non rinnovati
    const now = new Date().toISOString()
    console.log('Checking subscriptions before:', now)

    const { data: expiredSubscriptions, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .or(`subscription_end.lt.${now},and(subscription_renewal.eq.false,subscription_status.eq.canceled)`)
      .neq('subscription', 'free') // Esclude già gli utenti free

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError)
      return NextResponse.json({ error: 'Error fetching expired subscriptions' }, { status: 500 })
    }

    console.log('Found expired subscriptions:', expiredSubscriptions)

    const results = []

    // Aggiorna gli utenti con abbonamenti scaduti
    for (const user of expiredSubscriptions || []) {
      console.log('Processing user:', user.auth_user_id)
      
      // Prima verifica se l'utente ha ancora un abbonamento attivo
      const { data: currentUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.auth_user_id)
        .single()

      if (checkError) {
        console.error('Error checking current user state:', checkError)
        continue
      }

      console.log('Current user state:', currentUser)

      // Se l'utente ha già un abbonamento free, salta
      if (currentUser.subscription === 'free') {
        console.log('User already has free subscription, skipping')
        continue
      }

      // Se c'è un pending_subscription
      if (currentUser.pending_subscription) {
        if (currentUser.pending_subscription === 'free') {
          // Trova e cancella l'abbonamento Stripe se esiste
          const customers = await stripe.customers.list({
            email: currentUser.email,
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

          // Aggiorna l'utente a free
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
              subscription: 'free',
              subscription_status: 'canceled',
              subscription_start: null,
              subscription_end: null,
              subscription_renewal: false,
              pending_subscription: null,
            })
            .eq('auth_user_id', user.auth_user_id)
            .select()
            .single()

          if (updateError) {
            console.error(`Error updating user ${user.auth_user_id}:`, updateError)
            results.push({
              userId: user.auth_user_id,
              success: false,
              error: updateError.message
            })
          } else {
            console.log('User updated successfully:', updatedUser)
            results.push({
              userId: user.auth_user_id,
              success: true,
              before: currentUser,
              after: updatedUser
            })
          }
        } else {
          // Downgrade a un piano pagato (es. Ultra -> Pro)
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
              subscription: currentUser.pending_subscription,
              pending_subscription: null,
            })
            .eq('auth_user_id', user.auth_user_id)
            .select()
            .single()

          if (updateError) {
            console.error(`Error updating user ${user.auth_user_id}:`, updateError)
            results.push({
              userId: user.auth_user_id,
              success: false,
              error: updateError.message
            })
          } else {
            console.log('User downgraded successfully:', updatedUser)
            results.push({
              userId: user.auth_user_id,
              success: true,
              before: currentUser,
              after: updatedUser
            })
          }
        }
        continue
      }

      // Trova e cancella l'abbonamento Stripe se esiste
      const customers = await stripe.customers.list({
        email: currentUser.email,
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

      // Aggiorna l'utente
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          subscription: 'free',
          subscription_status: 'canceled',
          subscription_start: null,
          subscription_end: null,
          subscription_renewal: false,
        })
        .eq('auth_user_id', user.auth_user_id)
        .select()
        .single()

      if (updateError) {
        console.error(`Error updating user ${user.auth_user_id}:`, updateError)
        results.push({
          userId: user.auth_user_id,
          success: false,
          error: updateError.message
        })
      } else {
        console.log('User updated successfully:', updatedUser)
        results.push({
          userId: user.auth_user_id,
          success: true,
          before: currentUser,
          after: updatedUser
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated: expiredSubscriptions?.length || 0,
      results
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
} 