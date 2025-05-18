import { useCalendarContext } from '../../calendar-context'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  isWithinInterval,
  startOfDay,
} from 'date-fns'
import { cn } from '@/lib/utils'
import CalendarEvent from '../../calendar-event'
import { AnimatePresence, motion } from 'framer-motion'
import { TodoProps } from '@/types/types'
import { ProcessedEvent } from '../day/calendar-body-day-content'

export default function CalendarBodyMonth() {
  const { date, events, setDate, setMode, daysWithTodos = [], dict, dayClassNames, getDayContent } = useCalendarContext()

  // Get the first day of the month
  const monthStart = startOfMonth(date)
  // Get the last day of the month
  const monthEnd = endOfMonth(date)

  // Get the first Monday of the first week (may be in previous month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  // Get the last Sunday of the last week (may be in next month)
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Get all days between start and end
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  const today = new Date()

  // Calculate the total number of tasks for the month
  const monthTasks = events.filter((todo: TodoProps) => {
    if (!todo.start_date) return false
    const todoDate = new Date(todo.start_date)
    return isSameMonth(todoDate, date)
  })

  // Filter events to only show those within the current month view
  const visibleEvents = events.filter((todo: TodoProps) => {
    if (!todo.start_date || !todo.end_date) return false;

    const eventStartDate = startOfDay(new Date(todo.start_date));
    const eventEndDate = startOfDay(new Date(todo.end_date));

    // L'evento è visibile se il suo intervallo si sovrappone all'intervallo del calendario
    // calendarStart e calendarEnd sono già definiti come startOfDay equivalenti
    return eventStartDate <= calendarEnd && eventEndDate >= calendarStart;
  })

  // Check if a day has todos
  const hasTodos = (day: Date): boolean => {
    const dateString = format(day, 'yyyy-MM-dd')
    return daysWithTodos.includes(dateString)
  }

  // Check if todo is on day
  function isOnDay(todo: TodoProps, day: Date): boolean {
    if (!todo.start_date) return false
    const todoDate = new Date(todo.start_date)
    return (
      todoDate.getDate() === day.getDate() &&
      todoDate.getMonth() === day.getMonth() &&
      todoDate.getFullYear() === day.getFullYear()
    )
  }

  // Check if todo is in current month
  function isInCurrentMonth(todo: TodoProps, date: Date): boolean {
    if (!todo.start_date) return false
    const todoDate = new Date(todo.start_date)
    return (
      todoDate.getMonth() === date.getMonth() &&
      todoDate.getFullYear() === date.getFullYear()
    )
  }

  // When checking if a day has todos
  function isDayWithTodo(date: Date, daysWithTodos: string[]) {
    // Format date as YYYY-MM-DD to match daysWithTodos format
    const formattedDate = date.toISOString().slice(0, 10)
    return daysWithTodos.some(todoDateStr => {
      // Handle both date-only strings and full ISO strings with timestamps
      const todoDate = todoDateStr.includes('T') 
        ? todoDateStr.slice(0, 10) 
        : todoDateStr
      return todoDate === formattedDate
    })
  }

  // Get total number of days in grid (7 columns x number of rows)
  const totalDays = calendarDays.length;
  // Get number of rows (7 days per row)
  const numberOfRows = Math.ceil(totalDays / 7);
  // Bottom row starts at index (number of rows - 1) * 7
  const bottomRowStartIndex = (numberOfRows - 1) * 7;

  return (
    <div className="flex flex-col flex-grow overflow-hidden bg-card rounded-3xl">
      <div className="hidden md:grid grid-cols-7 border-border divide-x divide-border">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground border-b border-border"
          >
            {dict.calendarPage.days[day]}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={monthStart.toISOString()}
          className="grid md:grid-cols-7 flex-grow overflow-y-auto relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
        >
          {calendarDays.map((day, index) => {
            const dayEvents = visibleEvents.filter((todo: TodoProps) => {
              if (!todo.start_date || !todo.end_date) return false;
              
              const eventStartDate = startOfDay(new Date(todo.start_date));
              const eventEndDate = startOfDay(new Date(todo.end_date));
              const currentDay = startOfDay(day);

              return currentDay >= eventStartDate && currentDay <= eventEndDate;
            })
            
            const isToday = isSameDay(day, today)
            const isCurrentMonth = isSameMonth(day, date)
            const dayHasTodos = dayEvents.length > 0;
            
            // Get custom class names for days if the function is provided
            const customClasses = dayClassNames ? dayClassNames(day) : '';
            
            // Get content for publication dates
            const dayContent = getDayContent ? getDayContent(day) : null;

            // Check if this is a bottom corner cell
            const isBottomRow = index >= bottomRowStartIndex;
            const isBottomLeftCell = index === bottomRowStartIndex;
            const isBottomRightCell = index === totalDays - 1;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'relative flex flex-col border-b border-r p-2 aspect-square cursor-pointer',
                  !isCurrentMonth && 'bg-muted/50 hidden md:flex',
                  dayHasTodos && isCurrentMonth && 'bg-gray-50/50',
                  isBottomLeftCell && 'rounded-bl-3xl',
                  isBottomRightCell && 'rounded-br-3xl',
                  customClasses // Apply custom classes
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setDate(day)
                  setMode('day')
                }}
              >
                <div
                  className={cn(
                    'text-sm font-medium w-fit p-1 flex flex-col items-center justify-center rounded-full aspect-square',
                    isToday && 'bg-primary text-background',
                    dayHasTodos && !isToday && 'border-2 border-dotted border-gray-400'
                  )}
                >
                  {format(day, 'd')}
                </div>
                
                {dayContent && (
                  <div className="mt-1 text-xs line-clamp-2 font-medium text-red-700 dark:text-red-400">
                    {dayContent}
                  </div>
                )}
                
                <AnimatePresence mode="wait">
                  <div className="flex flex-col gap-1 mt-1">
                    {dayEvents.slice(0, 3).map((todo: TodoProps) => (
                      <CalendarEvent
                        key={todo.id}
                        event={todo as ProcessedEvent}
                        className="relative h-auto"
                        month
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <motion.div
                        key={`more-${day.toISOString()}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="text-xs text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDate(day)
                          setMode('day')
                        }}
                      >
                        +{dayEvents.length - 3} {dict.calendarPage.more}
                      </motion.div>
                    )}
                  </div>
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
