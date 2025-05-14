import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import React from 'react'
import { signInWithGoogleAction } from '@/app/(authentication)/actions'




const Pricing = ({ dict }: { dict: any }) => {

	const PRICING_PLANS = [
		{
			name: dict.pricing.free.title,
			price: '0',
			period: 'month',
			description: dict.pricing.free.description,
			features: dict.pricing.free.features,
			popular: false,
			variant: 'outline',
			action: dict.pricing.free.action
		},	
		{
			name: dict.pricing.pro.title,
			price: '15',
			period: 'month',
			description: dict.pricing.pro.description,
			features: dict.pricing.pro.features,
			popular: true,
			variant: 'default',
			action: dict.pricing.pro.action
		},
		{
			name: dict.pricing.ultra.title,
			price: '30',
			period: 'month',
			description: dict.pricing.ultra.description,
			features: dict.pricing.ultra.features,
			popular: false,
			variant: 'outline',
			action: dict.pricing.ultra.action
		}
	]

	return (
			<div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 my-12 sm:my-16 lg:my-20" id="pricing">
				<div className="text-center mb-10 sm:mb-12 lg:mb-16">
					<h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
						{dict.pricing.title}
					</h1>
					<p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto px-4">
						{dict.pricing.description}
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-10 max-w-[1200px] mx-auto px-4 [&>*:last-child]:md:col-span-2 [&>*:last-child]:md:mx-auto [&>*:last-child]:lg:col-span-1">
					{PRICING_PLANS.map((plan) => (
						<div 
							key={plan.name}
							className={`
								rounded-2xl border bg-white p-6 sm:p-8 flex flex-col relative w-full
								${plan.popular ? 'md:shadow-xl md:ring-2 md:ring-gray-700/70 lg:scale-105' : 'shadow-lg hover:shadow-xl transition-shadow'}
							`}
						>
							{plan.popular && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2">
									<span className="bg-gray-800 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
										{dict.pricing.popular}
									</span>
								</div>
							)}
							
							<div className="mb-6 sm:mb-8">
								<h3 className="text-xl sm:text-2xl font-bold">{plan.name}</h3>
								<div className="mt-3 sm:mt-4 flex items-baseline">
									<span className="text-4xl sm:text-5xl font-bold tracking-tight">{plan.price}</span>
									<span className="ml-2 text-zinc-500">/{plan.period}</span>
								</div>
								<p className="text-zinc-600 mt-3 sm:mt-4">{plan.description}</p>
							</div>
							
							<ul className="space-y-3 sm:space-y-4 flex-1 mb-6 sm:mb-8">
								{plan.features.map((feature: string) => (
									<li key={feature} className="flex items-center gap-3 text-zinc-700">
										<Check className="h-5 w-5 text-green-500 flex-shrink-0" />
										<span>{feature}</span>
									</li>
								))}
							</ul>

							<form className='p-1 space-y-2'>
								{plan.name === 'Free' ? (
									<Button
										type='submit' 
										formAction={signInWithGoogleAction}
										className="w-full py-5 sm:py-6 text-base sm:text-lg font-medium"
										variant={plan.variant as any}
										size="lg"
								>
									<div className='flex items-center gap-2'>
										{plan.action}
									</div>
								</Button>
								) : (
									<Button
										type='submit' 
										className="w-full py-5 sm:py-6 text-base sm:text-lg font-medium"
										variant={plan.variant as any}
										size="lg"
									>
										{plan.action}
									</Button>
								)}
							</form>
						</div>
					))}
				</div>
			</div>
	)
}

export default Pricing

