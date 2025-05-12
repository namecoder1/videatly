import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Blocked = ({ text } : { text: string }) => {
  return (
    <Card className='p-4 dark:border-card border-input bg-white dark:bg-transparent max-w-2xl flex flex-col justify-start gap-y-2 sm:flex-row sm:items-center sm:justify-between'>
      <p className='text-muted-foreground text-sm max-w-sm sm:mr-10'>{text}</p>
      <Button variant='black' className='w-fit ml-auto sm:ml-0' asChild>
        <Link href='/pricing' className='flex items-center gap-x-2'>
          <Sparkles size={16} />  
          Upgrade
        </Link>
      </Button>
    </Card>
  )
}

export default Blocked