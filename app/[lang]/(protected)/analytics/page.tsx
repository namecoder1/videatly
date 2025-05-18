import React from 'react'
import CustomIcon from '@/components/ui/custom-icon'
import { BarChartIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import YoutubeAnalyticsClient from '@/components/blocks/(protected)/youtube-analytics-client'

const AnalyticsPage = () => {
	
	return (
		<section>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<BarChartIcon />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>Analytics</h1>
				</div>
				<Separator className='my-4' />
			</div>
			<YoutubeAnalyticsClient />
		</section>
	)
}

export default AnalyticsPage