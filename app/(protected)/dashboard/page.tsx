import { Separator } from '@/components/ui/separator'
import { LayoutDashboardIcon, PlusIcon, YoutubeIcon, BookIcon, BarChart3Icon } from 'lucide-react'
import React from 'react'
import CustomIcon from '@/components/ui/custom-icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VideoContentStyle, VideoLength, ExperienceLevel, VideoTargetInterest } from '@/types/enum'

const DashboardPage = async () => {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	const { data: userData, error } = await supabase.from('users').select('*').eq('auth_user_id', user?.id).single()
	const { data: ideasCount } = await supabase.from('ideas').select('id', { count: 'exact' }).eq('user_id', user?.id)
	const { data: scriptsCount } = await supabase.from('scripts').select('id', { count: 'exact' }).eq('user_id', user?.id)

	if (error) {
		console.error('Error fetching user data:', error)
		redirect('/')
	}

	if (!userData.yt_username) {
		redirect('/profile')
	}

	return (
		<section>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<LayoutDashboardIcon />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
				</div>
				<Separator className='my-4' />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
				<InfoCards title='YouTube Profile' type='yt' value={`@${userData.yt_username}`} description='Your YouTube channel name' icon={<YoutubeIcon className='h-5 w-5 text-red-500' />} />

				<InfoCards title='Content Stats' type='stats' value={`${ideasCount?.length || 0} ideas, ${scriptsCount?.length || 0} scripts`} description='Your content creation stats' icon={<BookIcon className='h-5 w-5 text-blue-500' />} />

				<InfoCards title='Experience Level' type='experience' value={userData.experience_level || "Not set"} description='Your content creation level' icon={<BarChart3Icon className='h-5 w-5 text-green-500' />} />
			
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				<Card>
					<CardHeader>
						<CardTitle>Content Preferences</CardTitle>
						<CardDescription>Your content creation preferences</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">Content Style</h3>
							<p className="text-base font-medium mt-1">{userData.content_style || "Not set"}</p>
						</div>
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">Video Length</h3>
							<p className="text-base font-medium mt-1">{userData.video_length || "Not set"}</p>
						</div>
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">Target Interest</h3>
							<p className="text-base font-medium mt-1">{userData.target_interest || "Not set"}</p>
						</div>
						<div>
							<h3 className="text-sm font-medium text-muted-foreground">Content Type</h3>
							<p className="text-base font-medium mt-1">{userData.content_type || "Not set"}</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>Your latest content creation activity</CardDescription>
					</CardHeader>
					<CardContent>
						{(ideasCount?.length === 0 && scriptsCount?.length === 0) ? (
							<div className="flex flex-col items-center justify-center h-40 text-center">
								<p className="text-muted-foreground mb-4">No recent activity</p>
								<p className="text-sm text-muted-foreground">Start creating ideas and scripts to see your activity here</p>
							</div>
						) : (
							<div className="space-y-4">
								{/* Activity items would go here */}
								<p className="text-sm text-muted-foreground">Recent activity will appear here</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<div className='fixed bottom-5 right-5 flex flex-col gap-2 items-end'>
				<Button className='bg-black hover:bg-black/80 w-fit' asChild>
					<Link href='/ideas/create'>
						<PlusIcon className="mr-2 h-4 w-4" />
						New Idea
					</Link>
				</Button>
				<Button className='bg-black hover:bg-black/80 w-fit' asChild>
					<Link href='/scripts/create'>
						<PlusIcon className="mr-2 h-4 w-4" />
						New Script
					</Link>
				</Button>
			</div>
		</section>
	)
}



const InfoCards = (props: { title: string, value: string, description: string, icon: React.ReactNode, type: 'yt' | 'content' | 'experience' | 'stats' }) => {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-medium flex items-center gap-2">
					{props.icon}
					{props.title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{props.value ? (
					props.type === 'yt' ? (
						<p className="text-2xl font-bold">{props.value || "Not set"}</p>
					) : (
						<p className="text-2xl font-bold capitalize">{props.value || "Not set"}</p>
					)
				) : (
					<Link href='/profile' className="text-2xl font-bold capitalize">Set {props.title}</Link>
				)}
				<p className="text-sm text-muted-foreground mt-1">{props.description}</p>
			</CardContent>
		</Card>
	)
}

export default DashboardPage