import React from 'react'
import CustomIcon from '@/components/ui/custom-icon'
import { CalendarIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const CalendarPage = () => {
	return (
		<section>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<CalendarIcon />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>Calendar</h1>
				</div>
				<Separator className='my-4' />
			</div>
		</section>
	)
}

export default CalendarPage