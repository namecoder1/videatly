import { useCalendarContext } from '../../calendar-context'
import { Calendar } from '@/components/ui/calendar'

export default function CalendarBodyDayCalendar() {
  const { date, setDate, dict } = useCalendarContext()
  return (
    <Calendar
      selected={date}
      onSelect={(date: Date | undefined) => date && setDate(date)}
      mode="single"
      className='bg-card rounded-3xl'
    
    />
  )
}
