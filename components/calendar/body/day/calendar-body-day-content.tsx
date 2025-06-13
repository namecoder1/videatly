import { useCalendarContext } from '../../calendar-context'
import { isSameDay, startOfDay, endOfDay, getHours, getMinutes, setHours, setMinutes, differenceInDays } from 'date-fns'
import { hours } from './calendar-body-margin-day-margin'
import CalendarBodyHeader from '../calendar-body-header'
import CalendarEvent from '../../calendar-event'
import { TodoProps } from '@/types/types'
import { cn } from '@/lib/utils'
import { CalendarClock } from 'lucide-react'

export interface ProcessedEvent extends TodoProps {
  effectiveStartDate: Date;
  effectiveEndDate: Date;
  isFirstDay: boolean;
  isLastDay: boolean;
  totalDays: number;
  currentDayIndex: number;
}

export default function CalendarBodyDayContent({ date }: { date: Date }) {
  const { events, dict, dayClassNames, getDayContent } = useCalendarContext()

  const processedDayTodos: ProcessedEvent[] = events
    .filter((todo) => {
      if (!todo.start_date || !todo.end_date) return false;
      
      // Use timezone-aware logic for filtering too
      const originalStartDate = new Date(todo.start_date);
      const originalEndDate = new Date(todo.end_date);
      const currentDayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      const currentDayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      
      // Event overlaps with current day if:
      // - Event starts before or during current day AND
      // - Event ends during or after current day
      return originalStartDate <= currentDayEnd && originalEndDate >= currentDayStart;
    })
    .map((todo) => {
      // Parse dates and ensure we work in local timezone
      const originalStartDate = new Date(todo.start_date!);
      const originalEndDate = new Date(todo.end_date!);
      
      // DEBUG: Log the original data from Supabase
      console.log(`DEBUG Event ${todo.id} - Title: ${todo.title}`);
      console.log(`DEBUG - Original start_date from DB: ${todo.start_date}`);
      console.log(`DEBUG - Original end_date from DB: ${todo.end_date}`);
      console.log(`DEBUG - Parsed originalStartDate: ${originalStartDate.toISOString()}`);
      console.log(`DEBUG - Parsed originalEndDate: ${originalEndDate.toISOString()}`);
      console.log(`DEBUG - Current viewing date: ${date.toISOString()}`);
      
      // Convert to local timezone for proper date comparison
      const localStartDate = new Date(originalStartDate.getFullYear(), originalStartDate.getMonth(), originalStartDate.getDate(), originalStartDate.getHours(), originalStartDate.getMinutes(), originalStartDate.getSeconds());
      const localEndDate = new Date(originalEndDate.getFullYear(), originalEndDate.getMonth(), originalEndDate.getDate(), originalEndDate.getHours(), originalEndDate.getMinutes(), originalEndDate.getSeconds());
      
      console.log(`DEBUG - Local start date: ${localStartDate.toISOString()}`);
      console.log(`DEBUG - Local end date: ${localEndDate.toISOString()}`);
      
      // Create local date boundaries for the current day
      const currentDayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      const currentDayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      
      let effectiveStartDate: Date;
      let effectiveEndDate: Date;

      // Determine if this day contains the original start time - use local dates
      const startsToday = localStartDate >= currentDayStart && localStartDate <= currentDayEnd;
      
      // Determine if this day contains the original end time - use local date comparison
      const eventEndDateOnly = new Date(localEndDate.getFullYear(), localEndDate.getMonth(), localEndDate.getDate());
      const currentDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endsToday = eventEndDateOnly.getTime() === currentDateOnly.getTime();
      
      console.log(`DEBUG - startsToday: ${startsToday}, endsToday: ${endsToday}`);
      
      // Calculate total days the event spans - use local dates
      const eventStartDay = new Date(localStartDate.getFullYear(), localStartDate.getMonth(), localStartDate.getDate());
      const eventEndDay = new Date(localEndDate.getFullYear(), localEndDate.getMonth(), localEndDate.getDate());
      const totalDays = Math.floor((eventEndDay.getTime() - eventStartDay.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      const currentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const currentDayIndex = Math.floor((currentDay.getTime() - eventStartDay.getTime()) / (24 * 60 * 60 * 1000));
      
      console.log(`DEBUG - totalDays: ${totalDays}, currentDayIndex: ${currentDayIndex}`);
      
      // Set effective start time for this day
      if (startsToday) {
        // Event starts today - use the local start time
        effectiveStartDate = new Date(localStartDate);
      } else {
        // Event started before today - start from beginning of day (00:00)
        effectiveStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      }
      
      // Set effective end time for this day  
      if (endsToday) {
        // Event ends today - use the local end time
        effectiveEndDate = new Date(localEndDate);
        console.log(`DEBUG - Event ends today, effectiveEndDate set to: ${effectiveEndDate.toISOString()}`);
      } else {
        // Event continues after today - end at end of day 
        effectiveEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0, 0);
        console.log(`DEBUG - Event continues, effectiveEndDate set to: ${effectiveEndDate.toISOString()}`);
      }
      
      // Safety check: ensure we have at least some minimum duration
      if (effectiveEndDate <= effectiveStartDate) {
        effectiveEndDate = new Date(effectiveStartDate.getTime() + 30 * 60 * 1000); // Add 30 minutes
      }

      console.log(`DEBUG - Final effectiveStartDate: ${effectiveStartDate.toISOString()}`);
      console.log(`DEBUG - Final effectiveEndDate: ${effectiveEndDate.toISOString()}`);
      console.log(`DEBUG - Hours:Minutes = ${effectiveEndDate.getHours()}:${effectiveEndDate.getMinutes()}`);
      console.log('---');

      return {
        ...todo,
        effectiveStartDate,
        effectiveEndDate,
        isFirstDay: startsToday,
        isLastDay: endsToday,
        totalDays,
        currentDayIndex,
      };
    });

  // For events that end today but don't start today, create an additional "end marker" event
  const endMarkerEvents: ProcessedEvent[] = processedDayTodos
    .filter(event => event.isLastDay && !event.isFirstDay)
    .map(event => {
      const originalEndDate = new Date(event.end_date!);
      const localEndDate = new Date(originalEndDate.getFullYear(), originalEndDate.getMonth(), originalEndDate.getDate(), originalEndDate.getHours(), originalEndDate.getMinutes(), originalEndDate.getSeconds());
      
      // Create a 30-minute end marker centered on the actual end time
      const markerStart = new Date(localEndDate.getTime() - 15 * 60 * 1000); // 15 min before
      const markerEnd = new Date(localEndDate.getTime() + 15 * 60 * 1000); // 15 min after
      
      return {
        ...event,
        id: `${event.id}-end-marker`,
        effectiveStartDate: markerStart,
        effectiveEndDate: markerEnd,
        isEndMarker: true,
      } as ProcessedEvent & { isEndMarker: boolean };
    });

  // Filter out continuation events when we have end markers - show only the end markers
  const filteredEvents = processedDayTodos.filter(event => !(event.isLastDay && !event.isFirstDay));

  // Combine filtered events with end markers
  const allProcessedEvents = [...filteredEvents, ...endMarkerEvents];

  // Get custom class names for this day
  const customClasses = dayClassNames ? dayClassNames(date) : '';
  
  // Get content for publication date if available
  const dayContent = getDayContent ? getDayContent(date) : null;

  return (
    <div className={cn(
      "flex flex-col flex-grow bg-card relative",
      customClasses
    )}>
      <CalendarBodyHeader date={date} dict={dict} />
      
      {dayContent && (
        <div className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 flex flex-col items-start dark:border-red-900/20">
          <span className='font-bold'>Pub Date:</span>
          {dayContent}  
        </div>
      )}

      <div className="flex-1 relative rounded-r-3xl">
        {hours.map((hour) => (
          <div key={hour} className="h-32 border-b border-border/50 group " />
        ))}

        {allProcessedEvents.map((processedEvent: ProcessedEvent & { isEndMarker?: boolean }) => (
          <CalendarEvent 
            key={processedEvent.id} 
            event={processedEvent}
            dailyProcessedEvents={processedDayTodos}
            isEndMarker={processedEvent.isEndMarker}
          />
        ))}
      </div>
    </div>
  )
}
