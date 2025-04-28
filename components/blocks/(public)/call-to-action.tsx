import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import React from 'react'
import Link from 'next/link'

type CallToActionProps = {
	description: string
	buttonText: string
	buttonLink: string
	icon: React.ReactNode
	iconColor: string
}

const CallToAction = ({ props } : { props: CallToActionProps }) => {
	return (
		<div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
			<p className="text-sm text-neutral-600 flex items-center gap-2">
				<span className={`bg-zinc-100 rounded-xl p-2 border border-zinc-200 ${props.iconColor}`}>
					{props.icon}
				</span>
				{props.description}
			</p>
			<Button variant="black" className="mt-4 group" asChild>
				<Link href={props.buttonLink}>{props.buttonText} <ArrowRight className="group-hover:translate-x-1 transition-all" /></Link>
			</Button>
		</div>
	)
}

export default CallToAction