import { format, isSameDay } from 'date-fns'
import { cn, formatDateWithLocale } from '../../../lib/utils'

export default function CalendarBodyHeader({
  date,
  onlyDay = false,
  dict,
}: {
  date: Date
  onlyDay?: boolean
  dict: any
}) {
  const isToday = isSameDay(date, new Date())

  return (
    <div className="flex items-center justify-center gap-1 py-2 w-full sticky top-0 bg-card z-10 border-b">
      <span
        className={cn(
          'text-xs font-medium',
          isToday ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {formatDateWithLocale(date, 'short', dict.calendarPage.locale)} 
      </span>
      {!onlyDay && (
        <span
          className={cn(
            'text-xs font-medium',
            isToday ? 'text-primary font-bold' : 'text-foreground'
          )}
        >
          {format(date, 'dd')} 
        </span>
      )}
    </div>
  )
}
