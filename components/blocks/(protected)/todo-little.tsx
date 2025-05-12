'use client'
import { Separator } from '@/components/ui/separator'
import { formatStringDate } from '@/lib/utils'
import { Link2, Tag } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { IdeaData, TodoProps } from '@/types/types'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const TodoLittle = React.forwardRef<HTMLDivElement, { todo: TodoProps, showDate?: boolean, showIdea?: boolean, onClick?: () => void, className?: string }>(
   ({ todo, showDate = true, showIdea = false, onClick, className }, ref) => {
    const [idea, setIdea] = useState<IdeaData | null>(null)

    useEffect(() => {
      const fetchIdea = async () => {
        const supabase = createClient()
        const { data: idea } = await supabase.from('ideas').select('*').eq('id', todo.idea_id).single()
        setIdea(idea)
      }
      fetchIdea()
    }, [todo.idea_id])

    return (
      <div 
        ref={ref}
        className={`bg-gray-100/80 flex rounded-3xl items-center justify-between gap-2 border-2  ${todo.priority === 'high' ? 'border-red-500 bg-red-500/10' : todo.priority === 'medium' ? 'border-yellow-500 bg-yellow-500/10' : 'border-green-500 bg-green-500/10'} p-4 ${className}`} 
        onClick={onClick}
      >
        <div className="flex flex-col gap-1">
          {showDate && (
            <p className="text-base font-semibold flex items-center gap-1">
              {formatStringDate(todo.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </p>
          )}
          {!showDate && (
            <Badge variant="black" className="flex items-center gap-1 w-fit">
              <Tag size={10} className="mt-0.5" />
              <p className="text-xs">{todo.category}</p>
            </Badge>
          )}
          <h3 className="text-sm font-medium">{todo.title.slice(0, 32)}</h3>
          {!showIdea && (
            <p className='text-xs text-muted-foreground'>{todo.description}</p>
          )}
          {showIdea && (
            <Link href={`/ideas/${idea?.id}`} className="text-xs text-muted-foreground flex items-center gap-1 max-w-[180px] sm:max-w-[200px] lg:max-w-[150px] xl:max-w-[200px] w-full hover:underline underline-offset-2">
              <Link2 size={14} className="mt-0.5" />
              {idea?.title.slice(0, 24)}...
            </Link>
          )}        </div>
        <span className="text-xs text-muted-foreground">
          <p>{formatStringDate(todo.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <Separator className="my-1" />
          <p>{formatStringDate(todo.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </span>
      </div>
    )
  }
)

TodoLittle.displayName = 'TodoLittle'

export default TodoLittle