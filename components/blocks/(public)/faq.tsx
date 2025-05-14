import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
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
		<div id='faq' className='container mx-auto my-32 md:my-40 px-4 md:px-6'>
			<div className='space-y-8 w-full max-w-3xl mx-auto'>
				<h3 className='mt-2 text-balance text-5xl font-black tracking-tight sm:text-6xl sm:text-center'>
					{dict?.faq?.title}
				</h3>
				<Card className='px-6 py-4 rounded-3xl w-full'>
					<Accordion type="single" collapsible className="[&>*:last-child>div]:border-b-0">
						{faq.map((item, index) => (
							<AccordionItem 
								key={index} 
								value={`item-${index}`}
							>
								<AccordionTrigger className="text-lg font-medium text-left">
									{item.question}
								</AccordionTrigger>
								<AccordionContent className="text-gray-600 text-base">
									{item.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</Card>
			</div>
		</div>
	)
}

export default Faq