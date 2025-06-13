import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import stripe from '@/utils/stripe/stripe'

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const supabase = await createClient();
  // Recupera l'utente
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', userId)
    .single();
  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  // Trova il customer Stripe
  const customers = await stripe.customers.list({
    email: user.email,
    limit: 1
  });
  if (customers.data.length === 0) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
  }
  const customer = customers.data[0];
  // Trova la subscription attiva
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: 'active',
    limit: 1
  });
  if (subscriptions.data.length === 0) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }
  const subscription = subscriptions.data[0];
  // Se la subscription ha una schedule (renewal programmata), aggiorna la schedule
  if (subscription.schedule) {
    const schedule = await stripe.subscriptionSchedules.retrieve(subscription.schedule as string);
    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: 'cancel'
    });
  } else {
    // Imposta cancel_at_period_end: true normalmente
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });
  }
  console.log('pre update')
  // Aggiorna pending_subscription e subscription_renewal su Supabase
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      pending_subscription: 'free',
      subscription_renewal: false
    })
    .eq('auth_user_id', userId)
    .select()
    .single();
  console.log('post update - updated user:', updatedUser)
  console.log('post update - error:', updateError)
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, updatedUser });
} 