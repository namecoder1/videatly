import { TodoProps } from '@/types/types'

export type CalendarProps = {
  events: TodoProps[]
  setEvents: (events: TodoProps[]) => void
  mode: Mode
  setMode: (mode: Mode) => void
  date: Date
  setDate: (date: Date) => void
  calendarIconIsToday?: boolean
  onTodoUpdate?: () => Promise<void>
  ideas?: any[]
  daysWithTodos?: string[]
  dict: any
  dayClassNames?: (date: Date) => string
  getDayContent?: (date: Date) => string | null
  context?: 'calendar' | 'production'
}

export type CalendarContextType = CalendarProps & {
  newEventDialogOpen: boolean
  setNewEventDialogOpen: (open: boolean) => void
  manageEventDialogOpen: boolean
  setManageEventDialogOpen: (open: boolean) => void
  selectedEvent: TodoProps | null
  setSelectedEvent: (event: TodoProps | null) => void
  daysWithTodos?: string[]
}

// Legacy type for backwards compatibility
export type CalendarEvent = {
  id: string
  title: string
  color: string
  start: Date
  end: Date
}

// Helper function to convert TodoProps to usable calendar format
export const todoToCalendarEvent = (todo: TodoProps): TodoProps => {
  return todo
}

export const calendarModes = ['day', 'week', 'month'] as const
export type Mode = (typeof calendarModes)[number]
