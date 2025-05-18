import React from 'react'

const TokensChat = ({ slot1, tokens, slot2 }: { slot1: string, tokens: number, slot2: string }) => {
  return (
    <div className='w-fit rounded-xl bg-gray-200'>
      <p className='px-2 py-1 text-sm text-muted-foreground'>{slot1} <span className='font-bold'>{tokens}</span> {slot2}</p>
    </div>
  )
}

export default TokensChat