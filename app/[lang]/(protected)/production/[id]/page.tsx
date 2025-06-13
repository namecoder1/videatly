'use client';

import { createClient } from '@/utils/supabase/client'
import React, { useEffect, useState } from 'react'
import Loader from '@/components/blocks/loader'
import { Video, Edit, Save, X, Paintbrush, Film, Target, Clock4, ArrowRight } from 'lucide-react';
import CustomIcon from '@/components/ui/custom-icon';
import { IdeaData, ProductionData, ScriptData, ScriptSection, TodoProps } from '@/types/types';
import ErrorMessage from '@/components/blocks/(protected)/error-message';
import { Separator } from '@/components/ui/separator';
import { useDictionary } from '@/app/context/dictionary-context';
import Calendar from '@/components/calendar/calendar';
import { Mode } from '@/components/calendar/calendar-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEnumTranslation } from '@/utils/enum-translations';
import { useSidebarViewport } from '@/hooks/use-sidebar-viewport';



const ProductionIdPage = ({ params }: { params: { id: string } }) => {
  const { id } = params
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<(ProductionData & { ideas: IdeaData & { scripts: ScriptData[] } }) | null>(null)  
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<TodoProps[]>([])
  const [daysWithTodos, setDaysWithTodos] = useState<string[]>([])
  const [mode, setMode] = useState<Mode>('month')
  const dict = useDictionary()
  const locale = dict.locale || 'it'
  const { gridClasses, cardClasses } = useSidebarViewport();
  const { container } = gridClasses;
  const [isGeneratingTodos, setIsGeneratingTodos] = useState(false)
  const [script, setScript] = useState<ScriptData | null>(null)
  const [idea, setIdea] = useState<IdeaData | null>(null)
  const [isEditingIdea, setIsEditingIdea] = useState(false)
  const [isEditingScript, setIsEditingScript] = useState(false)
  const [editedIdea, setEditedIdea] = useState<IdeaData | null>(null)
  const [editedScript, setEditedScript] = useState<ScriptData | null>(null)

  const fetchTodosForIdea = async () => {
    try {
      const supabase = createClient()
      console.log('fetchTodosForIdea - id produzione:', id, 'id idea:', data?.idea_id)
      const { data: ideaTodos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('idea_id', data?.idea_id)
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Failed to fetch todos for idea:', error)
        return null
      }
      
      // Only update state if we have todos
      if (ideaTodos) {
        setEvents(ideaTodos)
      }
      return ideaTodos || []
    } catch (err) {
      console.error('Error fetching todos for idea:', err)
      return null
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        setIsLoading(true)

        // Fetch production data with complete idea and script information
        const { data: productionData, error: productionError } = await supabase
          .from('production')
          .select(`
            *,
            ideas:idea_id (*)
          `)
          .eq('id', id)
          .single()

        if (productionError) {
          console.error(productionError)
          setError('Failed to fetch production data')
          setIsLoading(false)
          return
        }

        setData(productionData)
        setIdea(productionData.ideas)

        // If production is pending, start polling for todos
        if (productionData.status === 'pending') {
          setIsGeneratingTodos(true)
          startPolling()
        } else {
          // If production is completed, fetch todos
          const { data: todosData, error: todosError } = await supabase
            .from('todos')
            .select('*')
            .eq('idea_id', productionData.idea_id)
            .order('start_date', { ascending: true })

          if (todosError) {
            console.error(todosError)
          } else {
            setEvents(todosData)
          }
        }

        // Fetch complete script data
        const { data: scriptData, error: scriptError } = await supabase
          .from('scripts')
          .select('*')
          .eq('idea_id', productionData.idea_id)
          .single()

        if (scriptError) {
          console.error('Failed to fetch script:', scriptError)
        } else {
          setScript(scriptData)
        }

        // Fetch days with todos for the calendar highlighting
        const { data: todosDates, error: dateError } = await supabase
          .from('todos')
          .select('start_date')
          .eq('idea_id', productionData.idea_id)

        if (dateError) {
          console.error('Error fetching todo dates:', dateError)
        } else {
          const uniqueDates = [...new Set(todosDates?.map(todo => todo.start_date) || [])]
          setDaysWithTodos(uniqueDates)
        }

        setIsLoading(false)
      } catch (err) {
        setError('An unexpected error occurred')
        console.error(err)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const startPolling = () => {
    const pollInterval = setInterval(async () => {
      const supabase = createClient()
      const { data: productionData, error: productionError } = await supabase
        .from('production')
        .select('*')
        .eq('id', id)
        .single()

      if (productionError) {
        console.error(productionError)
        return
      }

      if (productionData.status === 'completed') {
        clearInterval(pollInterval)
        setIsGeneratingTodos(false)
        setData(productionData)

        // Fetch todos
        const { data: todosData, error: todosError } = await supabase
          .from('todos')
          .select('*')
          .eq('idea_id', productionData.idea_id)
          .order('start_date', { ascending: true })

        if (todosError) {
          console.error(todosError)
        } else {
          setEvents(todosData)
        }
      }
    }, 2000) // Poll every 2 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval)
  }

  const handleTodoUpdate = async () => {
    // Store current state before any updates
    const currentEvents = [...events]
    const currentDaysWithTodos = [...daysWithTodos]

    try {
      // First fetch todos for this idea
      const updatedTodos = await fetchTodosForIdea()
      
      // Then fetch all dates to maintain consistency
      const supabase = createClient()
      const { data: todosDates, error: dateError } = await supabase
        .from('todos')
        .select('start_date')
        .eq('idea_id', data?.idea_id)

      if (dateError) {
        console.error('Error fetching todo dates:', dateError)
        // Restore previous state if there's an error
        setEvents(currentEvents)
        setDaysWithTodos(currentDaysWithTodos)
        return
      }

      // Update both states atomically
      const uniqueDates = [...new Set(todosDates?.map(todo => todo.start_date) || [])]
      setEvents(updatedTodos || currentEvents) // Fallback to current events if no updates
      setDaysWithTodos(uniqueDates)
    } catch (error) {
      console.error('Error updating todos:', error)
      // Restore previous state on error
      setEvents(currentEvents)
      setDaysWithTodos(currentDaysWithTodos)
      console.log('clicked')
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    console.log('selected')
  }

  // Function to add custom classes to calendar days
  const dayClassNames = (date: Date) => {
    // Check if the date is the publication date
    if (idea?.pub_date) {
      const pubDate = new Date(idea.pub_date)
      if (pubDate.toLocaleDateString() === date.toLocaleDateString()) {
        return 'bg-red-100 dark:bg-red-900/20 border-2 border-red-500'
      }
    }
    return ''
  }

  const handleIdeaUpdate = async (updatedIdea: Partial<IdeaData>) => {
    if (!idea) return

    try {
      const supabase = createClient()
      const { data: updatedData, error } = await supabase
        .from('ideas')
        .update(updatedIdea)
        .eq('id', idea.id)
        .select()
        .single()

      if (error) {
        console.error('Failed to update idea:', error)
        return
      }

      setIdea(updatedData)
      // Update the data state as well
      if (data) {
        setData({
          ...data,
          ideas: updatedData
        })
      }
    } catch (error) {
      console.error('Error updating idea:', error)
    }
  }

  const handleScriptUpdate = async (updatedScript: Partial<ScriptData>) => {
    if (!script) return

    try {
      const supabase = createClient()
      const { data: updatedData, error } = await supabase
        .from('scripts')
        .update(updatedScript)
        .eq('id', script.id)
        .select()
        .single()

      if (error) {
        console.error('Failed to update script:', error)
        return
      }

      setScript(updatedData)
    } catch (error) {
      console.error('Error updating script:', error)
    }
  }

  const startEditingIdea = () => {
    setEditedIdea(idea)
    setIsEditingIdea(true)
  }

  const cancelEditingIdea = () => {
    setEditedIdea(null)
    setIsEditingIdea(false)
  }

  const saveIdeaChanges = async () => {
    if (!editedIdea || !idea) return

    await handleIdeaUpdate(editedIdea)
    setIsEditingIdea(false)
    setEditedIdea(null)
  }

  const startEditingScript = () => {
    setEditedScript(script)
    setIsEditingScript(true)
  }

  const cancelEditingScript = () => {
    setEditedScript(null)
    setIsEditingScript(false)
  }

  const saveScriptChanges = async () => {
    if (!editedScript || !script) return

    await handleScriptUpdate(editedScript)
    setIsEditingScript(false)
    setEditedScript(null)
  }

  if (isLoading) return <Loader position='full' />

  if (error) return <ErrorMessage error={error} />

  if (!data || !idea) return <ErrorMessage error='No data found' />

  return (
    <section className="relative min-h-[calc(100vh-4rem)]">
      {isGeneratingTodos ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <Loader position='full' />
          <p className="mt-4 text-lg">Generando i task di produzione...</p>
        </div>
      ) : (
        <section className='flex flex-col'>
          <div className='flex items-center gap-3'>
            <CustomIcon icon={<Video />} color='red' />
            <h1 className='text-lg sm:text-2xl md:text-3xl font-bold tracking-tight mr-16'>{idea.title}</h1>
          </div>
          <Separator className='my-2' />

          <Tabs defaultValue='calendar' className='mb-6'>
            <TabsList className='mb-4'>
              <TabsTrigger value='calendar'>Calendar</TabsTrigger>
              <TabsTrigger value='details'>Video Details</TabsTrigger>
            </TabsList>
         
            <TabsContent value='calendar'>
              <Calendar
                events={events}
                setEvents={setEvents}
                mode={mode}
                setMode={setMode}
                date={selectedDate}
                setDate={handleDateSelect}
                onTodoUpdate={handleTodoUpdate}
                ideas={idea ? [idea] : []}
                daysWithTodos={daysWithTodos}
                dict={dict}
                dayClassNames={dayClassNames}
                context='production'
              />
            </TabsContent>

            <TabsContent value='details' className='w-full'>
              <section className='flex flex-col gap-4 w-full'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-bold'>Video Details</h2>
                  {!isEditingIdea ? (
                    <Button onClick={startEditingIdea} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className='flex gap-2'>
                      <Button onClick={saveIdeaChanges} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={cancelEditingIdea} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className='mt-0.5 flex flex-1 flex-col-reverse xl:flex-row gap-4 w-full'>
                  {isEditingIdea && editedIdea ? (
                    <section className='w-full flex flex-col gap-4'>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='title'>
                          Title
                        </Label>
                        <Input
                          id='title'
                          value={editedIdea.title}
                          onChange={(e) => setEditedIdea({ ...editedIdea, title: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='description'>
                          Description
                        </Label>
                        <Textarea
                          value={editedIdea.description}
                          onChange={(e) => setEditedIdea({ ...editedIdea, description: e.target.value })}
                          className="w-full min-h-24"
                        />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='thumbnail_idea'>
                          Thumbnail Idea
                        </Label>
                        <Input
                          value={editedIdea.thumbnail_idea}
                          onChange={(e) => setEditedIdea({ ...editedIdea, thumbnail_idea: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='meta_description'>
                          Meta Description
                        </Label>
                        <Input
                          value={editedIdea.meta_description}
                          onChange={(e) => setEditedIdea({ ...editedIdea, meta_description: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='topics'>
                          Topics
                        </Label>
                        <Button>
                          Edit topics <ArrowRight />
                        </Button>
                      </div>
                    </section>
                  ) : (
                    <section className='flex flex-col gap-4 w-full'>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='title' className='font-bold'>
                          Title
                        </Label>
                        <p className='bg-white py-2 px-4 rounded-2xl border border-gray-200'>{idea.title}</p>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='title' className='font-bold'>
                          Description
                        </Label>
                        <p className='bg-white py-2 px-4 rounded-2xl border border-gray-200'>{idea.description}</p>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='title' className='font-bold'>
                          Thumbnail Idea
                        </Label>
                        <p className='bg-white py-2 px-4 rounded-2xl border border-gray-200'>{idea.thumbnail_idea}</p>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='title' className='font-bold'>
                          Meta Description
                        </Label>
                        <p className='bg-white py-2 px-4 rounded-2xl border border-gray-200'>{idea.meta_description}</p>
                      </div>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor='title' className='font-bold'>
                          Topics
                        </Label>
                        {
                          idea.topics && idea.topics.map((topic) => (
                            <p key={topic} className='bg-white py-2 px-4 rounded-2xl border border-gray-200'>{topic}</p>
                          ))
                        }
                      </div>
                    </section>
                  )}
                  <Card className='h-fit'>
                    <CardHeader>
                      <CardTitle>
                        Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className='grid grid-cols-2 gap-2'>
                      <div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
                        <Paintbrush className='w-4 h-4 min-w-4 min-h-4 text-blue-500 mr-2' />
                        <span className='text-sm font-medium'>{getEnumTranslation(idea.video_style, locale)}</span>
                      </div>
                      <div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
                        <Film className='w-4 h-4 min-w-4 min-h-4 text-purple-500 mr-2' />
                        <span className='text-sm font-medium'>{getEnumTranslation(idea.video_type, locale)}</span>
                      </div>
                      <div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
                        <Clock4 className='w-4 h-4 min-w-4 min-h-4 text-amber-500 mr-2' />
                        <span className='text-sm font-medium'>{getEnumTranslation(idea.video_length, locale)}</span>
                      </div>
                      <div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
                        <Target className='w-4 h-4 min-w-4 min-h-4 text-red-500 mr-2' />
                        <span className='text-sm font-medium hidden xl:block'>{getEnumTranslation(idea.video_target, locale).slice(0, 6)}..</span>
                        <span className='text-sm font-medium block xl:hidden'>{getEnumTranslation(idea.video_target, locale)}</span>
                      </div>
                    </div>
                    <h3 className='text-sm font-bold mt-4'>Tags</h3>
                    <div className='grid grid-cols-2 gap-2 items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
                        {idea?.tags && idea.tags.map((tag) => (
                          <span key={tag} className='text-sm font-medium px-2'>#{tag}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                


              </section>
            </TabsContent>

          </Tabs>
        </section>
      )}
    </section>
  )
}

export default ProductionIdPage