'use client'
import React, { useEffect, useState} from 'react'
import Calendar from '@/components/calendar/calendar'
import { createClient } from '@/utils/supabase/client'
import  { TodoProps } from '@/types/types'
import { Mode } from '@/components/calendar/calendar-types'
import { Separator } from '@/components/ui/separator'
import CustomIcon from '@/components/ui/custom-icon'
import { Calendar as CalendarIcon } from 'lucide-react'
import Loader from '@/components/blocks/loader'
import { useDictionary } from '@/app/context/dictionary-context'

const CalendarPage = () => {
	const [ideas, setIdeas] = useState<any[]>([])
	const [todos, setTodos] = useState<TodoProps[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [mode, setMode] = useState<Mode>('month')
	const [date, setDate] = useState<Date>(new Date())
	const [daysWithTodos, setDaysWithTodos] = useState<string[]>([])
  const dict = useDictionary()

	// Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // Fetch ideas with scripts
        const { data: ideasWithScripts, error: ideasError } = await supabase
          .from('ideas')
          .select(`
            *,
            scripts(*)
          `)

        if (ideasError) {
          console.error('Error fetching ideas:', ideasError)
        } else {
          setIdeas(ideasWithScripts || [])
        }

        // Fetch all todos
        const { data: allTodos, error: todosError } = await supabase
          .from('todos')
          .select('*')
          .order('start_date', { ascending: true })

        if (todosError) {
          console.error('Error fetching todos:', todosError)
        } else {
          setTodos(allTodos || [])
        }

        // Get unique dates with todos for calendar highlighting
        const { data: todosDates, error: dateError } = await supabase
          .from('todos')
          .select('start_date')

        if (dateError) {
          console.error('Error fetching todo dates:', dateError)
        } else {
          const uniqueDates = [...new Set(todosDates?.map(todo => todo.start_date) || [])]
          setDaysWithTodos(uniqueDates)
        }
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to update todos after changes
  const handleTodoUpdate = async () => {
    try {
      const supabase = createClient()
      
      // Fetch all todos again
      const { data: updatedTodos, error } = await supabase
        .from('todos')
        .select('*')
        .order('start_date', { ascending: true })
      
      if (error) {
        console.error('Error updating todos:', error)
        return
      }
      
      setTodos(updatedTodos || [])
      
      // Update days with todos
      const { data: todosDates } = await supabase
        .from('todos')
        .select('start_date')
      
      const uniqueDates = [...new Set(todosDates?.map(todo => todo.start_date) || [])]
      setDaysWithTodos(uniqueDates)
    } catch (error) {
      console.error('Error updating todos:', error)
    }
  }

  // Add a function to handle date selection and fetch todos for that date
  const handleDateSelect = async (newDate: Date) => {
    try {
      setDate(newDate);
      const formattedDate = newDate.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
      
      const supabase = createClient();
      // Use start_date instead of date and use LIKE for timestamp comparison
      const { data: todosForDate, error } = await supabase
        .from('todos')
        .select('*')
        .like('start_date', `${formattedDate}%`); // Use LIKE to match the date part of the timestamp
        
      if (error) {
        console.error('Error fetching todos for date:', error);
      } else {
        console.log(`Fetched ${todosForDate?.length || 0} todos for ${formattedDate}`);
      }
      
      // Update the calendar view
      await handleTodoUpdate();
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  };

  if (isLoading) {
    return (
      <Loader position='full' />
    )
  }
	
	return (
		<section className="space-y-4">
      <div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<CalendarIcon />} color='red' />
          <h1 className='text-lg sm:text-2xl md:text-3xl font-bold tracking-tight mr-16'>{dict.calendarPage.title}</h1>
        </div>
        <Separator className='my-2' />
      </div>


        <Calendar
          events={todos}
          setEvents={setTodos}
          mode={mode}
          setMode={setMode}
          date={date}
          setDate={handleDateSelect}
          onTodoUpdate={handleTodoUpdate}
          ideas={ideas}
          daysWithTodos={daysWithTodos}
          dict={dict}
        />
    </section>
	)
}

export default CalendarPage