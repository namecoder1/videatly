import React from 'react'
import { ArrowRight, CircleHelp, Lightbulb, PlusIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import CustomIcon from '@/components/ui/custom-icon'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import IdeaBox from '@/components/blocks/(protected)/idea-box'

const IdeasPage = async () => {
	const supabase = await createClient()

	const { data: ideas, error } = await supabase.from('ideas').select('*')

	if (error) {
		console.error(error)
	}

	return (
		<section>
      <div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<Lightbulb />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>Ideas</h1>
        </div>
        <Separator className='my-4' />
      </div>

      <div>
        <h2 className='text-2xl font-bold tracking-tight mb-4'>Your Ideas</h2>
        {ideas && ideas.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {ideas.map((idea) => (
              <IdeaBox key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-full my-20'>
            <h3 className='text-gray-500 text-lg font-semibold mb-1 flex items-center gap-1'>
              <CircleHelp className='w-5 h-5' /> No ideas found
            </h3>
            <p className='text-gray-500 text-sm'>
              Start creating ideas by clicking the button below
          </p>
          </div>
        )}  
      </div>
      <div className='absolute bottom-5 right-5 flex flex-col gap-2 items-end'>
        <Button className='bg-black hover:bg-black/80 w-fit' asChild>
          <Link href='/ideas/create'>
            <PlusIcon />
            New Idea
          </Link>
        </Button>
      </div>
    </section>
	)
}

export default IdeasPage