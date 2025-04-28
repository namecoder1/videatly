import CustomIcon from '@/components/ui/custom-icon'
import { Separator } from '@/components/ui/separator'
import { CirclePlus } from 'lucide-react'
import React from 'react'

const CreateScriptPage = () => {
	return (
		<section>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<CirclePlus />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>Create Script</h1>
					</div>
					<Separator className='my-4' />
			</div>
		</section>
	)
}

export default CreateScriptPage