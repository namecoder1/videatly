import React from 'react'
import CustomIcon from '@/components/ui/custom-icon'
import { BarChartIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

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
		</section>
	)
}

export default AnalyticsPage