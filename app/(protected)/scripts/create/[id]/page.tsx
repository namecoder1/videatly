import CustomIcon from '@/components/ui/custom-icon'
import { Separator } from '@/components/ui/separator'
import { Info, Lightbulb } from 'lucide-react'
import React from 'react'

const ScriptPage = () => {
	return (
		<section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<Info />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>Script's Info</h1>
        </div>
        <Separator className='my-4' />
      </div>

		</section>
	)
}

export default ScriptPage