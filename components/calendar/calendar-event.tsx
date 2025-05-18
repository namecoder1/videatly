import { useCalendarContext } from '@/components/calendar/calendar-context'
import { format, isSameDay, isSameMonth, getHours, getMinutes, differenceInMinutes } from 'date-fns'
import { cn } from '@/lib/utils'
import { motion, MotionConfig, AnimatePresence } from 'framer-motion'
import { TodoProps } from '@/types/types'
import { ProcessedEvent } from './body/day/calendar-body-day-content'

interface EventPosition {
  left: string
  width: string
  top: string
  height: string
  zIndex: number
}

function getOverlappingEvents(
  currentTodo: TodoProps,
  todos: TodoProps[]
): TodoProps[] {
  return todos.filter((todo) => {
    if (todo.id === currentTodo.id) return false
    
    // Skip if no start_date or end_date
    if (!currentTodo.start_date || !currentTodo.end_date || !todo.start_date || !todo.end_date) {
      return false
    }
    
    const currentStart = new Date(currentTodo.start_date)
    const currentEnd = new Date(currentTodo.end_date)
    const todoStart = new Date(todo.start_date)
    const todoEnd = new Date(todo.end_date)
    
    return (
      currentStart < todoEnd &&
      currentEnd > todoStart &&
      isSameDay(currentStart, todoStart)
    )
  })
}

function calculateEventLayout(
  currentEvent: ProcessedEvent,
  allDayEvents: ProcessedEvent[]
): EventPosition {
  const { effectiveStartDate: currentStart, effectiveEndDate: currentEnd } = currentEvent;

  if (!currentStart || !currentEnd) {
    return { top: '0px', height: '32px', left: '0%', width: '100%', zIndex: 1 };
  }

  // 1. Calculate vertical position and height (same as before)
  const startHour = getHours(currentStart);
  const startMinutes = getMinutes(currentStart);
  const endHour = getHours(currentEnd);
  const endMinutes = getMinutes(currentEnd);

  const topPosition = startHour * 128 + (startMinutes / 60) * 128; // Assuming 128px per hour
  
  let durationInMinutes = differenceInMinutes(currentEnd, currentStart);
  if (durationInMinutes <= 0) durationInMinutes = 30; // Minimum duration for display, e.g., 30 mins

  const minHeightInPx = (30 / 60) * 128; // Min height for 30 min
  const calculatedHeight = (durationInMinutes / 60) * 128;
  const height = Math.max(calculatedHeight, minHeightInPx);

  // 2. Determine horizontal position (left, width) based on overlaps
  const overlappingSegments: ProcessedEvent[] = [];
  for (const otherEvent of allDayEvents) {
    if (otherEvent.id === currentEvent.id) continue;
    if (!otherEvent.effectiveStartDate || !otherEvent.effectiveEndDate) continue;

    // Check for temporal overlap
    const otherStart = otherEvent.effectiveStartDate;
    const otherEnd = otherEvent.effectiveEndDate;
    if (currentStart < otherEnd && currentEnd > otherStart) {
      overlappingSegments.push(otherEvent);
    }
  }

  // Include the current event itself in a sorted list for consistent layout
  const allRelevantSegments = [currentEvent, ...overlappingSegments].sort((a, b) => {
    const startDiff = differenceInMinutes(a.effectiveStartDate!, b.effectiveStartDate!);
    if (startDiff !== 0) return startDiff;
    // If start times are the same, sort by duration (shorter events first) or ID for stability
    const durationDiff = differenceInMinutes(a.effectiveEndDate!, a.effectiveStartDate!) - differenceInMinutes(b.effectiveEndDate!, b.effectiveStartDate!);
    if (durationDiff !== 0) return durationDiff;
    return String(a.id).localeCompare(String(b.id)); // Convert IDs to string before comparing
  });
  
  let columns: ProcessedEvent[][] = [];
  allRelevantSegments.forEach(eventSegment => {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const lastEventInColumn = columns[i][columns[i].length - 1];
      if (eventSegment.effectiveStartDate! >= lastEventInColumn.effectiveEndDate!) {
        columns[i].push(eventSegment);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([eventSegment]);
    }
  });

  const numColumns = columns.length;
  let columnIndex = 0;
  for (let i = 0; i < numColumns; i++) {
    if (columns[i].find(evt => evt.id === currentEvent.id)) {
      columnIndex = i;
      break;
    }
  }
  
  const columnWidth = 100 / numColumns;
  const eventWidth = columnWidth; // Each event in a column takes the full width of that column for now
  const eventLeft = columnIndex * columnWidth;
  // A more sophisticated approach might adjust width based on how many columns the event *spans* if it's very long
  // and other shorter events could fit beside it. For now, this is a common column-based layout.

  return {
    left: `${eventLeft}%`,
    width: `${eventWidth}%`,
    top: `${topPosition}px`,
    height: `${height}px`,
    zIndex: columnIndex + 1, // Simple z-index to allow clicking on events in front
  };
}

// Helper function to get priority classes
function getPriorityClasses(priority: string) {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-red-500/10',
        hoverBg: 'hover:bg-red-500/20',
        border: 'border-red-500',
        text: 'text-red-500'
      }
    case 'medium':
      return {
        bg: 'bg-orange-500/10',
        hoverBg: 'hover:bg-orange-500/20',
        border: 'border-orange-500',
        text: 'text-orange-500'
      }
    case 'low':
      return {
        bg: 'bg-blue-500/10',
        hoverBg: 'hover:bg-blue-500/20',
        border: 'border-blue-500',
        text: 'text-blue-500'
      }
    default:
      return {
        bg: 'bg-gray-500/10',
        hoverBg: 'hover:bg-gray-500/20',
        border: 'border-gray-500',
        text: 'text-gray-500'
      }
  }
}

// Interface for props, ensuring 'event' can be ProcessedEvent for day/week views
interface CalendarEventProps {
  event: ProcessedEvent; // In day/week view, we always expect ProcessedEvent now
  month?: boolean;
  className?: string;
  dailyProcessedEvents?: ProcessedEvent[]; // All events processed for the current day
}

export default function CalendarEvent({ event, month = false, className, dailyProcessedEvents = [] }: CalendarEventProps) {
  const { setSelectedEvent, setManageEventDialogOpen, date } = useCalendarContext();
  
  const style = month ? {} : calculateEventLayout(event, dailyProcessedEvents);
  const priorityClasses = getPriorityClasses(event.priority || 'medium');

  // Determina la larghezza numerica per aggiustamenti di layout dinamici
  const eventWidthPercent = month ? 100 : parseFloat((style as any).width?.replace('%', '') || '100');

  const todoDate = event.start_date ? new Date(event.start_date) : new Date();
  const isEventInCurrentMonth = isSameMonth(todoDate, date);
  const animationKey = `${event.id}-${isEventInCurrentMonth ? 'current' : 'adjacent'}`;

  const getFormattedTime = () => {
    const displayStartDate = event.effectiveStartDate ? new Date(event.effectiveStartDate) : (event.start_date ? new Date(event.start_date) : null);
    const displayEndDate = event.effectiveEndDate ? new Date(event.effectiveEndDate) : (event.end_date ? new Date(event.end_date) : null);

    if (!displayStartDate) return '';
    try {
      const formattedStart = format(displayStartDate, 'p');
      if (!displayEndDate || (isSameDay(displayStartDate, displayEndDate) && displayStartDate.getTime() === displayEndDate.getTime())) {
        return formattedStart;
      }
      const formattedEnd = format(displayEndDate, 'p');
      return `${formattedStart} - ${formattedEnd}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          className={cn(
            `px-2 py-1 rounded-2xl cursor-pointer transition-all duration-300 ${priorityClasses.bg} ${priorityClasses.hoverBg} border ${priorityClasses.border}`,
            !month && 'absolute',
            month && 'overflow-hidden text-xs my-0.5',
            className
          )}
          style={style} // style will include zIndex for day/week view
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEvent(event as TodoProps);
            setManageEventDialogOpen(true);
          }}
          initial={{ opacity: 0, y: month ? 0 : -3, scale: month ? 1 : 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.15, ease: 'easeOut' },
          }}
          transition={{
            duration: 0.2,
            ease: [0.25, 0.1, 0.25, 1],
            layout: { duration: 0.2, ease: 'easeOut' },
          }}
          layoutId={`event-${animationKey}-${month ? 'month' : 'day'}`}
        >
          <div className={cn(`w-full h-fit flex flex-col ${priorityClasses.text}`,
             // Layout verticale se l'evento è molto stretto, per cercare di far stare il testo
             eventWidthPercent < 30 && !month ? 'justify-around' : 'justify-center' 
            )}
          >
            <p className={cn(
              'font-bold',
              month ? 'truncate text-xs' : 'truncate', // Troncamento sempre attivo, più aggressivo per mese
              // Riduci la dimensione del testo se l'evento è molto stretto
              !month && eventWidthPercent < 40 ? 'text-xs' : (!month ? 'text-sm' : '')
            )}>
              {event.title || "Event Title"} 
            </p>
            {/* Non mostrare orario/categoria se l'evento è estremamente stretto e non è la vista mensile */}
            {(!month && eventWidthPercent < 25) ? null : (
              <>
                {month && event.start_date && (
                  <p className="truncate text-xs">
                    {isSameDay(new Date(event.start_date), new Date(event.end_date || event.start_date)) ? format(new Date(event.start_date), 'p') : "(cont.)"}
                  </p>
                )}
                {!month && event.effectiveStartDate && (
                  <p className={cn(
                    eventWidthPercent < 40 ? 'text-[10px]' : 'text-xs' // Orario ancora più piccolo se stretto
                  )}>
                    {getFormattedTime()} 
                  </p>
                )}

                {/* Nascondi la categoria se l'evento è molto stretto o se è la vista mensile */}
                {(!month && eventWidthPercent > 35) && event.category && (
                  <p className="text-[10px] opacity-75 mt-0.5 truncate">
                    {event.category}
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
