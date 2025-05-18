import { useCalendarContext } from '../../calendar-context'
import { isSameDay, startOfDay, endOfDay, getHours, getMinutes, setHours, setMinutes } from 'date-fns'
import { hours } from './calendar-body-margin-day-margin'
import CalendarBodyHeader from '../calendar-body-header'
import CalendarEvent from '../../calendar-event'
import { TodoProps } from '@/types/types'
import { cn } from '@/lib/utils'

export interface ProcessedEvent extends TodoProps {
  effectiveStartDate: Date;
  effectiveEndDate: Date;
}

export default function CalendarBodyDayContent({ date }: { date: Date }) {
  const { events, dict, dayClassNames, getDayContent } = useCalendarContext()

  const processedDayTodos: ProcessedEvent[] = events
    .filter((todo) => {
      if (!todo.start_date || !todo.end_date) return false;
      const eventStartDate = startOfDay(new Date(todo.start_date));
      const eventEndDate = startOfDay(new Date(todo.end_date));
      const currentDayStart = startOfDay(date);
      return currentDayStart >= eventStartDate && currentDayStart <= eventEndDate;
    })
    .map((todo) => {
      const originalStartDate = new Date(todo.start_date!);
      const originalEndDate = new Date(todo.end_date!);
      let effectiveStartDate = new Date(date); // Inizia con la data corrente del giorno
      let effectiveEndDate = new Date(date);

      if (isSameDay(date, originalStartDate)) {
        // Se oggi è il giorno di inizio dell'evento, usa l'ora di inizio originale
        effectiveStartDate = setHours(effectiveStartDate, getHours(originalStartDate));
        effectiveStartDate = setMinutes(effectiveStartDate, getMinutes(originalStartDate));
      } else {
        // Altrimenti (se l'evento è iniziato prima di oggi), inizia da mezzanotte
        effectiveStartDate = startOfDay(effectiveStartDate);
      }

      if (isSameDay(date, originalEndDate)) {
        // Se oggi è il giorno di fine dell'evento, usa l'ora di fine originale
        effectiveEndDate = setHours(effectiveEndDate, getHours(originalEndDate));
        effectiveEndDate = setMinutes(effectiveEndDate, getMinutes(originalEndDate));
      } else {
        // Altrimenti (se l'evento finisce dopo oggi), finisce a fine giornata
        effectiveEndDate = endOfDay(effectiveEndDate);
      }
      
      // Assicurati che effectiveEndDate non sia prima di effectiveStartDate in caso di eventi molto brevi nello stesso giorno
      if (effectiveEndDate < effectiveStartDate && isSameDay(originalStartDate, originalEndDate)) {
        effectiveEndDate = effectiveStartDate;
      }

      return {
        ...todo,
        effectiveStartDate,
        effectiveEndDate,
      };
    });

  // Get custom class names for this day
  const customClasses = dayClassNames ? dayClassNames(date) : '';
  
  // Get content for publication date if available
  const dayContent = getDayContent ? getDayContent(date) : null;

  return (
    <div className={cn(
      "flex flex-col flex-grow bg-card rounded-r-3xl relative",
      customClasses
    )}>
      <CalendarBodyHeader date={date} dict={dict} />
      
      {dayContent && (
        <div className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 dark:bg-red-900/10 border-b  dark:border-red-900/20">
          {dayContent}
        </div>
      )}

      <div className="flex-1 relative rounded-r-3xl">
        {hours.map((hour) => (
          <div key={hour} className="h-32 border-b border-border/50 group " />
        ))}

        {processedDayTodos.map((processedEvent: ProcessedEvent) => (
          <CalendarEvent 
            key={processedEvent.id} 
            event={processedEvent}
            dailyProcessedEvents={processedDayTodos}
          />
        ))}
      </div>
    </div>
  )
}
