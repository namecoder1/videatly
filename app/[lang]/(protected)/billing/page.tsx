'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { Payment, ProfileData } from '@/types/types'
import CustomIcon from '@/components/ui/custom-icon'
import { Check, Clock, ExternalLink, OctagonX, ShoppingBag, Wallet } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Loader from '@/components/blocks/loader'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useDictionary } from '@/app/context/dictionary-context'
import { constants } from '@/constants'
import { createStripeCheckoutSession } from '@/utils/stripe/createCheckoutSession'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'

const SUBSCRIPTION_PRICE_IDS = {
  pro: constants.paymentLinks.proPlan,
  ultra: constants.paymentLinks.ultraPlan,
}

const BillingPage = () => {
  const dict = useDictionary()
  const [payments, setPayments] = useState<any[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const router = useRouter()

  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        const supabase = createClient()
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('User not found:', userError)
          setError('User not found')
          setLoading(false)
          return
        }
        setUser(user)

        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', user.id)
          .single()

        if (userDataError) {
          console.error('Error fetching user data:', userDataError)
          setError('Error fetching user data')
          setLoading(false)
          return
        }

        setUserData(userData)

        // Recupera le notifiche di pagamento fallito
        const { data: notifications, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'payment_failed')
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(1)

        if (notificationsError) {
          console.error('Error fetching notifications:', notificationsError)
        } else if (notifications && notifications.length > 0) {
          setCheckoutError('Your last payment failed. Please update your payment method to continue using the service.')
        }

        const { data: payments, error: paymentsError } = await supabase
          .from('invoices')
          .select('*')
          .eq('auth_user_id', user.id)

        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError)
          setError('Error fetching payments')
          setLoading(false)
          return
        }

        setPayments(payments)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handlePlanChange = async (targetPlan: 'free' | 'pro' | 'ultra') => {
    if (!userData?.auth_user_id) {
      setCheckoutError('User ID non disponibile. Riprova dopo il login.');
      return;
    }

    setCheckoutLoading(true)
    setCheckoutError(null)

    try {
      const supabase = createClient()
      
      // Upgrade immediato da pro a ultra
      if (userData.subscription === 'pro' && targetPlan === 'ultra') {
        // Checkout Stripe per upgrade immediato con prorating
        const url = await createStripeCheckoutSession({
          userId: userData.auth_user_id,
          priceId: SUBSCRIPTION_PRICE_IDS['ultra'],
          plan: 'ultra',
        })
        window.location.href = url
        return
      }

      // Downgrade o altri cambi piano
      if (
        (userData.subscription === 'ultra' && ['pro', 'free'].includes(targetPlan)) ||
        (userData.subscription === 'pro' && targetPlan === 'free')
      ) {
        // Usa il portal per il downgrade
        const response = await fetch('/api/create-portal-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.auth_user_id }),
        });
        const data = await response.json();
        window.location.href = data.url;
        return;
      }

      // Upgrade da free a pro/ultra
      if (userData.subscription === 'free' && ['pro', 'ultra'].includes(targetPlan)) {
        const url = await createStripeCheckoutSession({
          userId: userData.auth_user_id,
          priceId: SUBSCRIPTION_PRICE_IDS[targetPlan as 'pro' | 'ultra'],
          plan: targetPlan,
        })
        window.location.href = url
        return
      }
    } catch (err: any) {
      console.error('Plan change error:', err)
      setCheckoutError(err.message || 'An error occurred while changing your plan')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!userData?.auth_user_id) {
      setCheckoutError('User ID non disponibile. Riprova dopo il login.');
      return;
    }
    setPortalLoading(true)
    setCheckoutError(null)
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.auth_user_id,
        }),
      })
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      window.location.href = data.url
    } catch (err: any) {
      console.error('Portal session error:', err)
      setCheckoutError(err.message || 'An error occurred while accessing the customer portal')
    } finally {
      setPortalLoading(false)
    }
  }

  const handleTestExpiration = async () => {
    if (!userData?.auth_user_id) return
    
    setTestLoading(true)
    try {
      const response = await fetch('/api/test/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`
        },
        body: JSON.stringify({
          userId: userData.auth_user_id
        })
      })
      
      const result = await response.json()
      if (result.error) {
        throw new Error(result.error)
      }
      
      // Ricarica i dati dell'utente
      router.refresh()
    } catch (err: any) {
      console.error('Test error:', err)
    } finally {
      setTestLoading(false)
    }
  }

  // Funzione per downgrade a free (cancella rinnovo automatico)
  const handleFreeDowngrade = async () => {
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      const response = await fetch('/api/cancel-renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData?.auth_user_id }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      router.refresh();
    } catch (err: any) {
      setCheckoutError(err.message || 'Errore durante il downgrade');
    } finally {
      setCheckoutLoading(false);
    }
  }

  const calculateSubscriptionProgress = () => {
    if (!userData?.subscription_end) {
      console.log('No subscription end date found');
      return 0;
    }
    
    const endDate = new Date(userData.subscription_end);
    const now = new Date();
    
    // Per test: aggiungiamo un giorno alla data corrente
    const date = new Date(now);
    
    console.log('Subscription end date:', endDate);
    console.log('Current date:', now);
    console.log('Test date (tomorrow):', date);
    
    // Se la data di fine è nel passato, mostra 100%
    if (endDate < now) {
      console.log('End date is in the past');
      return 100;
    }

    // Usa la data di inizio effettiva dell'abbonamento
    const startDateStr = userData.subscription_start || userData.created_at;
    if (!startDateStr) {
      console.log('No start date found');
      return 0;
    }
    
    const startDate = new Date(startDateStr);
    console.log('Actual start date:', startDate);
    
    // Se la data di inizio è nel futuro, mostra 0%
    if (startDate > now) {
      console.log('Start date is in the future');
      return 0;
    }
    
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    // Usa testDate invece di now per simulare il giorno successivo
    const daysPassed = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('Days passed:', daysPassed);
    console.log('Total days:', totalDays);
    
    const progress = Math.min(Math.round((daysPassed / totalDays) * 100), 100);
    console.log('Calculated progress:', progress);
    
    return progress;
  };

  if (loading) {
    return <Loader position='full' />
  }

  // Mostra messaggio di downgrade programmato
  const getPlanLabel = (plan: string) => {
    if (plan === 'pro') return 'Pro';
    if (plan === 'ultra') return 'Ultra';
    if (plan === 'free') return 'Free';
    return plan;
  }

  return (
    <section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<Wallet />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>Billing</h1>
        </div>
        <Separator className='my-4' />
      </div>

      {userData?.subscription_status === 'payment_failed' && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
          <h3 className="text-sm font-bold text-red-800 mb-2">Payment Failed</h3>
          <p className="text-sm text-red-700 mb-2">
            Your last payment attempt failed. Please update your payment method to continue using the service.
          </p>
          <Button 
            variant="outline" 
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="text-red-800 border-red-300 hover:bg-red-100"
          >
            {portalLoading ? 'Loading...' : 'Update Payment Method'}
          </Button>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-fit w-full'>  
        <div className='h-fit w-full col-span-1 lg:col-span-2 gap-6 flex flex-col'>
          {userData?.subscription !== 'free' ? (
            <Card className='col-span-1 lg:col-span-2 h-fit'>
              <CardHeader className='flex flex-row items-center gap-5 py-4 px-6'>
                <CardTitle className='flex flex-row items-center gap-2'>
                  <Clock size={40} />
                </CardTitle>
                <CardDescription className='flex flex-col gap-1 w-full pb-2'>
                  {userData?.subscription_renewal === false ? (
                    <>
                      <h3 className='text-sm font-bold text-black'>
                        Your subscription will end on {userData?.subscription_end ? new Date(userData.subscription_end).toLocaleDateString() : 'N/A'}
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {userData?.pending_subscription && userData?.pending_subscription !== userData?.subscription
                          ? <>
                              You will be <b>downgraded to the {getPlanLabel(userData.pending_subscription)} plan</b> at the end of the current period.
                            </>
                          : 'Your subscription will not be renewed at the end of the current period.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className='text-sm font-bold text-black'>
                        Your subscription ends in {userData?.subscription_end ?
                          Math.ceil((new Date(userData.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : 'N/A'} days
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {userData?.pending_subscription && userData?.pending_subscription !== userData?.subscription
                          ? <>
                              The plan will be automatically renewed on <span className='font-bold'>
                                {userData?.subscription_end ? new Date(userData.subscription_end).toLocaleDateString() : 'N/A'}
                              </span>.<br />
                              <span className='text-yellow-800 font-bold'>You will be downgraded to the {getPlanLabel(userData.pending_subscription)} plan at the end of the current period.</span>
                            </>
                          : <>
                              The plan will be automatically renewed on <span className='font-bold'>
                                {userData?.subscription_end ? new Date(userData.subscription_end).toLocaleDateString() : 'N/A'}
                              </span>.
                            </>
                        }
                      </p>
                    </>
                  )}
                  <Progress value={calculateSubscriptionProgress()} className='mt-2' />
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card className='col-span-1 lg:col-span-2 h-fit'>
              <CardHeader className='flex flex-col items-center gap-2 p-6'>
                <OctagonX size={32} />
                <div className='flex flex-col items-center gap-1'>
                  <p className='text-lg font-bold'>You dont have an active paid subscription</p>
                  <p className='text-sm text-muted-foreground'>You can upgrade to a paid subscription to get access to all features</p>
                </div>
              </CardHeader>
            </Card>  
          )}
          <Card>
            <CardHeader>
              <CardTitle>
                <p>Your invoices</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-muted-foreground/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Amount</th>
                        <th className="px-3 py-2 text-left font-semibold">Currency</th>
                        <th className="px-3 py-2 text-left font-semibold">Email</th>
                        <th className="px-3 py-2 text-left font-semibold">Product</th>
                        <th className="px-3 py-2 text-left font-semibold">Status</th>
                        <th className="px-3 py-2 text-left font-semibold">Date</th>
                        <th className="px-3 py-2 text-left font-semibold">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, idx) => (
                        <tr key={payment.id} className={
                          `border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-muted/100'} hover:bg-primary/5 transition-colors`
                        }>
                          <td className="px-3 py-2 font-mono">€{(payment.amount / 100).toFixed(2)}</td>
                          <td className="px-3 py-2 uppercase">{payment.currency}</td>
                          <td className="px-3 py-2 truncate max-w-[160px]" title={payment.email}>{payment.email}</td>
                          <td className="px-3 py-2 capitalize">{payment.product === 'ideas' ? 'Idea Tokens' : payment.product === 'scripts' ? 'Script Tokens' : `${payment.product} Plan`}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{payment.status}</span>
                          </td>
                          <td className="px-3 py-2">{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-2">{payment.metadata?.type === 'subscription' ? 'Subscription' : 'Tokens'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>You have no invoices</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className='h-fit'>
          <CardHeader className='flex flex-col items-start gap-2 py-4 px-6'>
            <CardTitle className='flex flex-row items-center gap-2 uppercase text-sm font-bold'>Your plan</CardTitle>
            <CardDescription className='flex flex-row items-center gap-4 w-full'>
              <ShoppingBag size={48} className='text-primary' />
              <div className='flex flex-col flex-1'>
                <p className='text-lg font-bold capitalize text-black'>{userData?.subscription} Plan</p>
                <p className='text-sm flex flex-row items-center gap-1 text-primary/70'>
                  {userData?.subscription === 'free' ? 'For starters' : userData?.subscription === 'pro' ? 'For Youtubers' : 'For Professionals'}
                </p>
              </div>
              <p className='ml-auto text-lg font-bold text-black'>{dict.currency}{userData?.subscription === 'free' ? '0' : userData?.subscription === 'pro' ? '14.99' : '29.99'}</p>
            </CardDescription>
          </CardHeader>
          <CardContent className='mt-2'>
            <p>You can manage your subscription and payment methods through the Stripe Customer Portal.</p>
            <Button 
              className='mt-4'
              onClick={handleManageSubscription}
              disabled={portalLoading || userData?.subscription === 'free'}
            >
              {portalLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10'>
        <Plan 
          name='Free' 
          price={0} 
          description='For Starters' 
          features={['2500 idea tokens', '5000 script tokens', 'Analisi di Base']} 
          action={userData?.subscription === 'free' ? 'Current Plan' : (userData?.subscription === 'pro' || userData?.subscription === 'ultra' ? 'Downgrade' : 'Downgrade')} 
          period='month' 
          onCheckout={() => handlePlanChange('free')} 
          loading={checkoutLoading} 
          userData={userData}
          handleManageSubscription={handleManageSubscription}
          handleFreeDowngrade={handleFreeDowngrade}
        />
        <Plan 
          name='Pro' 
          price={14.99} 
          description='For Youtubers' 
          features={['2500 idea tokens', '5000 script tokens', 'Analisi di Base']} 
          action={userData?.subscription === 'pro' ? 'Current Plan' : userData?.subscription === 'free' ? 'Upgrade' : 'Downgrade'} 
          period='month' 
          onCheckout={() => handlePlanChange('pro')} 
          loading={checkoutLoading} 
          userData={userData}
          handleManageSubscription={handleManageSubscription}
          handleFreeDowngrade={handleFreeDowngrade}
        />
        <Plan 
          name='Ultra' 
          price={29.99} 
          description='For Professionals' 
          features={['2500 idea tokens', '5000 script tokens', 'Analisi di Base']} 
          action={userData?.subscription === 'ultra' ? 'Current Plan' : 'Upgrade'} 
          period='month' 
          onCheckout={() => handlePlanChange('ultra')} 
          loading={checkoutLoading} 
          userData={userData}
          handleManageSubscription={handleManageSubscription}
          handleFreeDowngrade={handleFreeDowngrade}
        />
      </div>
      {process.env.NODE_ENV === 'development' && userData?.subscription !== 'free' && (
        <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-bold text-yellow-800 mb-2">Test Subscription Expiration</h3>
          <p className="text-sm text-yellow-700 mb-2">
            This button will simulate subscription expiration by setting the end date to 1 minute ago.
            Only visible in development environment.
          </p>
          <Button 
            variant="outline" 
            onClick={handleTestExpiration}
            disabled={testLoading}
            className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
          >
            {testLoading ? 'Testing...' : 'Test Expiration'}
          </Button>
        </div>
      )}
      {checkoutError && <div className='text-red-500 mt-2'>{checkoutError}</div>}
    </section>
  )
}

const Plan = ({ name, price, description, features, action, period, onCheckout, loading, userData, handleManageSubscription, handleFreeDowngrade }: { name: string, price: number, description: string, features: string[], action: string, period: string, onCheckout?: () => void, loading?: boolean, userData: ProfileData | null, handleManageSubscription: () => void, handleFreeDowngrade: () => void }) => {
  const getButtonText = () => {
    if (action === 'Current Plan') {
      return 'Current Plan'
    }
    if (name.toLowerCase() === 'free' && userData && (userData.subscription === 'pro' || userData.subscription === 'ultra')) {
      return 'Downgrade'
    }
    return action
  }

  const handleClick = () => {
    if (name.toLowerCase() === 'free' && (userData?.subscription === 'pro' || userData?.subscription === 'ultra')) {
      handleFreeDowngrade();
      return;
    }
    if (userData && userData.subscription === 'pro' && name.toLowerCase() === 'ultra') {
      handleManageSubscription();
      return;
    }
    if (onCheckout) {
      onCheckout();
    }
  }

  return (
    <Card className='w-full p-6 flex flex-col justify-between'>
      <div className="mb-6 sm:mb-8">
        <div className='flex flex-row items-center gap-2 justify-between'>
          <h3 className="text-xl sm:text-2xl font-bold">{name} Plan</h3>
          {userData?.pending_subscription && userData?.pending_subscription !== userData?.subscription && name.toLowerCase() === userData.pending_subscription && (
            <span className='text-sm text-muted-foreground max-w-[90px] text-right'>
              Next plan after renewal
            </span>
          )}
        </div>
        <div className="mt-3 sm:mt-4 flex items-baseline">
          <span className="text-4xl sm:text-5xl font-bold tracking-tight">{price}</span>
          <span className="ml-2 text-zinc-500">/{period}</span>
        </div>
        <p className="text-zinc-600 mt-3 sm:mt-4">{description}</p>
      </div>
      
      <ul className="space-y-3 sm:space-y-4 flex-1 mb-6 sm:mb-8">
        {features.map((feature: string) => (
          <li key={feature} className="flex items-center gap-3 text-zinc-700">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <form className='p-1 space-y-2'>
        <Button
          type='button'
          variant={action === 'Current Plan' ? 'outline' : 'default'}
          className="w-full py-5 sm:py-6 text-base sm:text-lg font-medium"
          size="lg"
          onClick={handleClick}
          disabled={loading || action === 'Current Plan'}
        >
          {loading ? 'Loading...' : getButtonText()}
        </Button>
      </form>
    </Card>
  )
}

export default BillingPage