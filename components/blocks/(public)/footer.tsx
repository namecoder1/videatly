'use client'

import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import logo from '@/assets/logo.png'
import tobi from '@/assets/tobi-logo.png'
import { handleScrollToElement } from '@/lib/utils'

const Footer = () => {
	const year = new Date().getFullYear()
	
	return (
		<footer className="bg-black text-white py-12">
			<div className='container mx-auto px-4 max-w-7xl'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12'>
					<div className='flex flex-col gap-4 sm:col-span-2 lg:col-span-4 text-center sm:text-left'>
						<Link href="/" className="flex items-center gap-2 justify-center sm:justify-start">	
							<Image src={logo} alt="Videatly Logo" width={50} height={50} />
							<h1 className="text-3xl font-black">Videatly</h1>
						</Link>
						<div className="flex items-center gap-4 justify-center sm:justify-start">
							<p className='text-sm text-gray-300 max-w-[300px]'>Create, Analyze and Grow your YouTube channel with the Power of AI</p>
						</div>
						<div className='text-center sm:text-left'>
							<p className='text-xs text-gray-400'>© {year} Videatly. All rights reserved.</p>
						</div>
					</div>
					<div className='lg:col-span-2 text-center sm:text-left'>
						<h2 className='text-lg font-bold mb-4'>LINKS</h2>
						<ul className='space-y-3'>
							<li>
								<Link href="/" className='text-gray-300 hover:text-white transition-colors'>Home</Link>
							</li>
							<li>
								<Link href="mailto:support@videatly.ai" className='text-gray-300 hover:text-white transition-colors'>Support</Link>
							</li>
							<li>
								<Link onClick={(e) => handleScrollToElement(e, 'pricing')} href="#pricing" className='text-gray-300 hover:text-white transition-colors'>Pricing</Link>
							</li>
							<li>
								<Link href="/documentation" className='text-gray-300 hover:text-white transition-colors'>Documentation</Link>
							</li>
						</ul>
					</div>
					<div className='lg:col-span-2 text-center sm:text-left'>
						<h2 className='text-lg font-bold mb-4'>LEGAL</h2>
						<ul className='space-y-3'>
							<li>
								<Link href="/privacy-policy" className='text-gray-300 hover:text-white transition-colors'>Privacy Policy</Link>
							</li>
							<li>
								<Link href="/terms-of-service" className='text-gray-300 hover:text-white transition-colors'>Terms of Service</Link>
							</li>
							<li>
								<Link href="/cookie-policy" className='text-gray-300 hover:text-white transition-colors'>Cookie Policy</Link>
							</li>
						</ul>
					</div>
					<div className='lg:col-span-2 text-center sm:text-left'>
						<h2 className='text-lg font-bold mb-4'>MORE</h2>
						<ul className='space-y-3'>
							<li>
								<Link href="/about-us" className='text-gray-300 hover:text-white transition-colors'>About Us</Link>
							</li>
							<li>
								<Link href="/contact-us" className='text-gray-300 hover:text-white transition-colors'>Contact Us</Link>
							</li>
							<li>
								<Link href="https://www.instagram.com/videatly/" target='_blank' className='text-gray-300 hover:text-white transition-colors'>Instagram</Link>
							</li>
							<li>
								<Link href="https://www.youtube.com/@videatly" target='_blank' className='text-gray-300 hover:text-white transition-colors'>YouTube</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className='mt-12 border-t border-gray-800 pt-8'>
					<p className='text-sm text-gray-300 flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start text-center sm:text-left'>
						<Image src={tobi} alt='Tobi' width={33} height={33} className='rounded-full' />
						<span>
							Hey everybody! I&apos;m <Link href='https://tob.codes' target='_blank' className='underline underline-offset-2 hover:text-white transition-colors'>Tobi</Link> and I&apos;m the creator of Videatly. You can find more about me on my website.
						</span>
					</p>
				</div>
			</div>
		</footer>
	)
}

export default Footer