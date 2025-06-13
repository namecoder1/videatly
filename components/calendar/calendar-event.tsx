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

  console.log(`LAYOUT DEBUG - Event ${currentEvent.id} (${currentEvent.title})`);
  console.log(`LAYOUT DEBUG - effectiveStartDate: ${currentStart?.toISOString()}`);
  console.log(`LAYOUT DEBUG - effectiveEndDate: ${currentEnd?.toISOString()}`);
  console.log(`LAYOUT DEBUG - isFirstDay: ${currentEvent.isFirstDay}, isLastDay: ${currentEvent.isLastDay}`);

  if (!currentStart || !currentEnd) {
    return { top: '0px', height: '32px', left: '0%', width: '100%', zIndex: 1 };
  }

  // 1. Calculate vertical position and height
  // Convert UTC to local timezone properly
  const startOffset = currentStart.getTimezoneOffset() * 60000; // offset in milliseconds
  const endOffset = currentEnd.getTimezoneOffset() * 60000;
  
  const localStart = new Date(currentStart.getTime() - startOffset);
  const localEnd = new Date(currentEnd.getTime() - endOffset);
  
  const startHour = localStart.getUTCHours(); // Use getUTCHours because we've adjusted for timezone
  const startMinutes = localStart.getUTCMinutes();
  const endHour = localEnd.getUTCHours();
  const endMinutes = localEnd.getUTCMinutes();

  console.log(`LAYOUT DEBUG - UTC Start: ${currentStart.toISOString()}`);
  console.log(`LAYOUT DEBUG - UTC End: ${currentEnd.toISOString()}`);
  console.log(`LAYOUT DEBUG - Local start: ${localStart.toISOString()}`);
  console.log(`LAYOUT DEBUG - Local end: ${localEnd.toISOString()}`);
  console.log(`LAYOUT DEBUG - Start time: ${startHour}:${startMinutes.toString().padStart(2, '0')}`);
  console.log(`LAYOUT DEBUG - End time: ${endHour}:${endMinutes.toString().padStart(2, '0')}`);

  const topPosition = startHour * 128 + (startMinutes / 60) * 128; // 128px per hour
  
  let durationInMinutes = differenceInMinutes(localEnd, localStart);
  
  console.log(`LAYOUT DEBUG - Duration in minutes: ${durationInMinutes}`);
  console.log(`LAYOUT DEBUG - Top position: ${topPosition}px`);
  
  // Ensure minimum duration for display (30 minutes)
  if (durationInMinutes <= 0) durationInMinutes = 30;

  const minHeightInPx = (30 / 60) * 128; // Min height for 30 min
  const calculatedHeight = (durationInMinutes / 60) * 128;
  const height = Math.max(calculatedHeight, minHeightInPx);

  console.log(`LAYOUT DEBUG - Calculated height: ${height}px`);
  console.log('LAYOUT DEBUG ---');

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
  isEndMarker?: boolean; // New prop to indicate if this is an end marker
}

export default function CalendarEvent({ event, month = false, className, dailyProcessedEvents = [], isEndMarker = false }: CalendarEventProps) {
  const { setSelectedEvent, setManageEventDialogOpen, date } = useCalendarContext();
  
  console.log(`RENDER DEBUG - CalendarEvent for ${event.id} (${event.title})`);
  console.log(`RENDER DEBUG - Month view: ${month}`);
  console.log(`RENDER DEBUG - Is end marker: ${isEndMarker}`);
  console.log(`RENDER DEBUG - Event data:`, {
    effectiveStartDate: event.effectiveStartDate?.toISOString(),
    effectiveEndDate: event.effectiveEndDate?.toISOString(),
    isFirstDay: event.isFirstDay,
    isLastDay: event.isLastDay,
    totalDays: event.totalDays
  });
  
  const style = month ? {} : calculateEventLayout(event, dailyProcessedEvents);
  const priorityClasses = getPriorityClasses(event.priority || 'medium');

  console.log(`RENDER DEBUG - Calculated style:`, style);

  // Determina la larghezza numerica per aggiustamenti di layout dinamici
  const eventWidthPercent = month ? 100 : parseFloat((style as any).width?.replace('%', '') || '100');

  const todoDate = event.start_date ? new Date(event.start_date) : new Date();
  const isEventInCurrentMonth = isSameMonth(todoDate, date);
  const animationKey = `${event.id}-${isEventInCurrentMonth ? 'current' : 'adjacent'}`;

  const getFormattedTime = () => {
    if (isEndMarker) {
      // For end markers, always show the original end time
      const originalEndDate = new Date(event.end_date!);
      return `Ends: ${format(originalEndDate, 'p')}`;
    }

    const displayStartDate = event.effectiveStartDate ? new Date(event.effectiveStartDate) : (event.start_date ? new Date(event.start_date) : null);
    const displayEndDate = event.effectiveEndDate ? new Date(event.effectiveEndDate) : (event.end_date ? new Date(event.end_date) : null);

    if (!displayStartDate) return '';
    
    try {
      // For multi-day events, show different information based on the day
      if (event.totalDays && event.totalDays > 1) {
        if (event.isFirstDay) {
          return `Start: ${format(displayStartDate, 'p')}`;
        } else if (event.isLastDay && event.end_date) {
          // For the last day, always show the original end time, not the effective end time
          const originalEndDate = new Date(event.end_date);
          return `End: ${format(originalEndDate, 'p')}`;
        } else {
          return `Day ${event.currentDayIndex + 1} of ${event.totalDays}`;
        }
      }
      
      // Single day event
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

  const getEventTitle = () => {
    if (isEndMarker) {
      return `${event.title} ●`; // Add a bullet point to indicate end
    }
    
    if (event.totalDays && event.totalDays > 1) {
      if (event.isFirstDay) {
        return event.title;
      } else if (event.isLastDay) {
        return `${event.title} (End)`;
      } else {
        return `${event.title} (Day ${event.currentDayIndex + 1})`;
      }
    }
    return event.title || "Event Title";
  };

  // Apply different styling for end markers
  const getEventClasses = () => {
    if (isEndMarker) {
      return {
        ...priorityClasses,
        bg: `${priorityClasses.bg} opacity-80`,
        border: `${priorityClasses.border} border-2 border-dashed`,
      };
    }
    
    // For continuation events (last day but not first day), make them slightly transparent
    if (event.isLastDay && !event.isFirstDay && !isEndMarker) {
      return {
        ...priorityClasses,
        bg: `${priorityClasses.bg} opacity-60`,
      };
    }
    
    return priorityClasses;
  };

  const eventClasses = getEventClasses();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          className={cn(
            `px-2 py-1 cursor-pointer transition-all duration-300 flex items-start gap-x-2`,
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
          <div className={`${eventClasses.bg} ${eventClasses.hoverBg} p-1 border mt-1 ${eventClasses.border} w-fit rounded-3xl`} />
          <div className={cn(`w-full h-fit flex flex-col ${eventClasses.text}`,
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
              {getEventTitle()} 
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
