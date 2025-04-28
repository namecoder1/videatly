import { Separator } from '@/components/ui/separator'
import CustomIcon from '@/components/ui/custom-icon'
import { MessagesSquare } from 'lucide-react'
import React from 'react'

const ScriptsPage = () => {
	return (
		<section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<MessagesSquare />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>Script's Chat</h1>
        </div>
        <Separator className='my-4' />
      </div>
		</section>
	)
}

export default ScriptsPage