import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCalendarContext } from '../../calendar-context'

export default function CalendarHeaderActionsAdd() {
  const { newEventDialogOpen, setNewEventDialogOpen, dict } = useCalendarContext()
  
  // Toggle the dialog state when button is clicked
  const handleClick = () => {
    setNewEventDialogOpen(!newEventDialogOpen)
  }
  
  return (
    <Button
      variant='outline'
      onClick={handleClick}
      className='h-full'
    >
      <Plus />
      {dict.calendarPage.addEvent}
    </Button>
  )
}
