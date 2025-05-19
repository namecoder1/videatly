'use client'

import { CalendarDaysIcon, Hand, MegaphoneOff } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { Button } from "../ui/button";
import { validateEmail } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";

export default function Cta() {
  const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const [totalUsers, setTotalUsers] = useState(0)
  const router = useRouter()
  const pathname = usePathname();
  const currentLang = pathname.split('/')[1] || 'en';

  const fetchTotalUsers = async () => {
		const supabase = await createClient()
		const { data, error } = await supabase.rpc('get_lead_users_count')
		if (!error && data) {
			setTotalUsers(data)
		}
	}


  const handleSendWelcomeEmail = async ({email}: {email: string}) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email
        }),
      });

    } catch (error) {
      console.error('Errore:', error);
      alert('Errore frontend nell\'invio email.');
    }
  };

  const validateEmailDb = async () => {
		const supabase = await createClient()
		const { data, error } = await supabase.from('lead_users').select('*').eq('email', email)
		if (error) {
			setError('Please enter a valid email address')
			return false
		}
		if (data.length > 0) {
			setError('Email already exists')
			return false
		}
		return true
	}

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!validateEmail(email)) {
			setError('Please enter a valid email address')
			return
		}
		
		const isValid = await validateEmailDb()
		if (!isValid) {
			return
		}
		
		// Submit the email to the database
		const supabase = await createClient()
		
		console.log('Inserting email to database:', email)
		const isPromo = totalUsers < 50
		const { data, error: insertError } = await supabase.from('lead_users').insert([{ 
			email, 
			is_promo: isPromo 
		}]).select()
		
		console.log('Insert result:', data)
		console.log(isPromo ? 'Utente promo' : 'Utente non promo')
		
		if (insertError) {
			setError('Failed to submit your email')
			return
		}
		
		handleSendWelcomeEmail({email: email})
		console.log('email submitted successfully to: ' + email)
		setEmail('')
		setError('')
		fetchTotalUsers() // Refresh the count
		console.log('Redirecting to thank-you page with email:', email)
		router.push(`/${currentLang}/thank-you?email=${encodeURIComponent(email)}`)
	}

  return (
    <div className="relative isolate overflow-hidden bg-red-950 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="text-4xl font-semibold tracking-tight text-white">Join the waitlist</h2>
            <p className="mt-4 text-lg text-gray-300">
              Insert your email to join the waitlist and be the first to know when we launch.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 flex max-w-md gap-x-4">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Input
                id="email-address"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Enter your email"
                autoComplete="email"
                className="bg-gray-100/10 backdrop-blur-sm border-gray-100/40 text-white"
              />
              <Button
                type="submit"
                size="lg"
              >
                Join Now!
              </Button>
            </form >
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                <MegaphoneOff aria-hidden="true" className="size-6 text-white" />
              </div>
              <dt className="mt-4 text-base font-semibold text-white">No spam</dt>
              <dd className="mt-2 text-base/7 text-gray-300">
                We will never spam you. We will only send you updates about the product.
              </dd>
            </div>
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                <Hand aria-hidden="true" className="size-6 text-white" />
              </div>
              <dt className="mt-4 text-base font-semibold text-white">Free forever</dt>
              <dd className="mt-2 text-base/7 text-gray-300">
                We will never charge you for the product. First 50 users get 10k tokens free.
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div aria-hidden="true" className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="aspect-1155/678 w-288.75 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
        />
      </div>
    </div>
  )
}
