'use client';

import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'
import Loader from '@/components/blocks/loader'
import { Video } from 'lucide-react';
import CustomIcon from '@/components/ui/custom-icon';
import { IdeaData, ScriptData, TodoProps } from '@/types/types';
import ErrorMessage from '@/components/blocks/(protected)/error-message';
import { Separator } from '@/components/ui/separator';
import { useDictionary } from '@/app/context/dictionary-context';
import Calendar from '@/components/calendar/calendar';
import { Mode } from '@/components/calendar/calendar-types';


const ProductionIdPage = ({ params }: { params: { id: string } }) => {
  const { id } = params
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<IdeaData & { scripts: ScriptData[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<TodoProps[]>([])
  const [daysWithTodos, setDaysWithTodos] = useState<string[]>([])
  const [mode, setMode] = useState<Mode>('month')
  const dict = useDictionary()

  const fetchTodosForIdea = async () => {
    try {
      const supabase = createClient()
      const { data: ideaTodos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('idea_id', id)
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Failed to fetch todos for idea:', error)
        return []
      }
      
      setEvents(ideaTodos || [])
      return ideaTodos || []
    } catch (err) {
      console.error('Error fetching todos for idea:', err)
      return []
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        const { data: ideaWithScripts, error } = await supabase
          .from('ideas')
          .select(`
            *,
            scripts!inner(*)
          `)
          .eq('id', id)
          .single()

        // Fetch all todos for this idea
        await fetchTodosForIdea()
        
        // Fetch days with todos for the calendar highlighting
        const { data: todosDates, error: dateError } = await supabase
          .from('todos')
          .select('start_date')
          .eq('idea_id', id)

        if (dateError) {
          console.error('Error fetching todo dates:', dateError)
        } else {
          const uniqueDates = [...new Set(todosDates?.map(todo => todo.start_date) || [])]
          setDaysWithTodos(uniqueDates)
        }

        if (error) {
          setError('Failed to load production data')
          return
        }

        if (!ideaWithScripts) {
          setError('Production not found')
          return
        }

        setData(ideaWithScripts)
      } catch (err) {
        setError('An unexpected error occurred')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, fetchTodosForIdea])

  const handleTodoUpdate = async () => {
    await fetchTodosForIdea()
    
    // Refresh days with todos
    const supabase = createClient()
    const { data: todosDates, error: dateError } = await supabase
      .from('todos')
      .select('start_date')
      .eq('idea_id', id)

    if (dateError) {
      console.error('Error fetching todo dates:', dateError)
    } else {
      const uniqueDates = [...new Set(todosDates?.map(todo => todo.start_date) || [])]
      setDaysWithTodos(uniqueDates)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  // Function to add custom classes to calendar days
  const dayClassNames = (date: Date) => {
    // Check if the date is the publication date
    if (data?.pub_date) {
      const pubDate = new Date(data.pub_date)
      if (pubDate.toLocaleDateString() === date.toLocaleDateString()) {
        return 'bg-red-100 dark:bg-red-900/20 border-2 border-red-500'
      }
    }
    return ''
  }

  if (isLoading) return <Loader position='full' />

  if (error) return <ErrorMessage error={error} />

  if (!data) return <ErrorMessage error='No data found' />

  return (
    <section>
      <div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<Video />} color='red' />
          <h1 className='text-lg sm:text-2xl md:text-3xl font-bold tracking-tight mr-16'>{data.title}</h1>
        </div>
        <Separator className='my-2' />
      </div>

      <Calendar
        events={events}
        setEvents={setEvents}
        mode={mode}
        setMode={setMode}
        date={selectedDate}
        setDate={handleDateSelect}
        onTodoUpdate={handleTodoUpdate}
        ideas={[data]}
        daysWithTodos={daysWithTodos}
        dict={dict}
        dayClassNames={dayClassNames}
      />
    </section>
  )
}

export default ProductionIdPage