'use client'

import React, { useEffect, useState } from 'react'
import { Trash2, Mail, User, Phone, CalendarClock, CalendarPlus, TriangleAlert, Shield, Lock, KeyRound, Database, Settings, Languages, CreditCard } from 'lucide-react'
import Loader from '@/components/blocks/loader'
import { Button } from '@/components/ui/button'
import { deleteAccount } from '@/app/(authentication)/actions'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import CustomIcon from '@/components/ui/custom-icon'
import { Separator } from '@/components/ui/separator'
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useDictionary } from '@/app/context/dictionary-context'
import { useRouter, usePathname } from 'next/navigation'

const SettingsPage = () => {
	const supabase = createClient()
	const [user, setUser] = useState<any>(null)
	const [userProfile, setUserProfile] = useState<any>(null)
	const [isEditing, setIsEditing] = useState(false)
	const [newName, setNewName] = useState('')
	const [language, setLanguage] = useState<string>('en')
	const { toast } = useToast()
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()
	const pathname = usePathname()

  const dict = useDictionary()

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true)
			try {
				// Fetch user
				const { data: { user } } = await supabase.auth.getUser()
				setUser(user)

				// If user exists, fetch profile
				if (user?.id) {
					const { data: userProfile, error } = await supabase
						.from('users')
						.select('*')
						.eq('auth_user_id', user.id)
						.single()
					
					if (!error) {
						setUserProfile(userProfile)
						setNewName(userProfile?.name || '')
						if (userProfile?.spoken_language) {
							setLanguage(userProfile.spoken_language)
						}
					}
				}
			} catch (error) {
				console.error('Error fetching data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [supabase])

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
		
		// Update Supabase with the new language preference
		const { error } = await supabase
			.from('users')
			.update({ spoken_language: value })
			.eq('auth_user_id', user.id)
			
		if (!error) {
			setLanguage(value)
			setUserProfile({ ...userProfile, spoken_language: value })
			
			// Update URL path language
			const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
			router.push(`/${value}${pathWithoutLocale}`);
			
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

	if (isLoading) return <Loader position='full' />

	return (
		<section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<Settings />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>{dict.settingsPage.title}</h1>
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
									{dict.settingsPage.fields.languagePicker.language}
								</div>
								<Select value={language} onValueChange={handleLanguageChange}>
									<SelectTrigger className='w-fit space-x-2'>
										<SelectValue placeholder={dict.settingsPage.fields.languagePicker.languagePlaceholder} />
									</SelectTrigger>
									<SelectContent className='flex flex-col gap-2'>
										<SelectItem value='en' className='flex items-center gap-2'><span className='text-xs mr-1'>🇺🇸</span> English</SelectItem>
										<SelectItem value='it' className='flex items-center gap-2'><span className='text-xs mr-1'>🇮🇹</span> Italian</SelectItem>
										<SelectItem value='es' className='flex items-center gap-2'><span className='text-xs mr-1'>🇪🇸</span> Spanish</SelectItem>
										<SelectItem value='fr' className='flex items-center gap-2'><span className='text-xs mr-1'>🇫🇷</span> French</SelectItem>
									</SelectContent>
								</Select>
							</CardTitle>
							<CardDescription className='pt-2'>
								{dict.settingsPage.fields.languagePicker.languageDescription}
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className="h-fit order-[2] lg:order-none mb-6">
						<CardHeader className='flex flex-row items-center justify-between gap-2'>
							<CardTitle className="text-xl flex items-center gap-2">
								<User className="w-5 h-5" />
								{dict.settingsPage.fields.personalInfo.title}
							</CardTitle>
							<div>
								<p className='text-sm text-muted-foreground font-medium'>
									{renderLanguage(userProfile?.spoken_language || 'en')}
								</p>
							</div>
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
														placeholder={dict.settingsPage.fields.personalInfo.namePlaceholder}
													/>
													<Button variant="outline" size="sm" onClick={handleUpdateName}>{dict.settingsPage.fields.personalInfo.nameSave}</Button>
													<Button variant="ghost" size="sm" onClick={() => {
														setIsEditing(false)
														setNewName(userProfile?.name || '')
													}}>{dict.settingsPage.fields.personalInfo.nameCancel}</Button>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<h3 className="font-medium">{userProfile?.name || user?.user_metadata?.full_name}</h3>
													<Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>{dict.settingsPage.fields.personalInfo.nameEdit}</Button>
												</div>
											)}
										</div>
										<div className="flex items-center text-sm text-muted-foreground">
											<Mail className="w-4 h-4 mr-2" />
											{user?.email}
										</div>
									</div>
								</div>

								<div className="flex gap-4 text-sm justify-between">
									<div className="flex items-center gap-2 text-muted-foreground">
										<CalendarClock className="w-4 h-4" />
										{dict.settingsPage.fields.personalInfo.created}: {user?.created_at ? formatDate(user.created_at, 'normal') : 'N/A'}
									</div>
									<div className="flex items-center gap-2 text-muted-foreground">
										<CalendarPlus className="w-4 h-4" />
										{dict.settingsPage.fields.personalInfo.lastUpdated}: {user?.updated_at ? formatDate(user.updated_at, 'normal') : 'N/A'}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='h-fit order-[3] lg:order-none'>
						<CardHeader className='flex flex-row items-center justify-between gap-2'>
							<CardTitle className='text-xl flex items-center gap-2'>
								<CreditCard className='w-5 h-5' />
								{userProfile?.subscription === 'pro' ? 'Pro Plan' : userProfile?.subscription === 'ultra' ? 'Ultra Plan' : 'Free Plan'}
							</CardTitle>
							<CardDescription>
								<span>{dict.settingsPage.fields.userPlan.span}</span>
								<span className='font-semibold text-green-500 underline underline-offset-2'>{userProfile?.subscription === 'pro' ? '$15' : userProfile?.subscription === 'ultra' ? '$30' : '$0'} / month</span>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='flex items-start gap-2 flex-col'>
								<p className='text-sm text-muted-foreground max-w-xl'>
									{dict.settingsPage.fields.userPlan.description1} <Link className='text-blue-500' target='_blank' href='https://stripe.com'>Stripe</Link>.
									{dict.settingsPage.fields.userPlan.description2}
								</p>
								<Button variant='black' className='ml-auto' size='sm'>{dict.settingsPage.fields.userPlan.button}</Button>
							</div>
						</CardContent>
					</Card>

					<DeleteCard isMobile={false} dict={dict} />
				</div>

				<Card className="col-span-1 order-[4] lg:order-none h-fit">
					<CardHeader>
						<CardTitle className="text-xl flex items-center gap-2">
							<Shield className="w-5 h-5" />
							{dict.settingsPage.info.title}
						</CardTitle>
						<CardDescription>
							{dict.settingsPage.info.description}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<h3 className="font-medium flex items-center gap-2">
								<div className='p-2 rounded-xl bg-emerald-100'>
									<Lock className="w-4 h-4 text-emerald-600" />
								</div>
								{dict.settingsPage.info.fields.privacy.title}
							</h3>
							<p className="text-sm text-muted-foreground">
								{dict.settingsPage.info.fields.privacy.description}
							</p>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium flex items-center gap-2">
								<div className='p-2 rounded-xl bg-purple-100'>
									<KeyRound className="w-4 h-4 text-purple-600" />
								</div>
								{dict.settingsPage.info.fields.account.title}
							</h3>
							<p className="text-sm text-muted-foreground">
								{dict.settingsPage.info.fields.account.description}
							</p>
						</div>

						<div className="space-y-2">
							<h3 className="font-medium flex items-center gap-2">
								<div className='p-2 rounded-xl bg-amber-100'>
									<Database className="w-4 h-4 text-amber-600" />
								</div>
								{dict.settingsPage.info.fields.data.title}
							</h3>
							<p className="text-sm text-muted-foreground">
								{dict.settingsPage.info.fields.data.description}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Versione mobile della card */}
				<DeleteCard isMobile={true} dict={dict} />
			</div>
		</section>
	)
}


const DeleteCard = ({ isMobile, dict }: { isMobile: boolean, dict: any }) => {
	if (isMobile) {
		return (
			<Card className="col-span-1 lg:hidden bg-destructive/5 border-destructive/20 order-[99]">
					<CardHeader>
						<CardTitle className="text-xl text-destructive flex items-center gap-2">
							<TriangleAlert className="w-5 h-5" />
							{dict.settingsPage.fields.deleteCard.title}
						</CardTitle>
						<CardDescription className='max-w-2xl'>
							{dict.settingsPage.fields.deleteCard.description}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={deleteAccount}>
							<Button variant="destructive" type="submit" className="w-full sm:w-auto">
								<Trash2 className="mr-2 h-4 w-4" />
								{dict.settingsPage.fields.deleteCard.button}
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
					{dict.settingsPage.fields.deleteCard.title}
				</CardTitle>
				<CardDescription className='max-w-2xl'>
					{dict.settingsPage.fields.deleteCard.description}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form action={deleteAccount}>
					<Button variant="destructive" type="submit" className="w-full sm:w-auto">
						<Trash2 className="mr-2 h-4 w-4" />
						{dict.settingsPage.fields.deleteCard.button}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}


function renderLanguage(language: string) {
	switch (language) {
		case 'en':
			return (
				<>
					<span className='text-xs mr-1'>🇺🇸</span>
					<span>English</span>
				</>
			)
		case 'it':
			return (
				<>
					<span className='text-xs mr-1'>🇮🇹</span>
					<span>Italian</span>
				</>
			)
		case 'es':
			return (
				<>
					<span className='text-xs mr-1'>🇪🇸</span>
					<span>Spanish</span>
				</>
			)
		case 'fr':
			return (
				<>
					<span className='text-xs mr-1'>🇫🇷</span>
					<span>French</span>
				</>
			)
		default:
			return (
				<>
					<span className='text-xs mr-1'>🇺🇸</span>
					<span>English</span>
				</>
			)
	}
}

export default SettingsPage