'use client'

import { Separator } from '@/components/ui/separator'
import Loader from '@/components/blocks/loader'
import { LayoutDashboardIcon, PlusIcon, Users, CircleCheckBig } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import CustomIcon from '@/components/ui/custom-icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { redirect, usePathname } from 'next/navigation'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChartLegend } from '@/components/charts/bar-chart-legend'

const DashboardPage = () => {
	const supabase = createClient()

	const [userData, setUserData] = useState<any>(null)
	const [ideasCount, setIdeasCount] = useState<number>(0)
	const [scriptsCount, setScriptsCount] = useState<number>(0)
	const [todosCount, setTodosCount] = useState<number>(0)
	const [loading, setLoading] = useState<boolean>(true)

	const pathname = usePathname();
  const currentLang = pathname.split('/')[1] || 'en';


	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true)
				const { data: { user }, error: userError } = await supabase.auth.getUser()
				
				if (userError) throw userError

				const [
					{ data: userData, error: userDataError },
					{ count: ideasCount, error: ideasError },
					{ count: scriptsCount, error: scriptsError },
					{ count: todosCount, error: todosError }
				] = await Promise.all([
					supabase.from('users').select('*').eq('auth_user_id', user?.id).single(),
					supabase.from('ideas').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
					supabase.from('scripts').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
					supabase.from('todos').select('*', { count: 'exact', head: true }).eq('user_id', user?.id)
				])

				if (userDataError) throw userDataError
				if (ideasError) throw ideasError
				if (scriptsError) throw scriptsError
				if (todosError) throw todosError


				setUserData(userData)
				setIdeasCount(ideasCount || 0)
				setScriptsCount(scriptsCount || 0)
				setTodosCount(todosCount || 0)
			} catch (userDataError) {
				console.error('Error fetching dashboard data:', userDataError)
				redirect(`/${currentLang}`)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [supabase, currentLang])

	if (userData?.yt_username === null) {
		redirect(`/${currentLang}/profile`)
	}

	if (loading) return <Loader position='full' />

	console.log(ideasCount, scriptsCount)

	return (
		<section>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<LayoutDashboardIcon />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
				</div>
				<Separator className='my-4' />
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 mb-6">
				<InfoCard title='YOUR CHANNEL' description={`@${userData?.yt_username ? userData?.yt_username : 'No channel connected'}`}>
					<p className='text-sm text-muted-foreground flex items-center gap-2'>
						100 
						<Users />
					</p>
				</InfoCard>

				<InfoCard title='YOUR ACTIVITY' description='Content count'>
					<p className='text-sm text-muted-foreground flex items-center gap-2'>
						Ideas {ideasCount}
					</p>
					<Separator orientation='vertical' className='h-4' />
					<p className='text-sm text-muted-foreground flex items-center gap-2'>
						Scripts {scriptsCount}
					</p>
				</InfoCard>
					

				<InfoCard title='YOUR PRODUCTION' description='Total todos'>
					<p className='text-sm text-muted-foreground flex items-center gap-2'>
						{todosCount}
						<CircleCheckBig />
					</p>
				</InfoCard>
			</div>

			


			<div className='fixed bottom-5 right-5'>
				<Button className='bg-black hover:bg-black/80 w-fit' asChild>
					<Link href='/ideas/create'>
						<PlusIcon className="mr-2 h-4 w-4" />
						Crea Idea
					</Link>
				</Button>
			</div>
		</section>
	)
}


const InfoCard = ({ title, description, children } : { title: string, description: string, children: React.ReactNode }) => {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle>
					<h3 className='text-sm text-muted-foreground'>{title}</h3>
					<h2 className='text-2xl font-bold'>{description}</h2>
				</CardTitle>
				<CardDescription className='flex items-center gap-2'>
					{children}
				</CardDescription>
			</CardHeader>
		</Card>
	)
}


export default DashboardPage