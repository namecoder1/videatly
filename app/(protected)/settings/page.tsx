'use client'

import React, { useEffect, useState } from 'react'
import { Trash2, Mail, User, Image as ImageIcon, Calendar, Phone, CalendarClock, CalendarPlus, TriangleAlert, Shield, Download, Lock, KeyRound, Database, Info, Settings, Languages, CloudFog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteAccount } from '@/app/(authentication)/actions'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/utils/supabase/utils'
import Image from 'next/image'
import CustomIcon from '@/components/ui/custom-icon'
import { Separator } from '@/components/ui/separator'
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const SettingsPage = () => {
	const supabase = createClient()
	const [user, setUser] = useState<any>(null)
	const [userProfile, setUserProfile] = useState<any>(null)
	const [isEditing, setIsEditing] = useState(false)
	const [newName, setNewName] = useState('')
	const [language, setLanguage] = useState('it')
	const { toast } = useToast()
	useEffect(() => {
		const fetchUser = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			setUser(user)
		}
		fetchUser()
	}, [])

	useEffect(() => {
		const fetchUserProfile = async () => {
			if (user?.id) {
				const { data: userProfile, error } = await supabase
					.from('users')
					.select('*')
					.eq('auth_user_id', user.id)
					.single()
				setUserProfile(userProfile)
				setNewName(userProfile?.name || '')
			}
		}
		fetchUserProfile()
	}, [user])

	const handleUpdateName = async () => {
		if (user?.id && newName.trim()) {
			const { error } = await supabase
				.from('users')
				.update({ name: newName.trim() })
				.eq('auth_user_id', user.id)

			if (!error) {
				setUserProfile({ ...userProfile, name: newName.trim() })
				setIsEditing(false)
			}
		}
	}

	const handleLanguageChange = async (value: string) => {
		if (!user?.id) return
		const { error } = await supabase
			.from('users')
			.update({ spoken_language: value })
			.eq('auth_user_id', user.id)
		if (!error) {
			setLanguage(value)
			toast({
				title: 'Language updated',
				description: 'Your language has been updated',
				variant: 'success'
			})
		} else {
			toast({
				title: 'Error updating language',
				description: 'Failed to update language',
				variant: 'destructive'
			})
		}
	}

	return (
		<section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<Settings />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        </div>
        <Separator className='my-4' />
      </div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-fit w-full'>
				<div className='col-span-1 lg:col-span-2 h-fit'>
					<Card className='h-fit order-[1] lg:order-none mb-6'>
						<CardHeader>
							<CardTitle className="text-xl flex items-center justify-between gap-2">
								<div className='flex items-center gap-2'>
									<Languages className="w-5 h-5" />
									Language
								</div>
								<Select value={language} onValueChange={handleLanguageChange}>
									<SelectTrigger className='w-fit space-x-2'>
										<SelectValue placeholder='Select language' />
									</SelectTrigger>
									<SelectContent >
										<SelectItem value='en'>🇺🇸 English</SelectItem>
										<SelectItem value='it'>🇮🇹 Italian</SelectItem>
										<SelectItem value='es'>🇪🇸 Spanish</SelectItem>
										<SelectItem value='fr'>🇫🇷 French</SelectItem>
									</SelectContent>
								</Select>
							</CardTitle>
						</CardHeader>
					</Card>

					<Card className="h-fit order-[2] lg:order-none">
						<CardHeader>
							<CardTitle className="text-xl flex items-center gap-2">
								<User className="w-5 h-5" />
								Personal Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-6">
								<div className="flex items-center gap-4">
									<Avatar className="w-20 h-20 relative">
										{user?.user_metadata?.avatar_url ? (
											<Image
												src={user.user_metadata.avatar_url}
												alt="Profile"
												fill
												className="rounded-full object-cover border border-gray-300"
											/>
										) : (
											<AvatarFallback>
												{userProfile?.name?.charAt(0).toUpperCase() || 'U'}
											</AvatarFallback>
										)}
									</Avatar>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											{isEditing ? (
												<div className="flex items-center gap-2">
													<input
														type="text"
														value={newName}
														onChange={(e) => setNewName(e.target.value)}
														className="px-2 py-1 border rounded-md"
														placeholder="Enter name"
													/>
													<Button variant="outline" size="sm" onClick={handleUpdateName}>Save</Button>
													<Button variant="ghost" size="sm" onClick={() => {
														setIsEditing(false)
														setNewName(userProfile?.name || '')
													}}>Cancel</Button>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<h3 className="font-medium">{userProfile?.name || user?.user_metadata?.full_name}</h3>
													<Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit Name</Button>
												</div>
											)}
										</div>
										<div className="flex items-center text-sm text-muted-foreground">
											<Mail className="w-4 h-4 mr-2" />
											{user?.email}
										</div>
										{user?.phone && (
											<div className="flex items-center text-sm text-muted-foreground">
												<Phone className="w-4 h-4 mr-2" />
												{user?.phone}
											</div>
										)}
										<div className="flex items-center text-sm text-muted-foreground">
											<ImageIcon className="w-4 h-4 mr-2" />
											Profile Picture
											<Button variant="ghost" size="sm" className="ml-2">Change</Button>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="flex items-center gap-2 text-muted-foreground">
										<CalendarClock className="w-4 h-4" />
										Created: {user?.created_at ? formatDate(user.created_at, 'normal') : 'N/A'}
									</div>
									<div className="flex items-center gap-2 text-muted-foreground">
										<CalendarPlus className="w-4 h-4" />
										Last Updated: {user?.updated_at ? formatDate(user.updated_at, 'normal') : 'N/A'}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Versione desktop della card */}
					<DeleteCard isMobile={false} />
				</div>

				<Card className="col-span-1 order-[3] lg:order-none h-fit">
					<CardHeader>
						<CardTitle className="text-xl flex items-center gap-2">
							<div className='p-2 rounded-xl bg-blue-400/90 border border-blue-500'>
								<Shield className="w-5 h-5 text-white" />
							</div>
							Account & Privacy
						</CardTitle>
						<CardDescription>
							Manage your account settings and privacy preferences
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<h3 className="font-medium flex items-center gap-2">
								<div className='p-2 rounded-xl bg-emerald-400/90 border border-emerald-500'>
									<Lock className="w-4 h-4 text-white" />
								</div>
								Data & Privacy
							</h3>
							<p className="text-sm text-muted-foreground">
								We collect and store only essential data needed to provide our services. Your data is encrypted and securely stored.
							</p>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium flex items-center gap-2">
								<div className='p-2 rounded-xl bg-purple-400/90 border border-purple-500'>
									<KeyRound className="w-4 h-4 text-white" />
								</div>
								Account Security
							</h3>
							<p className="text-sm text-muted-foreground">
								Your account is protected with Google OAuth authentication. We recommend enabling two-factor authentication for additional security.
							</p>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium flex items-center gap-2">
								<div className='p-2 rounded-xl bg-amber-400/90 border border-amber-500'>
									<Database className="w-4 h-4 text-white" />
								</div>
								Data Management
							</h3>
							<p className="text-sm text-muted-foreground">
								Your data is securely stored and managed in our systems. We handle all data operations automatically to ensure smooth service delivery.
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Versione mobile della card */}
				<DeleteCard isMobile={true} />
			</div>
		</section>
	)
}


const DeleteCard = ({ isMobile }: { isMobile: boolean }) => {
	if (isMobile) {
		return (
			<Card className="col-span-1 lg:hidden bg-destructive/5 border-destructive/20 order-[99]">
					<CardHeader>
						<CardTitle className="text-xl text-destructive flex items-center gap-2">
							<TriangleAlert className="w-5 h-5" />
							Danger Zone
						</CardTitle>
						<CardDescription className='max-w-2xl'>
							Deleting your account will remove all your data from our servers. By deleting your account, you will no longer be able to access your account or any of its contents.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={deleteAccount}>
							<Button variant="destructive" type="submit" className="w-full sm:w-auto">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Account
							</Button>
						</form>
					</CardContent>
				</Card>
		)
	}

	return (
		<Card className="bg-destructive/5 border-destructive/20 mt-6 hidden lg:block">
			<CardHeader>
				<CardTitle className="text-xl text-destructive flex items-center gap-2">
					<TriangleAlert className="w-5 h-5" />
					Danger Zone
				</CardTitle>
				<CardDescription className='max-w-2xl'>
					Deleting your account will remove all your data from our servers. By deleting your account, you will no longer be able to access your account or any of its contents.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form action={deleteAccount}>
					<Button variant="destructive" type="submit" className="w-full sm:w-auto">
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Account
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}

export default SettingsPage