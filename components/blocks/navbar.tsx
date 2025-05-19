'use client'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import logo from '@/assets/logo.png'
import { Button } from '../ui/button'
import { Blocks, CircleHelp, DollarSign, Library, ListVideo } from 'lucide-react'
import { Squeeze as Hamburger } from 'hamburger-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import googleLogo from '@/assets/google-icon.png'
import { handleScrollToElement } from '@/lib/utils'
import LanguageSwitcher from './LanguageSwitcher'
import CustomLink from '@/components/blocks/custom-link'

const Navbar = ({ dict }: { dict: any }) => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false)

	

	return (
		<nav className=' md:mx-4 sticky top-4 z-50'>
			<div className='mx-4 my-4 flex items-center justify-between max-w-3xl md:mx-auto border border-border py-2.5 px-4 rounded-full bg-white/95 shadow-sm hover:shadow-md transition-all duration-300'>
				<Link href="/" className='shrink-0 hover:opacity-80 transition-opacity flex items-center gap-1'>
					<Image src={logo} alt="logo" width={40} height={40} className='w-10 h-10' />
					<span className='text-xl font-bold font-raleway'>Videatly</span>
				</Link>

				{/* Desktop Menu */}
				<ul className='hidden md:flex items-center gap-6'>	
					<li>
						<CustomLink onClick={(e) => handleScrollToElement(e, 'pricing')} href="#pricing" className='text-sm flex items-center gap-2 hover-underline-animation text-muted-foreground hover:text-foreground transition-all duration-200'>
							<ListVideo className='size-4' /> {dict.navbar.useCases}
						</CustomLink>
					</li>
					<li>
						<CustomLink href="/documentation" className='text-sm flex items-center gap-2 hover-underline-animation text-muted-foreground hover:text-foreground transition-all duration-200'>
							<Blocks className='size-4' /> {dict.navbar.features}
						</CustomLink>
					</li>
					<li>
						<CustomLink href="/documentation" className='text-sm flex items-center gap-2 hover-underline-animation text-muted-foreground hover:text-foreground transition-all duration-200'>
							<CircleHelp className='size-4' /> {dict.navbar.howItWorks}
						</CustomLink>
					</li>
				</ul>

				{/* Right side items */}
				<div className='flex items-center gap-3'>
					<LanguageSwitcher className='hidden md:flex' />
					
					{/* Mobile Menu Button */}
					<div className='flex items-center gap-2 md:hidden'>
						<LanguageSwitcher />
						<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className='w-fit hover:bg-muted/50 transition-colors'>
									<Hamburger toggled={isMenuOpen} size={20} toggle={setIsMenuOpen} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className='w-56 mr-4 mt-3 p-2 rounded-3xl border-border/50 shadow-lg animate-in slide-in-from-top-2 duration-200'>
								<DropdownMenuItem className='flex items-center gap-2 py-2.5 px-3 rounded-2xl hover:bg-muted/50 transition-colors'>
									<CustomLink onClick={(e) => handleScrollToElement(e, 'pricing')} href="#pricing" className='text-sm flex items-center gap-2 w-full'>
										<ListVideo className='size-4' /> {dict.navbar.useCases}
									</CustomLink>						
								</DropdownMenuItem>
								<DropdownMenuItem className='flex items-center gap-2 py-2.5 px-3 rounded-2xl hover:bg-muted/50 transition-colors'>
									<CustomLink onClick={(e) => handleScrollToElement(e, 'pricing')} href="#pricing" className='text-sm flex items-center gap-2 w-full'>
										<Blocks className='size-4' /> {dict.navbar.features}
									</CustomLink>								
								</DropdownMenuItem>
								<DropdownMenuItem className='flex items-center gap-2 py-2.5 px-3 rounded-2xl hover:bg-muted/50 transition-colors'>
									<CustomLink href="/documentation" className='text-sm flex items-center gap-2 w-full'>
										<CircleHelp className='size-4' /> {dict.navbar.howItWorks}
									</CustomLink>							
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar