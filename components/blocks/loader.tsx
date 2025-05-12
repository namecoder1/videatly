import { Loader2 } from 'lucide-react'
import React from 'react'

const Loader = ({ position = 'full', text, color }: { position?: 'full' | 'center', text?: boolean, color?: string }) => {
  return (
    <div className={`flex items-center justify-center ${position === 'full' ? 'min-h-screen' : ''}`}>
      <div className='flex flex-col items-center gap-4'>
        <Loader2 className={`w-12 h-12 animate-spin ${color ? `text-${color}` : 'text-primary'}`} />
        {text && <p className="text-muted-foreground">Loading data...</p>}
      </div>
  </div>
  )
}

export default Loader