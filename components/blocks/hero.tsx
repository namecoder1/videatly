'use client'

import { validateEmail } from '@/lib/utils'
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { createClient } from '@/utils/supabase/client'
import { usePathname, useRouter } from 'next/navigation'

const Hero = ({ creators, dict, seatsLeft }: { creators: number, dict: any, seatsLeft: number }) => {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')
	const [totalUsers, setTotalUsers] = useState(0)
  const pathname = usePathname();
  const currentLang = pathname.split('/')[1] || 'en';


	useEffect(() => {
		fetchTotalUsers()
	}, [])

	const fetchTotalUsers = async () => {
		const supabase = await createClient()
		const { data, error } = await supabase.rpc('get_lead_users_count')
		if (!error && data) {
			setTotalUsers(data)
		}
	}



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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value)
		if (error) setError('')
	}

	return (
			<div className="w-full flex flex-col items-center justify-center text-center my-40">
				
				<div className="mb-6 flex flex-col md:flex-row items-center gap-2 px-4 py-2 md:py-2 bg-gray-50 rounded-3xl border border-gray-200">
					<div className="flex items-center gap-1.5">
						<span className="text-sm text-gray-600">{dict.home.span1}</span>
						<span className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">10k {dict.home.tokens}</span>
					</div>
					<div className="hidden md:block h-4 w-[1px] bg-gray-300"></div>
					<div className="flex items-center gap-1">
						<span className="font-bold text-primary">{50 - totalUsers}</span>
						<span className="text-sm text-gray-600">{dict.home.span2}</span>
					</div>
				</div>

				<h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-3xl sm:mx-auto mx-4 font-raleway">{dict.home.title}</h1>
				<p className="my-8 text-lg max-w-lg sm:mx-auto mx-4">
				{dict.home.description}        
				</p>


				<form onSubmit={handleSubmit} className='relative flex flex-col items-center justify-center w-full max-w-md mt-3 px-2'>
					<div className="relative w-full">
						<Input
							value={email}
							onChange={handleChange}
							placeholder={dict.home.input}
							className={`w-full max-w-md rounded-full p-6 md:text-lg border-2 ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-200 focus-visible:ring-red-200'} transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-red-300`}
						/>
						<Button className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full' type='submit'>
							{dict.home.button}
						</Button>
					</div>
					{error && <p className="text-red-500 text-sm mt-2 text-center w-full pl-4">{error}</p>}
				</form>

				
			</div>
	)
}

export default Hero