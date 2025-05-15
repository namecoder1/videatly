'use client'

import { Check, ChevronDown, ChevronRight, Play } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from '../../ui/button'
import AvatarStack from '../../ui/avatar-stack'
import { handleScrollToElement } from '@/lib/utils'
import { creator1, creator2, creator3, creator4, creator5 } from '@/assets/home'
const avatars = [
  {
    src: creator1,
    fallback: "AV1",
		bg: "bg-red-100"
  },
  {
    src: creator2,
    fallback: "AV2",
		bg: "bg-blue-100"
  },
  {
    src: creator3,
    fallback: "AV3",
		bg: "bg-green-100"
  },
  {
    src: creator4,
    fallback: "AV4",
		bg: "bg-yellow-100"
  },
  {
    src: creator5,
    fallback: "AV5",
		bg: "bg-purple-100"
  }
]

const Hero = () => {
	return (
			<div className="w-full flex flex-col items-center justify-center text-center mt-56 h-[57vh]">
				<div className='border border-red-500 rounded-full w-fit bg-red-100 shadow-red-100 shadow-md'>
					<p className='text-sm font-medium text-red-500 px-3 py-2'>Available soon, don't miss out!</p>
				</div>
				<h1 className="text-5xl lg:text-7xl sm:text-6xl font-black tracking-tight max-w-3xl sm:mx-auto mx-4 mt-6">Create video ideas and scripts for your YouTube channel</h1>
				<p className="my-8 text-lg max-w-lg sm:mx-auto mx-4">
					Boost your YouTube channel with AI-powered video ideas and scripts, better analytics and a solid video planner to empower your productivity.
				</p>

				<div className="flex flex-row gap-2 mb-8">
					<Button asChild className="w-full group" variant="outline" size="lg">
						<Link
							href="#features"
							onClick={(e) => handleScrollToElement(e, 'features')}
						>
							Learn more
							<ChevronDown className='size-4 group-hover:translate-y-0.5 transition-transform duration-200 mt-0.5' />
						</Link>
					</Button>
					<Button asChild className="w-full group" variant="link" size="lg">
						<Link href="#features">
							Contact us
							<ChevronRight className='size-4 group-hover:translate-x-1 transition-transform duration-200' />
						</Link>
					</Button>
				</div>
			</div>
	)
}

export default Hero