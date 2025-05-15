import { CalendarContext } from './calendar-context'
import { Mode } from './calendar-types'
import { useState } from 'react'
import { TodoProps } from '@/types/types'
import { TodoCreator } from '@/components/ui/todo-creator'

export default function CalendarProvider({
  events,
  setEvents,
  mode,
  setMode,
  date,
  setDate,
  calendarIconIsToday = true,
  onTodoUpdate,
  ideas = [],
  daysWithTodos = [],
  children,
  dict,
}: {
  events: TodoProps[]
  setEvents: (events: TodoProps[]) => void
  mode: Mode
  setMode: (mode: Mode) => void
  date: Date
  setDate: (date: Date) => void
  calendarIconIsToday: boolean
  onTodoUpdate?: () => Promise<void>
  ideas?: any[]
  daysWithTodos?: string[]
  children: React.ReactNode
  dict: any
}) {
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<TodoProps | null>(null)
  const [manageEventDialogOpen, setManageEventDialogOpen] = useState(false)

  // Get the first idea and script for default values
  const defaultIdeaId = ideas && ideas.length > 0 ? ideas[0].id : 0
  const defaultScriptId = ideas && ideas.length > 0 && ideas[0].scripts && ideas[0].scripts.length > 0 
    ? ideas[0].scripts[0].id : 0
  const userId = ideas && ideas.length > 0 ? ideas[0].user_id : ''

  // Handle closing todo creator when done
  const handleTodoUpdate = async () => {
    setNewEventDialogOpen(false)
    setManageEventDialogOpen(false)
    if (onTodoUpdate) {
      await onTodoUpdate()
    }
  }

  return (
    <CalendarContext.Provider 
      value={{
        events,
        setEvents,
        mode,
        setMode,
        date,
        setDate,
        calendarIconIsToday,
        newEventDialogOpen,
        setNewEventDialogOpen,
        manageEventDialogOpen,
        setManageEventDialogOpen,
        selectedEvent,
        setSelectedEvent,
        onTodoUpdate,
        ideas,
        daysWithTodos,
        dict,
      }}
    >
      {/* TodoCreator for creating new events */}
      <TodoCreator
        defaultValue={date}
        ideaId={defaultIdeaId}
        scriptId={defaultScriptId}
        userId={userId}
        mode="create"
        context="calendar"
        onUpdate={handleTodoUpdate}
        ideas={ideas}
        dict={dict}
        initialOpen={newEventDialogOpen}
        className='hidden'
      />
      
      {/* TodoCreator for editing selected events */}
      {selectedEvent && (
        <TodoCreator
          defaultValue={new Date(selectedEvent.start_date)}
          ideaId={Number(selectedEvent.idea_id)}
          scriptId={Number(selectedEvent.script_id)}
          userId={selectedEvent.user_id}
          mode="update"
          context="calendar"
          todo={selectedEvent}
          onUpdate={handleTodoUpdate}
          ideas={ideas}
          dict={dict}
          initialOpen={manageEventDialogOpen}
          className='hidden'
        />
      )}
      {children}
    </CalendarContext.Provider>
  )
}
