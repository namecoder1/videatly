import { useCalendarContext } from '../../calendar-context'
import { format, isSameDay } from 'date-fns'
import { TodoProps } from '@/types/types'

export default function CalendarBodyDayEvents() {
  const { events, date, setManageEventDialogOpen, setSelectedEvent } =
    useCalendarContext()

  // Filter events for the selected day
  const dayEvents = events.filter((todo) => {
    if (!todo.start_date) return false
    const todoDate = new Date(todo.start_date)
    return isSameDay(todoDate, date)
  })

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-orange-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function getEventTimes(event: TodoProps): { start: string; end: string } {
    const startDate = event.start_date ? new Date(event.start_date) : new Date()
    const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 60 * 60 * 1000)
    
    return {
      start: formatTime(startDate),
      end: formatTime(endDate)
    }
  }

  return !!dayEvents.length ? (
    <div className="flex flex-col gap-2 bg-card pl-1">
      <p className="font-medium p-2 pb-0 font-heading">Tasks ({dayEvents.length})</p>
      <div className="flex flex-col gap-2">
        {dayEvents.map((todo: TodoProps) => (
          <div
            key={todo.id}
            className="flex flex-col gap-1 px-2 py-1 hover:bg-muted rounded-md cursor-pointer"
            onClick={() => {
              setSelectedEvent(todo)
              setManageEventDialogOpen(true)
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`size-3 rounded-full ${getPriorityClass(todo.priority)}`} />
                <div className="text-sm truncate">{todo.title}</div>
              </div>
              {todo.status === 'completed' && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                  Completed
                </span>
              )}
            </div>
            {todo.start_date && (
              <div className="text-xs text-muted-foreground ml-5">
                {getEventTimes(todo).start} - {getEventTimes(todo).end}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="p-2 text-muted-foreground">No tasks today...</div>
  )
}
