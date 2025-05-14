'use client'

import { Check, ChevronRight, Play } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from '../../ui/button'
import AvatarStack from '../../ui/avatar-stack'
import { handleScrollToElement } from '@/lib/utils'
import { signInWithGoogleAction } from '@/app/(authentication)/actions'
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

const Hero = ({ creators, dict }: { creators: number, dict: any }) => {
	return (
			<div className="w-full flex flex-col items-center justify-center text-center mt-56">
				<h1 className="text-6xl font-black tracking-tight max-w-3xl sm:mx-auto mx-4">{dict.home.title}</h1>
				<p className="my-8 text-lg max-w-lg sm:mx-auto mx-4">
				{dict.home.description}        
				</p>

				<div className="p-4 rounded flex flex-col items-start w-fit mb-8">
					<p><Check className="size-6 text-green-500 inline-block mr-1" /> {dict.home.uniqueVideoIdeas}</p>
					<p><Check className="size-6 text-green-500 inline-block mr-1" /> {dict.home.craftViralScripts}</p>
					<p><Check className="size-6 text-green-500 inline-block mr-1" /> {dict.home.analyzeOptimizeDominate}</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 mb-8">
					<form >
						<Button className='w-full group' size='lg' formAction={signInWithGoogleAction}>
							<Play className='size-4 mr-2 group-hover:scale-125 transition-transform duration-500' />
							{dict.home.startNow}
						</Button>
					</form>
					<Button asChild className="w-full group" variant="outline" size="lg">
						<Link
							href="#features"
							onClick={(e) => handleScrollToElement(e, 'features')}
						>
							{dict.home.learnMore}
							<ChevronRight className='size-4 group-hover:translate-x-1 transition-transform duration-200' />
						</Link>
					</Button>
				</div>
				
				<div className="flex items-center justify-center space-x-3 w-full max-w-md mb-8">
					<AvatarStack avatars={avatars} />
					<p className="text-sm">
						<span className="font-bold">{creators}</span> {dict.home.creatorsJoined}
					</p>
				</div>
			</div>
	)
}

export default Hero