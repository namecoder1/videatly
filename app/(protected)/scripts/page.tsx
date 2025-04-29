import ScriptBox from '@/components/blocks/(protected)/script-box'
import CustomIcon from '@/components/ui/custom-icon'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/utils/supabase/server'
import { CircleHelp, NotepadText } from 'lucide-react'
import React from 'react'

const ScriptsPage = async () => {
	const supabase = await createClient()
	const { data: scripts, error } = await supabase.from('scripts').select('*')

	return (
		<section>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<NotepadText />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>Scripts</h1>
					</div>
					<Separator className='my-4' />
			</div>
			<div>
        <h2 className='text-2xl font-bold tracking-tight'>Your Scripts</h2>
        {scripts && scripts.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {scripts.map((script) => (
              <ScriptBox key={script.id} props={script} />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full my-20'>
            <h3 className='text-gray-500 text-lg font-semibold mb-1 flex items-center gap-1'>
              <CircleHelp className='w-5 h-5' /> No scripts found
            </h3>
            <p className='text-gray-500 text-sm'>
              Start creating scripts by clicking the button below
          </p>
          </div>
        )}  
      </div>
		</section>
	)
}

export default ScriptsPage