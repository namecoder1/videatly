import * as React from "react"

import { cn, formatDate } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarPlus, Clock, Link2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "./textarea"
import { createTodo, deleteTodo, updateTodo } from "@/app/(protected)/production/[id]/actions"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { TodoProps, IdeaData } from "@/types/types"
import { Checkbox } from "./checkbox"
import { formatStringDate } from "@/lib/utils"
import TodoLittle from "../blocks/(protected)/todo-little"
import Swipeable from "./swipeable"
import { Card } from "./card"
import Link from "next/link"

const TIME_SLOTS = [
  // Morning slots
  { label: 'Early Morning', time: '08:00', period: 'am' },
  { label: 'Early Morning', time: '08:30', period: 'am' },
  { label: 'Morning', time: '09:00', period: 'am' },
  { label: 'Morning', time: '09:30', period: 'am' },
  { label: 'Late Morning', time: '10:00', period: 'am' },
  { label: 'Late Morning', time: '10:30', period: 'am' },
  { label: 'Late Morning', time: '11:00', period: 'am' },
  { label: 'Late Morning', time: '11:30', period: 'am' },
  // Afternoon slots
  { label: 'Noon', time: '12:00', period: 'pm' },
  { label: 'Early Afternoon', time: '12:30', period: 'pm' },
  { label: 'Early Afternoon', time: '01:00', period: 'pm' },
  { label: 'Early Afternoon', time: '01:30', period: 'pm' },
  { label: 'Afternoon', time: '02:00', period: 'pm' },
  { label: 'Afternoon', time: '02:30', period: 'pm' },
  { label: 'Late Afternoon', time: '03:00', period: 'pm' },
  { label: 'Late Afternoon', time: '03:30', period: 'pm' },
  { label: 'Late Afternoon', time: '04:00', period: 'pm' },
  { label: 'Late Afternoon', time: '04:30', period: 'pm' },
  // Evening slots
  { label: 'Early Evening', time: '05:00', period: 'pm' },
  { label: 'Early Evening', time: '05:30', period: 'pm' },
  { label: 'Evening', time: '06:00', period: 'pm' },
  { label: 'Evening', time: '06:30', period: 'pm' },
  { label: 'Late Evening', time: '07:00', period: 'pm' },
  { label: 'Late Evening', time: '07:30', period: 'pm' },
  { label: 'Late Evening', time: '08:00', period: 'pm' },
  { label: 'Late Evening', time: '08:30', period: 'pm' },
]

type TodoMode = 'create' | 'update'

export function TodoCreator({ 
  className, 
  defaultValue, 
  ideaId, 
  scriptId, 
  userId, 
  mode = 'create',
  context = 'production',
  todo,
  onUpdate,
  ideas,
  onIdeaSelect
}: { 
  className?: string
  defaultValue: Date
  ideaId: number
  scriptId: number
  userId: string
  mode?: TodoMode
  context?: 'production' | 'calendar'
  todo?: TodoProps
  onUpdate?: () => void
  ideas?: IdeaData[]
  onIdeaSelect?: (idea: IdeaData) => void
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const swipeableRef = useRef<HTMLDivElement>(null)
  
  // Initialize times from todo if in update mode, otherwise use default
  const defaultTime = todo ? todo.start_time.split(':').map(num => num.padStart(2, '0')).join(':') : format(defaultValue, 'HH:mm')
  const defaultPeriod = todo ? (parseInt(todo.start_time.split(':')[0]) >= 12 ? 'pm' : 'am') : format(defaultValue, 'a').toLowerCase()
  
  const [startTime, setStartTime] = useState({ 
    time: defaultTime, 
    period: defaultPeriod 
  })
  const [endTime, setEndTime] = useState({ 
    time: todo ? todo.end_time?.split(':').map(num => num.padStart(2, '0')).join(':') : defaultTime,
    period: todo ? (parseInt(todo.end_time?.split(':')[0] || '0') >= 12 ? 'pm' : 'am') : defaultPeriod
  })

  const handleStartTimeChange = (value: string) => {
    const [time, period] = value.split('|')
    setStartTime({ time, period })
    // Auto-set end time to 30 minutes later if not set
    if (!endTime.time) {
      const [hours, minutes] = time.split(':').map(Number)
      let endHours = hours
      let endMinutes = minutes + 30
      let endPeriod = period

      if (endMinutes >= 60) {
        endHours = (endHours + 1) % 12 || 12
        endMinutes = 0
        if (endHours === 1 && period === 'am') {
          endPeriod = 'pm'
        }
      }

      const newEndTime = { 
        time: `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`, 
        period: endPeriod 
      }
      setEndTime(newEndTime)
    }
  }

  const handleEndTimeChange = (value: string) => {
    const [time, period] = value.split('|')
    setEndTime({ time, period })
  }

  const handleSubmit = async (formData: any) => {
    const formDataToSubmit = new FormData()
    formDataToSubmit.append('title', formData.title)
    formDataToSubmit.append('description', formData.description)

    // Gestione robusta degli orari e della data
    let skipDateAndTime = (mode === 'update' && todo && !formData.editTime)
    if (!skipDateAndTime) {
      formDataToSubmit.append('date', format(defaultValue, 'yyyy-MM-dd'))
      const startTimeValue = `${startTime.time} ${startTime.period}`
      const endTimeValue = `${endTime.time} ${endTime.period}`
      formDataToSubmit.append('startTime', startTimeValue)
      formDataToSubmit.append('endTime', endTimeValue)
    }
    formDataToSubmit.append('priority', formData.priority.toLowerCase())
    formDataToSubmit.append('idea_id', ideaId.toString())
    formDataToSubmit.append('script_id', scriptId.toString())
    formDataToSubmit.append('user_id', userId)
    formDataToSubmit.append('status', formData.status.toLowerCase())
    formDataToSubmit.append('category', formData.category)

    if (!formData.title || !formData.description || !startTime.time || !endTime.time || !formData.priority || !formData.category) {
      toast({
        title: 'Please fill in all fields',
        description: 'To create a todo, you need to fill in all fields',
        variant: 'destructive',
      })
      return
    }

    try {
      let result
      if (mode === 'update' && todo) {
        formDataToSubmit.append('id', todo.id.toString())
        result = await updateTodo(formDataToSubmit)
      } else {
        result = await createTodo(formDataToSubmit)
      }
      
      if (result.error) {
        toast({
          title: `Failed to ${mode === 'update' ? 'update' : 'create'} todo`,
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: `Todo ${mode === 'update' ? 'updated' : 'created'} successfully`,
        description: `Your todo has been ${mode === 'update' ? 'updated' : 'created'} successfully`,
        variant: 'success',
      })
      
      // Close the dialog/drawer
      setOpen(false)
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate()
      }
      
      // Revalidate the router to update all server components
      router.refresh()
    } catch (error) {
      toast({
        title: `An error occurred while ${mode === 'update' ? 'updating' : 'creating'} the todo`,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      console.error(error)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await deleteTodo(todo?.id.toString() || '')
      
      if (result.error) {
        toast({
          title: 'Failed to delete todo',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Todo deleted successfully',
        description: 'Your todo has been deleted successfully',
        variant: 'success',
      })
      router.refresh()

      // Close the dialog/drawer
      setOpen(false)
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate()
      }
      
      // Revalidate the router to update all server components
      router.refresh()
    } catch (error) {
      toast({
        title: 'Failed to delete todo',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      console.error(error)
    }
  }

  const getTriggerButton = () => {
    if (mode === 'update' && context === 'production' && todo) {
      return (
        <TodoLittle todo={todo} showDate={false} onClick={() => setOpen(true)} className="cursor-pointer" showIdea={false} />
      )
    }

    if (mode === 'update' && context === 'calendar' && todo) {
      return (
        <TodoLittle todo={todo} showDate={false} onClick={() => setOpen(true)} className="cursor-pointer" showIdea={true} />
      )
    }

    return (
      <Button className={cn('w-fit', className)} variant="black" size="sm">
        <CalendarPlus className="h-4 w-4 mr-2" /> Add Event
      </Button>
    )
  }

  if (isDesktop) {
    return mode === 'update' ? (
      <Swipeable ref={swipeableRef} onSwipe={handleDelete}>
        <Dialog open={open} onOpenChange={(newOpen) => {
          const swipeableElement = swipeableRef.current;
          const isSwiping = swipeableElement?.getAttribute('data-swiping') === 'true';
          const swipeProgress = parseFloat(swipeableElement?.getAttribute('data-swipe-progress') || '0');
          if (isSwiping || swipeProgress > 0.2) return;
          setOpen(newOpen);
        }}>
          <DialogTrigger asChild className="w-full">
            {getTriggerButton()}
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <DialogDescription asChild>
              <div className="flex flex-col gap-4">
                {ideas && <IdeaDatas ideas={ideas} ideaId={ideaId} />}
                <TodoForm 
                  onSubmit={handleSubmit}
                  startTime={startTime}
                  endTime={endTime}
                  onStartTimeChange={handleStartTimeChange}
                  onEndTimeChange={handleEndTimeChange}
                  mode={mode}
                  todo={todo}
                  handleDelete={handleDelete}
                  ideas={ideas}
                  onIdeaSelect={onIdeaSelect}
                  ideaId={ideaId}
                />
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </Swipeable>
    ) : (
      <Dialog open={open} onOpenChange={(newOpen) => {
        const swipeableElement = swipeableRef.current;
        const isSwiping = swipeableElement?.getAttribute('data-swiping') === 'true';
        const swipeProgress = parseFloat(swipeableElement?.getAttribute('data-swipe-progress') || '0');
        if (isSwiping || swipeProgress > 0.2) return;
        setOpen(newOpen);
      }}>
        <DialogTrigger asChild className="w-full">
          {getTriggerButton()}
        </DialogTrigger>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <TodoForm 
              onSubmit={handleSubmit}
              startTime={startTime}
              endTime={endTime}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
              mode={mode}
              todo={todo}
              handleDelete={handleDelete}
              ideas={ideas}
              onIdeaSelect={onIdeaSelect}
              ideaId={ideaId}
            />
          </DialogDescription>
        </DialogContent>
      </Dialog>
    )
  }

  return mode === 'update' ? (
    <Swipeable ref={swipeableRef} onSwipe={handleDelete}>
      <Drawer open={open} onOpenChange={(newOpen) => {
        const swipeableElement = swipeableRef.current;
        const isSwiping = swipeableElement?.getAttribute('data-swiping') === 'true';
        const swipeProgress = parseFloat(swipeableElement?.getAttribute('data-swipe-progress') || '0');
        if (isSwiping || swipeProgress > 0.2) return;
        setOpen(newOpen);
      }}>
        <DrawerTrigger asChild className="w-full">
          {getTriggerButton()}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pt-2">
            <DrawerTitle>Edit Event</DrawerTitle>
          </DrawerHeader>
          <DrawerDescription asChild>
            <div className="flex flex-col gap-4">
              {ideas && <IdeaDatas ideas={ideas} ideaId={ideaId} mobile={true} />}
              <TodoForm 
                onSubmit={handleSubmit}
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
                mode={mode}
                todo={todo}
                handleDelete={handleDelete}
                ideas={ideas}
                onIdeaSelect={onIdeaSelect}
                ideaId={ideaId}
                className="p-4"
              />
            </div>
          </DrawerDescription>
        </DrawerContent>
      </Drawer>
    </Swipeable>
  ) : (
    <Drawer open={open} onOpenChange={(newOpen) => {
      const swipeableElement = swipeableRef.current;
      const isSwiping = swipeableElement?.getAttribute('data-swiping') === 'true';
      const swipeProgress = parseFloat(swipeableElement?.getAttribute('data-swipe-progress') || '0');
      if (isSwiping || swipeProgress > 0.2) return;
      setOpen(newOpen);
    }}>
      <DrawerTrigger asChild className="w-full">
        {getTriggerButton()}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pt-2">
          <DrawerTitle>Add Event</DrawerTitle>
        </DrawerHeader>
        <DrawerDescription asChild>
          <TodoForm 
            onSubmit={handleSubmit}
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            mode={mode}
            todo={todo}
            handleDelete={handleDelete}
            ideas={ideas}
            onIdeaSelect={onIdeaSelect}
            ideaId={ideaId}
            className="p-4"
          />
        </DrawerDescription>
      </DrawerContent>
    </Drawer>
  )
}

interface TodoFormProps extends React.ComponentProps<"form"> {
  onSubmit: (formData: any) => void;
  startTime: { time: string; period: string };
  endTime: { time: string; period: string };
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  mode: TodoMode;
  todo?: TodoProps;
  handleDelete: () => void;
  ideas?: IdeaData[];
  onIdeaSelect?: (idea: IdeaData) => void;
  ideaId: number;
}

const IdeaDatas = ({ ideas, ideaId, mobile=false }: { ideas: IdeaData[] | undefined, ideaId: number, mobile?: boolean }) => {
  return (
    <Card className={`p-4 ${mobile ? 'mx-4' : ''}`}>
      <h3 className="text-md font-semibold">{ideas?.find(idea => idea.id.toString() === ideaId.toString())?.title || 'Not found'}</h3>
      <div className="flex items-center justify-between mt-1 gap-2">
        <Link href={`/ideas/${ideas?.find(idea => idea.id.toString() === ideaId.toString())?.id}`} className="flex items-center gap-2 hover:underline underline-offset-4">
          <Link2 size={16} />
          <p className="text-sm">View Idea</p>
        </Link>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <CalendarPlus size={16} />
          {formatDate(ideas?.find(idea => idea.id.toString() === ideaId.toString())?.pub_date || '', 'normal') || 'No description'}
        </p>
      </div>
    </Card>
  )
}

function TodoForm({ 
  className, 
  onSubmit, 
  startTime, 
  endTime, 
  onStartTimeChange, 
  onEndTimeChange, 
  mode, 
  todo, 
  handleDelete,
  ideas,
  onIdeaSelect,
  ideaId
}: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: todo?.title || '',
    description: todo?.description || '',
    priority: todo?.priority || '',
    status: 'Pending',
    category: todo?.category || '',
    editTime: false,
  })
  const [editTime, setEditTime] = useState(false)

  // Sincronizza editTime tra stato locale e formData
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, editTime }))
  }, [editTime])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(formData)
  }

  function formatTime12h(time: string, period: string) {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = String(((parseInt(h) + 11) % 12) + 1).padStart(2, '0');
    return `${hour}:${m} ${period.toUpperCase()}`;
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-4', className)}>
      {mode === 'create' && ideas && onIdeaSelect && (
        <div className='flex flex-col gap-2'>
          <Label>Production</Label>
          <Select 
            value={ideaId.toString()} 
            onValueChange={(value) => {
              const selectedIdea = ideas.find(idea => idea.id.toString() === value)
              if (selectedIdea) {
                onIdeaSelect(selectedIdea)
              }
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select a production' className='w-full' />
            </SelectTrigger>
            <SelectContent>
              {ideas.map((idea) => (
                <SelectItem key={idea.id} value={idea.id.toString()}>
                  {idea.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className='flex flex-col gap-2'>
        <Label>Title</Label>
        <Input 
          type="text" 
          value={formData.title} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label>Description</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label>Time</Label>
        <div className="flex flex-col border rounded-3xl p-4 bg-card w-full">
          <div className="flex items-center gap-2">
            {mode === 'update' && (
              <div className="flex-1 mb-4">
                <Label className="text-xs text-muted-foreground">Current Time</Label>
                <p className="text-sm">{formatStringDate(todo?.start_time || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {formatStringDate(todo?.end_time || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            )}
            {mode === 'update' && (
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="edit-time" 
                  checked={editTime}
                  onCheckedChange={(checked) => setEditTime(checked as boolean)}
                />
                <Label htmlFor="edit-time" className="text-sm">Edit Time</Label>
              </div>
            )}
          </div>
          {(mode === 'create' || editTime) && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs text-muted-foreground">Start</Label>
                <Select 
                  value={`${startTime.time}|${startTime.period}`} 
                  onValueChange={onStartTimeChange}
                >
                  <SelectTrigger className="w-[140px]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Start time">
                        {startTime.time && startTime.period
                          ? formatTime12h(startTime.time, startTime.period)
                          : 'Start Time'}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className='max-h-[400px] overflow-y-auto'>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem 
                        key={`start-${slot.time}-${slot.period}`} 
                        value={`${slot.time}|${slot.period}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{slot.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {slot.time} {slot.period.toUpperCase()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1.5">
                <Label className="text-xs text-muted-foreground">End</Label>
                <Select 
                  value={`${endTime.time}|${endTime.period}`} 
                  onValueChange={onEndTimeChange}
                >
                  <SelectTrigger className="w-[140px]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="End time">
                        {endTime.time && endTime.period
                          ? formatTime12h(endTime.time, endTime.period)
                          : 'End Time'}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className='max-h-[400px] overflow-y-auto'>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem 
                        key={`end-${slot.time}-${slot.period}`} 
                        value={`${slot.time}|${slot.period}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{slot.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {slot.time} {slot.period.toUpperCase()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <div className='flex flex-1 flex-col gap-2'>
          <Label>Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Priority' className='w-full' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='low'>Low</SelectItem>
              <SelectItem value='medium'>Medium</SelectItem>
              <SelectItem value='high'>High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-1 flex-col gap-2'>
          <Label>Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Category' className='w-full' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='production'>Production</SelectItem>
              <SelectItem value='post-production'>Post-Production</SelectItem>
              <SelectItem value='pre-production'>Pre-Production</SelectItem>
              <SelectItem value='other'>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center ml-auto gap-2">
        <Button type='submit' variant='black' className='w-fit ml-auto'>
          {mode === 'update' ? 'Update Event' : 'Add Event'}
        </Button>
      </div>
    </form>
  )
}