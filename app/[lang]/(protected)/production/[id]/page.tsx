'use client';

import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'
import Loader from '@/components/blocks/loader'
import { Video, Calendar as CalendarIcon, CalendarPlus } from 'lucide-react';
import CustomIcon from '@/components/ui/custom-icon';
import { IdeaData, ScriptData } from '@/types/types';
import ErrorMessage from '@/components/blocks/(protected)/error-message';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { fetchTodos } from './actions';
import { TodoCreator } from '@/components/ui/todo-creator';
import IsPubDate from '@/components/blocks/(protected)/is-pub-date';
import Link from 'next/link';
import { useDictionary } from '@/app/context/dictionary-context';


const ProductionIdPage = ({ params }: { params: { id: string } }) => {
  const { id } = params
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<IdeaData & { scripts: ScriptData[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [events, setEvents] = useState<any[]>([])
	const [todoOpen, setTodoOpen] = useState(false)
  const [daysWithTodos, setDaysWithTodos] = useState<string[]>([])
	const dict = useDictionary()

	const today = new Date()

  const fetchTodosForMonth = async () => {
    const supabase = createClient()
    const { data: allTodos, error: todosError } = await supabase
      .from('todos')
      .select('date')
      .eq('idea_id', id)

    if (todosError) {
      console.error('Failed to fetch todos:', todosError)
    } else {
      const uniqueDates = [...new Set(allTodos?.map(todo => todo.date) || [])]
      setDaysWithTodos(uniqueDates)
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

        await fetchTodosForMonth()

        if (selectedDate) {
          const formattedDate = selectedDate.toISOString().split('T')[0]
          const { data: todos, error: todosError } = await fetchTodos(formattedDate)
          if (todosError) {
            console.error('Failed to fetch todos:', todosError)
          }
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
  }, [id, selectedDate, fetchTodosForMonth])



  const handleTodayClick = () => {
    setSelectedDate(today)
  }

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const formattedDate = date.toLocaleDateString('en-CA')
      const { data: todos, error: todosError } = await fetchTodos(formattedDate)
      if (todosError) {
        console.error('Failed to fetch todos:', todosError)
      } else {
        setEvents(todos || [])
      }
    }
  }

  const handleTodoUpdate = async () => {
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-CA')
      const { data: todos, error: todosError } = await fetchTodos(formattedDate)
      if (todosError) {
        console.error('Failed to fetch todos:', todosError)
      } else {
        setEvents(todos || [])
      }
    }
    await fetchTodosForMonth()
  }

  const isPublicationDate = (date: Date) => {
    if (!data?.pub_date) return false
    const pubDate = new Date(data.pub_date)
    return pubDate.toLocaleDateString() === date.toLocaleDateString()
  }

  const hasTodos = (date: Date) => {
    const dateString = date.toLocaleDateString('en-CA')
    return daysWithTodos.includes(dateString)
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

			{!data.pub_date && (
				<div className='w-full bg-red-100 border border-red-300 rounded-full p-2 flex items-center justify-between'>
					<p className='text-sm text-red-500 ml-2'>The video idea of this production has no publication date set.</p>
					<Button variant='outline' size='sm' asChild>
						<Link href={`/ideas/${data.id}`} className='text-sm text-red-500'>
						<CalendarPlus />
							Set a Publication Date
						</Link>
					</Button>
				</div>
			)} 

			<h2 className='text-xl font-semibold mb-2 mt-4'>Schedule</h2>
			<div className='flex flex-col gap-6'>
				<div className='flex gap-4 lg:flex-row flex-col'>
					<Calendar 
						className='w-full bg-card rounded-3xl' 
						showOutsideDays 
						weekStartsOn={1} 
						selected={selectedDate}
						onSelect={handleDateSelect}
						mode="single"
						modifiers={{
							publication: (date) => isPublicationDate(date),
							hasTodos: (date) => hasTodos(date)
						}}
						modifiersStyles={{
							publication: { backgroundColor: 'rgb(239 68 68)', color: 'white' },
							hasTodos: { border: '2px dotted rgb(19 10 10)'}
						}}
						classNames={{
							months: "flex flex-col  space-y-4 sm:space-x-4 sm:space-y-0",
							month: "space-y-4",
							caption: "flex justify-center pt-1 pb-2 relative items-center",
							caption_label: "text-lg font-medium",
							nav: "space-x-1 flex items-center",
							nav_button: cn(
								buttonVariants({ variant: "outline" }),
								"h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100"
							),
							nav_button_previous: "absolute left-1",
							nav_button_next: "absolute right-1",
							table: "w-full border-collapse space-y-1",
							head_row: "flex",
							head_cell: "text-muted-foreground rounded-md w-full font-normal text-base",
							row: "flex w-full mt-1",
							cell: "flex-1 w-full h-full rounded-2xl  sm:mx-1 text-center text-base p-1.5 sm:p-3 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/20  first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
							day: "rounded-2xl w-full xl:h-8 p-0.5 font-normal aria-selected:bg-red-100",
							day_range_end: "day-range-end",
							day_selected: "bg-primary  hover:bg-primary focus:bg-primary",
							day_today: "border-2 border-red-200 text-black",
							day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
							day_disabled: "text-muted-foreground opacity-50",
							day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
							day_hidden: "invisible"
							
						}}
					/>
					
					{selectedDate ? (
						<Card className="p-6 w-full max-w-5xl">
							<CardHeader className="flex flex-row p-0 gap-2 items-center justify-between">
								<CardTitle className="text-lg font-semibold">
									{formatDate(selectedDate, 'normal')}
								</CardTitle>
								<CardDescription>
									<div className='flex justify-between items-center'>
										<Button 
											variant="black" 
											size="sm" 
											onClick={handleTodayClick}
											className="gap-2"
										>
											<CalendarIcon className="h-4 w-4" />
											Today
										</Button>
									</div>
								</CardDescription>
							</CardHeader>
							<Separator className='my-2' />
							{events.length > 0 || isPublicationDate(selectedDate) ? (
								<CardContent className='px-0 flex flex-col gap-2'>
									{isPublicationDate(selectedDate) && (
										<IsPubDate props={data} dict={dict} />
									)}
									{events.length > 0 && (
										<div className="flex flex-col gap-1.5">
											{events.map((event) => (
												<TodoCreator 
													key={event.id}
													defaultValue={selectedDate} 
													ideaId={data.id} 
													scriptId={data.scripts[0].id} 
													userId={data.scripts[0].user_id} 
													todo={event}
													mode="update"
													onUpdate={handleTodoUpdate}
												/>
											))}
										</div>
									)}
								</CardContent>
							) : (
								<CardContent className='lg:p-4 pt-4 lg:pt-0 flex flex-col items-center justify-center gap-2 h-full'>
									<p className="text-muted-foreground text-center">{dict.productionPage.noEvents}</p>
									<TodoCreator 
										defaultValue={selectedDate} 
										ideaId={data.id} 
										scriptId={data.scripts[0].id} 
										userId={data.scripts[0].user_id} 
										mode="create"
										onUpdate={handleTodoUpdate}
									/>
								</CardContent>
							)}
						</Card>
					) : (
						<Card className="p-6 w-full max-w-5xl">
							<CardHeader className="flex flex-row p-0 gap-2 items-center justify-between">
								<CardTitle className="text-lg font-semibold">
									Select a date
								</CardTitle>
								<CardDescription>
									<div className='flex justify-between items-center'>
										<Button 
											disabled
											variant="black" 
											size="sm" 
											onClick={handleTodayClick}
											className="gap-2"
										>
											<CalendarIcon className="h-4 w-4" />
											Today
										</Button>
									</div>
								</CardDescription>
							</CardHeader>
							<Separator className='my-2' />
							<CardContent className=' p-4 flex flex-col items-center justify-center gap-2 h-full'>
								<p className="text-muted-foreground">Select a date to view or add events</p>
							</CardContent>
						</Card>
					)}
				</div>

			</div>
			{selectedDate && events.length !== 0 && (
				<TodoCreator 
					defaultValue={selectedDate} 
					ideaId={data.id} 
					scriptId={data.scripts[0].id} 
					userId={data.scripts[0].user_id} 
					className='absolute bottom-4 right-4' 
					mode="create"
					onUpdate={handleTodoUpdate}
				/>
			)}
    </section>
  )
}

export default ProductionIdPage