import { useCalendarContext } from '../../calendar-context'
import { isSameMonth, isSameDay, isAfter } from 'date-fns'
import { TodoProps } from '@/types/types'

export default function CalendarHeaderDateBadge() {
  const { events, date } = useCalendarContext()
  
  // Filter todos for the current month
  const monthTodos = events.filter((todo: TodoProps) => {
    if (!todo.start_date) return false
    const todoDate = new Date(todo.start_date)
    return isSameMonth(todoDate, date)
  })

  // Only show an indicator if there are todos on this day
  const isDayWithTodo = events.some((todo) => {
    if (!todo.start_date) return false
    const todoDate = new Date(todo.start_date)
    return isSameDay(todoDate, date) 
  })

  // Check if there's a day with a todo in the future
  const hasUpcomingTodo = events.some((todo) => {
    if (!todo.start_date) return false
    const todoDate = new Date(todo.start_date)
    return isAfter(todoDate, new Date()) && isSameMonth(todoDate, date)
  })

  if (!monthTodos.length) return null
  
  return (
    <div className="whitespace-nowrap bg-card rounded-xl border px-2 py-0.5 text-xs">
      {monthTodos.length} {monthTodos.length === 1 ? 'task' : 'tasks'}
    </div>
  )
}
