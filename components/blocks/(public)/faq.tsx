import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import React from 'react'

const Faq = () => {
	const faq = [
		{
			question: 'How can I customize my profile?',
			answer: 'You can customize your profile by adding a photo, editing your personal information, and setting your notification preferences. All these options are accessible through the "Profile Settings" menu.'
		},
		{
			question: 'What are the system requirements?',
			answer: 'The app is optimized to work on all modern browsers (Chrome, Firefox, Safari, Edge). For the best experience, we recommend keeping your browser updated to the latest version.'
		},
		{
			question: 'How is my personal data handled?',
			answer: 'Data security is our priority. We use end-to-end encryption to protect your information, and we never share your data with third parties without your explicit consent.'
		},
		{
			question: 'What should I do if I forget my password?',
			answer: 'If you forget your password, you can use the "Forgot Password" function on the login page. You\'ll receive an email with instructions to securely reset your password.'
		},
		{
			question: 'How can I report a technical issue?',
			answer: 'You can report technical issues through the "Support" section in the app or by sending a detailed email to our technical team. Include screenshots and precise descriptions to help us resolve the issue more quickly.'
		},
		{
			question: 'How can I get started?',
			answer: "Getting started is easy! Simply sign up for an account, and you'll have immediate access to all features. Our documentation provides comprehensive guides for new users."
		},
		{
			question: 'Do you offer support?',
			answer: 'Yes, we provide dedicated support through our help center and email. Our team typically responds within 24 hours to any queries or concerns.'
		}
	]

	return (
		<div id='faq' className='container mx-auto my-32 md:my-40 px-4 md:px-6'>
			<div className='space-y-8 w-full max-w-3xl mx-auto'>
				<h3 className='mt-2 text-balance text-5xl font-black tracking-tight sm:text-6xl sm:text-center'>
					Frequently Asked Questions
				</h3>
				<Card className='px-6 py-4 rounded-xl w-full'>
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