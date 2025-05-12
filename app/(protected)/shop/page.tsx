'use client'

import React, { useState, useEffect } from 'react'
import CustomIcon from '@/components/ui/custom-icon'
import { LightbulbIcon, ShoppingCartIcon, VideoIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ideaTokensPlans, scriptTokensPlans } from './config'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useTokens } from '@/hooks/use-tokens'
import Loader from '@/components/blocks/loader'

const PlanCard = ({ plan }: { plan: typeof ideaTokensPlans[0] }) => {
	const { toast } = useToast()
	const router = useRouter()
	const { setTokens } = useTokens()
	const [isLoading, setIsLoading] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [isError, setIsError] = useState(false)

	const handleBuy = async (tokens: number) => {
		try {
			setIsLoading(true)
			setIsSuccess(false)
			setIsError(false)

			const supabase = createClient()
			const { data: userData, error: userError } = await supabase.auth.getUser()
			
			if (userError) {
				throw userError
			}

			const { error: tokensError } = await supabase.rpc('increment_paid_tokens', {
				p_user_id: userData.user.id,
				p_tool: plan.tool,
				p_amount: tokens
			})

			if (tokensError) {
				throw tokensError
			}

			// Fetch updated tokens from database
			const { data: updatedTokens, error: fetchError } = await supabase
				.from('tokens')
				.select('base_tokens, paid_tokens, tool')
				.eq('user_id', userData.user.id)

			if (fetchError) {
				throw fetchError
			}

			// Update Zustand store with new token data
			setTokens(updatedTokens)

			setIsSuccess(true)
			toast({
				title: "Purchase successful",
				description: `${tokens} ${plan.tool} tokens have been added to your account.`,
			})
			router.refresh()
		} catch (error) {
			setIsError(true)
			toast({
				title: "Error",
				description: "Failed to process your purchase. Please try again.",
				variant: "destructive",
			})
			console.error('Purchase error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading) {
		return <Loader position='center' />
	}
	
	return (
		<div className={`rounded-2xl border bg-white p-6 flex flex-col h-fit ${plan.isPopular ? 'relative shadow-xl ring-2 ring-gray-700/70' : 'shadow-lg hover:shadow-xl transition-shadow'}`}>
			{plan.isPopular && (
				<div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
					<span className="bg-gray-800 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
						Most Popular
					</span>
				</div>
			)}
			
			<div className="mb-6">
				<h3 className="text-xl font-bold">{plan.name}</h3>
				<div className="mt-4 flex items-baseline">
					<span className="text-4xl font-bold tracking-tight">${plan.price}</span>
				</div>
				<p className="text-zinc-600 mt-3">{plan.description}</p>
			</div>
			
			<p className='flex items-center gap-3 text-zinc-700 mb-6'>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-500 flex-shrink-0">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
				<span>{plan.tokens} tokens</span>
			</p>

			<Button 
				onClick={() => handleBuy(plan.tokens)}
				className="w-full py-5 text-base font-medium relative"
				variant={plan.isPopular ? "default" : "outline"}
				size="lg"
				disabled={isLoading}
			>
				{isLoading ? (
					isLoading && plan.isPopular ? (
						<div className="flex items-center justify-center">
							<Loader position="center" color='white' />
						</div>
					) : (
						<div className="flex items-center justify-center">
							<Loader position="center" />
						</div>
					)
				) : (
					`Buy for $${plan.price}`
				)}
			</Button>
		</div>
	)
}

const ShopPage = () => {
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Simuliamo un caricamento iniziale
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 1000)

		return () => clearTimeout(timer)
	}, [])

	if (isLoading) {
		return <Loader position='full' />
	}

	return (
		<section>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<ShoppingCartIcon />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>Shop</h1>
				</div>
				<Separator className='my-4' />
			</div>
			
			<div className='flex flex-col gap-10 w-full my-4'>
				{/* Idea Tokens Section */}
				<div >
					<h2 className='text-3xl font-bold tracking-tight mb-2 flex items-center gap-3'>
						<CustomIcon icon={<LightbulbIcon />} color='orange' />
						Idea Tokens
					</h2>
					<p className='text-zinc-600 max-w-2xl'>
						Generate unique ideas for your next project or creative endeavor.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{ideaTokensPlans.map((plan) => (
						<PlanCard key={plan.name} plan={plan} />
					))}
				</div>

				{/* YouTube Script Tokens Section */}
				<div className="mt-12">
					<h2 className='text-3xl font-bold tracking-tight mb-2 flex items-center gap-3'>
						<CustomIcon icon={<VideoIcon />} color='blue' />
						YouTube Script Tokens
					</h2>
					<p className='text-zinc-600 max-w-2xl'>
						Create engaging scripts for your YouTube videos to boost viewer engagement.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{scriptTokensPlans.map((plan) => (
						<PlanCard key={plan.name} plan={plan} />
					))}
				</div>
			</div>
		</section>
	)
}

export default ShopPage