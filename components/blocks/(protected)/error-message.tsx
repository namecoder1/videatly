'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, OctagonX } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ErrorMessage = ({ error }: { error: string }) => {
  const router = useRouter()

  return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 mx-4">
      <hgroup className='flex flex-col items-center justify-center mb-6'>
        <h2 className='text-red-500 mb-2 text-3xl font-semibold flex items-center gap-1.5'><OctagonX className='w-8 h-8' /> Error</h2>
        <h3 className='max-w-sm text-center'>{error}</h3>
      </hgroup>
      <Button onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Go Back
      </Button>
    </div>
  )
}

export default ErrorMessage