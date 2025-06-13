import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  // Verify authorization
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  if (token !== process.env.NEXT_PUBLIC_CRON_SECRET) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Update user subscription status to payment_failed
  const { error: updateError } = await supabase
    .from('users')
    .update({
      subscription_status: 'payment_failed',
      subscription_renewal: false,
    })
    .eq('auth_user_id', userId)

  if (updateError) {
    console.error('Error updating user subscription:', updateError)
    return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 })
  }

  // Create a notification for the user
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert([{
      auth_user_id: userId,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: 'Your subscription payment has failed. Please update your payment method to continue using the service.',
      created_at: new Date().toISOString(),
      read: false
    }])

  if (notificationError) {
    console.error('Error creating notification:', notificationError)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
} 