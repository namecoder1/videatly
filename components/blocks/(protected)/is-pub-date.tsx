import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { IdeaData } from '@/types/types'
import { CalendarPlus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'


const IsPubDate = ({ props, dict } : { props: IdeaData, dict: any }) => {

  const { title } = props
  return (
    <Card>
      <CardHeader className='p-4'>
        <p className='flex items-center gap-2 text-sm text-muted-foreground'>
          <CalendarPlus size={16} className='text-primary' />
          {dict.calendarPage.publishingDateFor}
        </p>
        <p className='text-md font-semibold pb-1 sm:pb-0'>
          {title}
        </p>
        <Button variant='outline' size='sm' className='w-full sm:w-fit sm:ml-auto mt-1'>
          <Link href={`/ideas/${props.id}`}>
            {dict.calendarPage.viewIdea}
          </Link>
        </Button>
      </CardHeader>
    </Card>
  )
}

export default IsPubDate