import React, { useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Settings, User, ChevronRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

const UserInfo = () => {

	const [user, setUser] = useState<any>(null)
	const [userData, setUserData] = useState<any>(null)

	const supabase = createClient()

	useEffect(() => {
		const fetchUser = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			setUser(user)
			const { data: userProfile } = await supabase
				.from('users')
				.select('*')
				.eq('auth_user_id', user?.id)
				.single()
			setUserData(userProfile)
		}
		fetchUser()
	}, [supabase])

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className='flex items-center gap-2.5 w-full justify-between p-2 hover:bg-accent rounded-md transition-colors duration-200'>
				<div className='flex items-center gap-2.5 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center'>
					<Avatar className='group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 border-2 border-primary/10 relative'>
						{user?.user_metadata?.avatar_url ? (
							<Image
								src={user.user_metadata.avatar_url}
								alt="Profile"
								fill
								className="rounded-full object-cover"
								priority
								sizes='24px'
							/>
						) : (
							<AvatarFallback className="bg-primary/5">
								{user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
							</AvatarFallback>
						)}
					</Avatar>
					<div className='flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden'>
						<span className='font-medium tracking-tight'>
							{userData?.name || 'User'}
						</span>
					</div>
				</div>
				<ChevronRight className="h-4 w-4 text-muted-foreground/70 transition-transform group-data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden" />
			</DropdownMenuTrigger>
			<DropdownMenuContent  align="start" className="w-64 p-2 ml-10 mb-2">
				<DropdownMenuLabel className="font-normal text-muted-foreground">
					{user?.email}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<Link href="/profile" className="flex items-center gap-3 p-3 cursor-pointer">
						<User className="h-4 w-4" />
						<div className="flex flex-col gap-1">
							<span className="font-medium">Profile</span>
							<span className="text-xs text-muted-foreground">Manage your profile settings</span>
						</div>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Link href="/settings" className="flex items-center gap-3 p-3 cursor-pointer">
						<Settings className="h-4 w-4" />
					<div className="flex flex-col gap-1">
						<span className="font-medium">Settings</span>
							<span className="text-xs text-muted-foreground">Customize your experience</span>
						</div>
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default UserInfo