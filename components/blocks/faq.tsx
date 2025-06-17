import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'
import React from 'react'

const Faq = ({ dict }: { dict: any }) => {
	const faq = [
		{
			question: dict.faq.q1,
			answer: dict.faq.a1
		},
		{
			question: dict.faq.q2,
			answer: dict.faq.a2
		},
		{
			question: dict.faq.q3,
			answer: dict.faq.a3
		},
		{
			question: dict.faq.q4,
			answer: dict.faq.a4
		},
		{
			question: dict.faq.q5,
			answer: dict.faq.a5
		},
		{
			question: dict.faq.q6,
			answer: dict.faq.a6
		},
		{
			question: dict.faq.q7,
			answer: dict.faq.a7
		}
	]

	return (
		<div id='faq' className='w-full py-32'>
			<div className='container mx-auto px-4'>
				<div className='w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12 md:gap-20'>
					<div className='w-full md:w-1/3 space-y-6'>
						<div className="inline-block p-3 rounded-2xl bg-primary/10 mb-4">
							<MessageCircle className="size-6 text-primary" />
						</div>
						<h3 className='text-balance text-4xl md:text-5xl font-black tracking-tight font-raleway'>
							{dict?.faq?.title}
						</h3>
						<p className='text-lg text-gray-600 leading-relaxed'>
							{dict.faq.description}
						</p>
					</div>
					<Card className='w-full md:w-2/3 p-6 rounded-3xl shadow-lg border border-gray-100 bg-white/50 backdrop-blur-sm'>
						<Accordion type="single" collapsible className="[&>*:last-child>div]:border-b-0">
							{faq.map((item, index) => (
								<AccordionItem 
									key={index} 
									value={`item-${index}`}
									className="border-b border-gray-100 py-4"
								>
									<AccordionTrigger className="text-lg font-semibold text-left hover:text-primary transition-colors">
										{item.question}
									</AccordionTrigger>
									<AccordionContent className="text-gray-600 text-base leading-relaxed pr-4">
										{item.answer}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</Card>
				</div>
			</div>
		</div>
	)
}

export default Faq