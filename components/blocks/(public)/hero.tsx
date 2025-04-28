'use client'

import { Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from '../../ui/button'
import AvatarStack from '../../ui/avatar-stack'
import { handleScrollToElement } from '@/utils/supabase/utils'
import { signInWithGoogleAction } from '@/app/(authentication)/actions'

const avatars = [
  {
    src: "/avatars/creator-1.jpeg",
    fallback: "AV1",
		bg: "bg-red-100"
  },
  {
    src: "/avatars/creator-2.jpg",
    fallback: "AV2",
		bg: "bg-blue-100"
  },
  {
    src: "/avatars/creator-3.jpeg",
    fallback: "AV3",
		bg: "bg-green-100"
  },
  {
    src: "/avatars/creator-4.jpg",
    fallback: "AV4",
		bg: "bg-yellow-100"
  },
  {
    src: "/avatars/creator-5.jpeg",
    fallback: "AV5",
		bg: "bg-purple-100"
  }
]

const Hero = ({ creators }: { creators: number }) => {
	return (
			<div className="w-full flex flex-col items-center justify-center text-center mt-56">
				<h1 className="text-6xl font-black tracking-tight max-w-3xl sm:mx-auto mx-4">Create, Analyze and Grow with the Power of AI</h1>
				<p className="my-8 text-lg max-w-lg sm:mx-auto mx-4">
				Generate ideas, write optimized scripts and compare your performance with AI.        
				</p>

				<div className="p-4 rounded w-fit mb-8">
					<p><Check className="size-6 text-green-500 inline-block mr-1" /> Unique video ideas instantly</p>
					<p><Check className="size-6 text-green-500 inline-block mr-1" /> Craft viral scripts in seconds</p>
					<p><Check className="size-6 text-green-500 inline-block mr-1" /> Analyze, optimize, dominate</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 mb-8">
					<form >
						<Button className='w-full' size='lg' formAction={signInWithGoogleAction}>
							Start Now
						</Button>
					</form>
					<Button asChild className="w-full" variant="outline" size="lg">
						<Link
							href="#features"
							onClick={(e) => handleScrollToElement(e, 'features')}
						>
							Learn More
							<ChevronRight />
						</Link>
					</Button>
				</div>
				
				<div className="flex items-center justify-center space-x-3 w-full max-w-md mb-8">
					<AvatarStack avatars={avatars} />
					<p className="text-sm">
						<span className="font-bold">{creators}</span> creators joined 
					</p>
				</div>
			</div>
	)
}

export default Hero