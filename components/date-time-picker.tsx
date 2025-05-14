'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface DateTimePickerProps {
  field: {
    value: string
    onChange: (value: string) => void
  }
}

export function DateTimePicker({ field }: DateTimePickerProps) {
  // Parse the initial date safely
  const parseInitialDate = (): Date => {
    try {
      if (field.value) {
        const date = new Date(field.value)
        // Check if the date is valid
        if (!isNaN(date.getTime())) {
          return date
        }
      }
      return new Date()
    } catch (error) {
      console.error('Error parsing date:', error)
      return new Date()
    }
  }

  const [date, setDate] = React.useState<Date>(parseInitialDate())
  const [isOpen, setIsOpen] = React.useState(false)

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)

  // Format date as ISO string with correct format for input
  const formatDateForField = (date: Date): string => {
    try {
      // Format as timestamp with timezone (timestamptz)
      return date.toISOString()
    } catch (error) {
      console.error('Error formatting date:', error)
      return new Date().toISOString()
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(date)
      newDate.setFullYear(selectedDate.getFullYear())
      newDate.setMonth(selectedDate.getMonth())
      newDate.setDate(selectedDate.getDate())
      setDate(newDate)
      field.onChange(formatDateForField(newDate))
    }
  }

  const handleTimeChange = (
    type: 'hour' | 'minute' | 'ampm',
    value: string
  ) => {
    const newDate = new Date(date)
    if (type === 'hour') {
      newDate.setHours(
        (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
      )
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(value))
    } else if (type === 'ampm') {
      const currentHours = newDate.getHours()
      const isPM = value === 'PM'
      if (isPM && currentHours < 12) {
        newDate.setHours(currentHours + 12)
      } else if (!isPM && currentHours >= 12) {
        newDate.setHours(currentHours - 12)
      }
    }
    setDate(newDate)
    field.onChange(formatDateForField(newDate))
  }

  // Update the date state when the field value changes externally
  React.useEffect(() => {
    if (field.value) {
      try {
        const newDate = new Date(field.value)
        if (!isNaN(newDate.getTime())) {
          setDate(newDate)
        }
      } catch (error) {
        console.error('Error updating date from field value:', error)
      }
    }
  }, [field.value])

  // Prevent clicks inside the popover from closing it
  const handlePopoverClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, 'MMM dd, yyyy hh:mm aa')
          ) : (
            <span>Select date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" onClick={handlePopoverClick}>
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-full sm:w-auto h-40 sm:h-auto">
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      date && date.getHours() % 12 === hour % 12
                        ? 'default'
                        : 'ghost'
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTimeChange('hour', hour.toString());
                    }}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-full sm:w-auto h-40 sm:h-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      date && date.getMinutes() === minute ? 'default' : 'ghost'
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTimeChange('minute', minute.toString());
                    }}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-full sm:w-auto h-40 sm:h-auto">
              <div className="flex sm:flex-col p-2">
                {['AM', 'PM'].map((ampm) => (
                  <Button
                    key={ampm}
                    size="icon"
                    variant={
                      date &&
                      ((ampm === 'AM' && date.getHours() < 12) ||
                        (ampm === 'PM' && date.getHours() >= 12))
                        ? 'default'
                        : 'ghost'
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTimeChange('ampm', ampm);
                    }}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
