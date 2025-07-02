'use client'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import logo from '@/assets/logo.png'
import { Button } from '../ui/button'
import { DollarSign, Library } from 'lucide-react'
import { Squeeze as Hamburger } from 'hamburger-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import googleLogo from '@/assets/google-icon.png'
import { signInWithGoogleAction } from '@/app/(authentication)/actions'
import { handleScrollToElement } from '@/lib/utils'
import LanguageSwitcher from './LanguageSwitcher'
import CustomLink from '@/components/blocks/custom-link'

const Navbar = ({ dict }: { dict: any }) => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false)

	

	return (
		<nav className=' bg-background/80 backdrop-blur-sm md:mx-4'>
			<div className='mx-4 my-4 flex items-center justify-between max-w-3xl md:mx-auto border border-border py-2 px-4 rounded-full bg-white shadow-sm'>
				<Link href="/" className='shrink-0 flex items-center gap-2'>
					<Image src={logo} alt="logo" width={40} height={40} className='w-10 h-10' />
					<span className='text-xl font-bold font-raleway'>Videatly</span>
				</Link>

				{/* Desktop Menu */}
				<ul className='hidden md:flex items-center gap-6'>	
					<li>
						<CustomLink onClick={(e) => handleScrollToElement(e, 'pricing')} href="#pricing" className='text-sm flex items-center gap-2 hover-underline-animation text-muted-foreground hover:text-foreground transition-colors'>
							<DollarSign className='size-4' /> {dict.navbar.pricing}
						</CustomLink>
					</li>
					<li>
						<CustomLink href="/documentation" className='text-sm flex items-center gap-2 hover-underline-animation text-muted-foreground hover:text-foreground transition-colors'>
							<Library className='size-4' /> {dict.navbar.documentation}
						</CustomLink>
					</li>
				</ul>


				<form className='hidden md:flex items-center gap-2'>
				<LanguageSwitcher />
					<Button className='bg-black hover:bg-black/80' type='submit' formAction={signInWithGoogleAction}>
						<div className='flex items-center gap-2'>
							<Image src={googleLogo} alt="google logo" width={20} height={20} />
							{dict.navbar.login}
						</div>
					</Button>
				</form>

				{/* Mobile Menu Button */}
				<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className='md:hidden w-fit'>
							<Hamburger toggled={isMenuOpen} size={20} toggle={setIsMenuOpen} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-56 mr-4 mt-3'>
						<DropdownMenuItem className='flex items-center gap-2 py-2'>
							<Library className='size-4' />
							<CustomLink href="/documentation" className='flex-1'>{dict.navbar.documentation}</CustomLink>
						</DropdownMenuItem>
						<DropdownMenuItem className='flex items-center gap-2 py-2'>
							<DollarSign className='size-4' />
							<Link onClick={(e) => handleScrollToElement(e, 'pricing')} href="#pricing" className='flex-1'>{dict.navbar.pricing}</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<form className='p-1 space-y-2'>
							<Button type='submit' formAction={signInWithGoogleAction} className='w-full justify-start bg-black hover:bg-black/80'>
								<div className='flex items-center gap-2'>
									<Image src={googleLogo} alt="google logo" width={20} height={20} />
									{dict.navbar.login}
								</div>
							</Button>
						</form>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

		</nav>
	)
}

export default Navbar