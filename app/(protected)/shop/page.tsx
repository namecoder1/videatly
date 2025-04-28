import React from 'react'
import CustomIcon from '@/components/ui/custom-icon'
import { LightbulbIcon, ShoppingCartIcon, VideoIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ideaTokensPlans, scriptTokensPlans } from './config'

const PlanCard = ({ plan }: { plan: typeof ideaTokensPlans[0] }) => (
	<div className={`rounded-2xl border bg-white p-6 flex flex-col ${plan.isPopular ? 'relative shadow-xl ring-2 ring-gray-700/70' : 'shadow-lg hover:shadow-xl transition-shadow'}`}>
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
			className="w-full py-5 text-base font-medium"
			variant={plan.isPopular ? "default" : "outline"}
			size="lg"
		>
			Buy for ${plan.price}
		</Button>
	</div>
)

const ShopPage = () => {
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