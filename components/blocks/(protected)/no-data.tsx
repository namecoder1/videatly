'use client'

import { Button } from '@/components/ui/button'
import { CircleHelp } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const NoData = ({ title, description, link }: { title: string, description: string, link?: string }) => {
  return (
    <div className='flex flex-col items-center justify-center text-center h-full py-20 rounded-3xl border-2 border-border gap-1 bg-card'>
      <CircleHelp size={40} className='mb-2' /> 
      <h3 className='text-lg font-semibold'>
        {title}
      </h3>
      <p className='text-gray-500 text-sm mx-4'>
        {description}
      </p>	
      {link && (
        <Button asChild variant='black' className='mt-3'>
          <Link href={link}>
            Create
          </Link>
        </Button>
      )}
    </div>
  )
}

export default NoData