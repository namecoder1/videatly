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
import Pricing from '@/components/blocks/(public)/pricing'
import { signInWithGoogleAction } from '@/app/(authentication)/actions'

const BillingPage = () => {
  const dict = useDictionary()
  const [payments, setPayments] = useState<any[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  
  if (loading) {
    return <Loader position='full' />
  }

  console.log(payments)

  return (
    <section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<Wallet />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>Billing</h1>
        </div>
        <Separator className='my-4' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-fit w-full'>  
        <div className='h-fit w-full col-span-1 lg:col-span-2 gap-6 flex flex-col'>
          {userData?.subscription !== 'free' ? (
            <Card className='col-span-1 lg:col-span-2 h-fit'>
              <CardHeader className='flex flex-row items-center gap-4 py-4 px-6'>
                <CardTitle className='flex flex-row items-center gap-2'>
                  <Clock size={32} />
                </CardTitle>
                <CardDescription className='flex flex-col gap-1 w-full pb-2'>
                  <h3 className='text-sm font-bold text-black'>You subscription ends in 10 days</h3>
                  <p className='text-sm text-muted-foreground'>The plan will be automatically renewed on <span className='font-bold'>10/06/2025</span></p>
                  <div className='bg-red-300 w-full h-2 rounded-md mt-2' />
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
                    <thead className="bg-muted sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Amount</th>
                        <th className="px-3 py-2 text-left font-semibold">Currency</th>
                        <th className="px-3 py-2 text-left font-semibold">Email</th>
                        <th className="px-3 py-2 text-left font-semibold">Product</th>
                        <th className="px-3 py-2 text-left font-semibold">Status</th>
                        <th className="px-3 py-2 text-left font-semibold">Date</th>
                        <th className="px-3 py-2 text-left font-semibold">Tokens</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, idx) => (
                        <tr key={payment.id} className={
                          `border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-muted/50'} hover:bg-primary/5 transition-colors`
                        }>
                          <td className="px-3 py-2 font-mono">€{(payment.amount / 100).toFixed(2)}</td>
                          <td className="px-3 py-2 uppercase">{payment.currency}</td>
                          <td className="px-3 py-2 truncate max-w-[160px]" title={payment.email}>{payment.email}</td>
                          <td className="px-3 py-2 capitalize">{payment.product}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{payment.status}</span>
                          </td>
                          <td className="px-3 py-2">{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-2">{payment.metadata?.tokens}</td>
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
                <Link href='/billing/upgrade' className='text-sm flex flex-row items-center gap-1 text-primary/70 hover:underline underline-offset-2'>
                  View plan details   <ExternalLink size={14} />
                </Link>
              </div>
              <p className='ml-auto text-lg font-bold text-black'>{dict.currency}{userData?.subscription === 'free' ? '0' : userData?.subscription === 'pro' ? '14.99' : '29.99'}</p>
            </CardDescription>
          </CardHeader>
          <CardContent className='mt-2'>
            <p>You can change your plan at any time. To change your plan, click the button below.</p>
            <Button className='mt-4'>
              <Link href='/billing/upgrade'>
                Upgrade plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10'>
        <Plan name='Free' price={0} description='For Starters' features={['2500 idea tokens', '5000 script tokens', 'Analisi di Base']} action={userData?.subscription === 'free' ? 'Manage' : userData?.subscription === 'pro' ? 'Downgrade' : 'Upgrade'} period='month' />
        <Plan name='Pro' price={14.99} description='For Youtubers' features={['2500 idea tokens', '5000 script tokens', 'Analisi di Base']} action={userData?.subscription === 'pro' ? 'Manage' : userData?.subscription === 'free' ? 'Upgrade' : 'Downgrade'} period='month' />
        <Plan name='Ultra' price={29.99} description='For Professionals' features={['2500 idea tokens', '5000 script tokens', 'Analisi di Base']} action={userData?.subscription === 'ultra' ? 'Manage' : userData?.subscription === 'free' ? 'Upgrade' : 'Downgrade'} period='month' />
      </div>
    </section>
  )
}

const Plan = ({ name, price, description, features, action, period }: { name: string, price: number, description: string, features: string[], action: string, period: string }) => {
  return (
    <Card className='w-full p-6'>
      <div className="mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold">{name} Plan</h3>
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
        {name === 'Free' ? (
          <Button
            type='submit' 
            formAction={signInWithGoogleAction}
            className="w-full py-5 sm:py-6 text-base sm:text-lg font-medium"
            size="lg"
        >
          <div className='flex items-center gap-2'>
            {action}
          </div>
        </Button>
        ) : (
          <Button
            type='submit' 
            className="w-full py-5 sm:py-6 text-base sm:text-lg font-medium"

            size="lg"
          >
            {action}
          </Button>
        )}
      </form>
    </Card>
  )
}

export default BillingPage