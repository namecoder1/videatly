import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { IdeaData } from '@/types/types'
import { CalendarPlus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'


const IsPubDate = ({ props } : { props: IdeaData }) => {

  const { title } = props
  return (
    <Card>
      <CardHeader className='p-4'>
        <p className='flex items-center gap-2 text-sm text-muted-foreground'>
          <CalendarPlus size={16} className='text-primary' />
          Publishing Date for
        </p>
        <p className='text-md font-semibold pb-1 sm:pb-0'>
          {title}
        </p>
        <Button variant='outline' size='sm' className='w-full sm:w-fit sm:ml-auto mt-1'>
          <Link href={`/ideas/${props.id}`}>
            View Idea
          </Link>
        </Button>
      </CardHeader>
    </Card>
  )
}

export default IsPubDate