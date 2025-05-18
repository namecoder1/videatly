'use client'
import { Separator } from '@/components/ui/separator'
import { Link2, Tag } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { IdeaData, TodoProps } from '@/types/types'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { useDictionary } from '@/app/context/dictionary-context'
import { enUS, es, fr, it } from 'date-fns/locale'

// Map of supported locales
const localeMap: Record<string, any> = {
  'en-US': enUS,
  'es': es,
  'fr': fr,
  'it': it,
}

const TodoLittle = React.forwardRef<HTMLDivElement, { todo: TodoProps, showDate?: boolean, showIdea?: boolean, onClick?: () => void, className?: string }>(
   ({ todo, showDate = true, showIdea = false, onClick, className }, ref) => {
    const [idea, setIdea] = useState<IdeaData | null>(null)
    const dict = useDictionary()
    const localeString = dict.calendarPage?.locale || 'en-US'
    const dateLocale = localeMap[localeString] || enUS

    useEffect(() => {
      const fetchIdea = async () => {
        const supabase = createClient()
        const { data: idea } = await supabase.from('ideas').select('*').eq('id', todo.idea_id).single()
        setIdea(idea)
      }
      fetchIdea()
    }, [todo.idea_id])

    // Parse dates safely
    const startDate = todo.start_date ? parseISO(todo.start_date) : null
    const endDate = todo.end_date ? parseISO(todo.end_date) : null

    return (
      <div 
        ref={ref}
        className={`group duration-200 ease-in-out bg-background/80 backdrop-blur-sm flex rounded-2xl items-center justify-between gap-3 border shadow-sm ${todo.priority === 'high' ? 'border-red-500/50 hover:border-red-500 bg-red-100/50 dark:bg-red-950/20' : todo.priority === 'medium' ? 'border-yellow-500/50 hover:border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20' : 'border-green-500/50 hover:border-green-500 bg-green-100/50 dark:bg-green-950/20'} p-3 ${className} w-full`} 
        onClick={onClick}
      >
        <div className="flex flex-col gap-1.5">
          {showDate && (
            <Badge variant="outline" className="flex items-center gap-1.5 w-fit text-xs font-normal">
              <Tag size={12} className="opacity-70" />
              {todo.category}
            </Badge>
          )}
          <h3 className="text-base font-medium leading-tight">{todo.title.slice(0, 32)}</h3>
          {!showIdea && (
            <p className='text-xs text-muted-foreground line-clamp-2'>{todo.description}</p>
          )}
          {showDate && startDate && (
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              {format(startDate, 'MMM d, yyyy', { locale: dateLocale }).charAt(0).toUpperCase() + format(startDate, 'MMM d, yyyy', { locale: dateLocale }).slice(1)}
            </p>
          )}
          {showIdea && (
            <Link 
              href={`/ideas/${idea?.id}`} 
              className="text-xs text-muted-foreground flex items-center gap-1.5 max-w-[180px] sm:max-w-[200px] lg:max-w-[150px] xl:max-w-[200px] w-full hover:text-foreground group-hover:underline underline-offset-2 transition-colors"
            >
              <Link2 size={12} className="opacity-70" />
              <span className="truncate">{idea?.title}</span>
            </Link>
          )}
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {startDate && (
            <p>{format(startDate, 'HH:mm', { locale: dateLocale })}</p>
          )}
          <Separator className="my-1 opacity-50" />
          {endDate && (
            <p>{format(endDate, 'HH:mm', { locale: dateLocale })}</p>
          )}
        </div>
      </div>
    )
  }
)

TodoLittle.displayName = 'TodoLittle'

export default TodoLittle