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
import { format, parseISO, addMinutes } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarPlus, Clock, Link2, Calendar as CalendarIcon, ChevronDown, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "./textarea"
import { createTodo, deleteTodo, updateTodo } from "@/app/[lang]/(protected)/production/[id]/actions"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { TodoProps, IdeaWithScripts, TodoFormProps } from "@/types/types"
import { Checkbox } from "./checkbox"
import TodoLittle from "../blocks/(protected)/todo-little"
import { Card } from "./card"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"



// Generate time slots for every 30 minutes
const generateTimeSlots = (dict: any) => {
  const slots = [];
  for (let hour = 5; hour < 24; hour++) {
    const period = hour < 12 ? 'am' : 'pm';
    const displayHour = hour % 12 || 12;
    
    // Add slots for :00 and :30
    slots.push({
      label: getTimeLabel(hour, dict),
      time: `${hour.toString().padStart(2, '0')}:00`,
      period,
      displayHour,
      displayMinutes: '00'
    });
    
    slots.push({
      label: getTimeLabel(hour, dict),
      time: `${hour.toString().padStart(2, '0')}:30`,
      period,
      displayHour,
      displayMinutes: '30'
    });
  }
  return slots;
};

// Helper to get time of day label
const getTimeLabel = (hour: number, dict: any) => {
  if (hour >= 5 && hour < 8) return dict.calendarPage.hours[0];
  if (hour >= 8 && hour < 10) return dict.calendarPage.hours[1];
  if (hour >= 10 && hour < 12) return dict.calendarPage.hours[2];
  if (hour >= 12 && hour < 13) return dict.calendarPage.hours[3];
  if (hour >= 13 && hour < 16) return dict.calendarPage.hours[4];
  if (hour >= 16 && hour < 19) return dict.calendarPage.hours[5];
  if (hour >= 19 && hour < 22) return dict.calendarPage.hours[6];
  return dict.calendarPage.hours[7];
};




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
  onIdeaSelect,
  dict,
  initialOpen = false,
}: { 
  className?: string
  defaultValue: Date
  ideaId: string
  scriptId: string
  userId: string
  mode?: 'create' | 'update'
  context?: 'production' | 'calendar'
  todo?: TodoProps
  onUpdate?: () => void
  ideas?: IdeaWithScripts[]
  onIdeaSelect?: (idea: IdeaWithScripts) => void
  dict?: any
  initialOpen?: boolean
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const router = useRouter()
  const [open, setOpen] = useState(initialOpen)
  const { toast } = useToast()
  
  // Date state for both start and end time
  const [startDate, setStartDate] = useState<Date>(todo?.start_date 
    ? new Date(todo.start_date) 
    : defaultValue)
  
  const [endDate, setEndDate] = useState<Date>(todo?.end_date 
    ? new Date(todo.end_date) 
    : addMinutes(defaultValue, 30))
  
  // State for popover open status
  const [startPickerOpen, setStartPickerOpen] = useState(false)
  const [endPickerOpen, setEndPickerOpen] = useState(false)

  // Set open state when initialOpen changes - this ensures the component respects external state
  useEffect(() => {
    console.log('TodoCreator - initialOpen changed:', initialOpen)
    setOpen(initialOpen)
  }, [initialOpen])
  
  // Make sure we call onUpdate when the dialog is closed externally
  const handleOpenChange = async (newOpenState: boolean) => {
    console.log('TodoCreator - handleOpenChange called:', { newOpenState, currentOpen: open })
    if (!newOpenState) {
      // If we're closing, update state first
      if (onUpdate) {
        console.log('TodoCreator - calling onUpdate before closing')
        try {
          await onUpdate()
          console.log('TodoCreator - onUpdate completed successfully')
        } catch (error) {
          console.error('TodoCreator - onUpdate failed:', error)
        }
      }
    }
    // Then update the open state
    console.log('TodoCreator - setting open state to:', newOpenState)
    setOpen(newOpenState)
  }

  // Handle date changes
  const handleStartDateChange = (date: Date | undefined) => {
    console.log('TodoCreator - handleStartDateChange:', date)
    if (date) {
      const newDate = new Date(date);
      // Preserve the time from the current startDate
      if (startDate) {
        newDate.setHours(startDate.getHours());
        newDate.setMinutes(startDate.getMinutes());
      }
      
      // Set the new date
      setStartDate(newDate);
      
      // If end date is before the new start date, adjust it
      if (endDate < newDate) {
        const newEndDate = new Date(newDate);
        newEndDate.setMinutes(newEndDate.getMinutes() + 30);
        setEndDate(newEndDate);
      }
    }
  };
  
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      // Preserve the time from the current endDate
      if (endDate) {
        newDate.setHours(endDate.getHours());
        newDate.setMinutes(endDate.getMinutes());
      }
      
      // Ensure end date is not before start date
      if (newDate >= startDate) {
        setEndDate(newDate);
      } else {
        // If the selected end date is before start date, set it to start date + 30 min
        toast({
          title: dict?.calendarPage?.toast?.invalidDateRange?.[0] || "Invalid date range",
          description: dict?.calendarPage?.toast?.invalidDateRange?.[1] || "End date cannot be before start date",
          variant: 'destructive',
        });
        const adjustedDate = new Date(startDate);
        adjustedDate.setMinutes(adjustedDate.getMinutes() + 30);
        setEndDate(adjustedDate);
      }
    }
  };
  
  // Handle time changes
  const handleStartTimeChange = (time: string) => {
    const [hourStr, minuteStr] = time.split(':')
    const newDate = new Date(startDate)
    newDate.setHours(parseInt(hourStr))
    newDate.setMinutes(parseInt(minuteStr))
    setStartDate(newDate)
    
    // If end time is now before start time, adjust it
    if (endDate < newDate) {
      setEndDate(addMinutes(newDate, 30))
    }
  }
  
  const handleEndTimeChange = (time: string) => {
    const [hourStr, minuteStr] = time.split(':')
    const newDate = new Date(endDate)
    newDate.setHours(parseInt(hourStr))
    newDate.setMinutes(parseInt(minuteStr))
    
    // Validate that end time is after start time
    if (newDate > startDate) {
      setEndDate(newDate)
    } else {
      toast({
        title: dict?.calendarPage?.toast?.invalidTimeRange?.[0] || "Invalid time range",
        description: dict?.calendarPage?.toast?.invalidTimeRange?.[1] || "End time must be after start time",
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (formData: any) => {
    console.log('TodoCreator - handleSubmit called:', { mode, formData })
    console.log('TodoCreator - ideaId:', ideaId)
    console.log('TodoCreator - ideas:', ideas)
    console.log('TodoCreator - selected idea_id:', formData.idea_id)
    
    const formDataToSubmit = new FormData()
    formDataToSubmit.append('title', formData.title)
    formDataToSubmit.append('description', formData.description)

    // Handle date and times with timezone for timestamptz
    let skipDateAndTime = (mode === 'update' && todo && !formData.editTime)
    if (!skipDateAndTime) {
      // Store the date as ISO string to preserve timezone info
      const startISOString = startDate.toISOString()
      const endISOString = endDate.toISOString()
      
      formDataToSubmit.append('start_date', startISOString)
      formDataToSubmit.append('end_date', endISOString)
    }
    
    formDataToSubmit.append('priority', formData.priority.toLowerCase())
    
    // Use the selected idea ID from the form if available, otherwise use the prop
    const selectedIdeaId = formData.idea_id || ideaId.toString();
    formDataToSubmit.append('idea_id', selectedIdeaId)
    
    // Find the corresponding script ID for the selected idea
    let scriptIdToUse = scriptId;
    if (ideas && ideas.length > 0) {
      const selectedIdea = ideas.find(idea => idea.id.toString() === selectedIdeaId);
      if (selectedIdea && 'scripts' in selectedIdea && Array.isArray(selectedIdea.scripts) && selectedIdea.scripts.length > 0) {
        scriptIdToUse = selectedIdea.scripts[0].id;
      }
    }
    
    formDataToSubmit.append('script_id', scriptIdToUse.toString())
    formDataToSubmit.append('user_id', userId)
    formDataToSubmit.append('status', formData.status.toLowerCase())
    formDataToSubmit.append('category', formData.category)

    if (!formData.title || !formData.description || !formData.priority || !formData.category) {
      toast({
        title: dict?.calendarPage?.toast?.fillFields?.[0],
        description: dict?.calendarPage?.toast?.fillFields?.[1],
        variant: 'destructive',
      })
      return
    }

    try {
      let result
      if (mode === 'update' && todo) {
        console.log('TodoCreator - updating existing todo:', todo.id)
        formDataToSubmit.append('id', todo.id.toString())
        result = await updateTodo(formDataToSubmit)
      } else {
        console.log('TodoCreator - creating new todo')
        result = await createTodo(formDataToSubmit)
      }
      
      if (result.error) {
        console.error('TodoCreator - operation failed:', result.error)
        if (mode === 'update') {
          toast({
            title: dict?.calendarPage?.toast?.updateError?.[0],
            description: dict?.calendarPage?.toast?.updateError?.[1],
            variant: 'destructive',
          })
        } else {
          toast({
            title: dict?.calendarPage?.toast?.creationError?.[0],
            description: dict?.calendarPage?.toast?.creationError?.[1],
            variant: 'destructive',
          })
        }
        return
      }

      console.log('TodoCreator - operation successful, closing dialog')
      // Close the dialog/drawer and update state
      if (onUpdate) {
        console.log('TodoCreator - calling onUpdate after successful operation')
        await onUpdate()
      }
      setOpen(false)
      
      // Revalidate the router to update all server components
      router.refresh()
    } catch (error) {
      console.error('TodoCreator - unexpected error:', error)
      if (mode === 'update') {
        toast({
          title: dict?.calendarPage?.toast?.updateError?.[0],
          description: dict?.calendarPage?.toast?.updateError?.[1],
          variant: 'destructive',
        })
      } else {
        toast({
          title: dict?.calendarPage?.toast?.randomError?.[0],
          description: dict?.calendarPage?.toast?.randomError?.[1],
          variant: 'destructive',
        })
      }
    }
  }

  const handleDelete = async () => {
    console.log('TodoCreator - handleDelete called for todo:', todo?.id)
    try {
      const result = await deleteTodo(todo?.id.toString() || '')
      
      if (result.error) {
        console.error('TodoCreator - delete failed:', result.error)
        toast({
          title: dict?.calendarPage?.toast?.deleteError?.[0],
          description: dict?.calendarPage?.toast?.deleteError?.[1],
          variant: 'destructive',
        })
        return
      }

      console.log('TodoCreator - delete successful, closing dialog')
      // Close the dialog/drawer and update state
      if (onUpdate) {
        console.log('TodoCreator - calling onUpdate after successful delete')
        await onUpdate()
      }
      setOpen(false)
      
      // Revalidate the router to update all server components
      router.refresh()
    } catch (error) {
      console.error('TodoCreator - unexpected error during delete:', error)
      toast({
        title: dict?.calendarPage?.toast?.randomError?.[0],
        description: dict?.calendarPage?.toast?.randomError?.[1],
        variant: 'destructive',
      })
    }
  }

  const getTriggerButton = () => {
    if (mode === 'update' && context === 'production' && todo) {
      return (
        <TodoLittle todo={todo} showDate={false} onClick={() => setOpen(true)} className="cursor-pointer hidden" showIdea={false} />
      )
    }


    return (
      <Button className={cn('w-fit hidden', className)} variant="black" size="sm" >
        <CalendarPlus className="h-4 w-4 mr-2" /> {dict.calendarPage.addEvent}
      </Button>
    )
  }

  if (context === 'calendar') {
    if (isDesktop) {
      if (mode === 'update') {
          return (
            <Dialog open={open} onOpenChange={(newOpen) => {
              handleOpenChange(newOpen);
            }}>
              <DialogTrigger asChild className="hidden">
                {getTriggerButton()}
              </DialogTrigger>
              <DialogContent className='max-w-md'>
                <DialogHeader>
                  <DialogTitle>{dict?.calendarPage?.editEvent || "Edit Event"}</DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                  <div className="flex flex-col gap-4">
                    {ideas && context === 'calendar' && <IdeaDatas ideas={ideas} ideaId={ideaId} dict={dict} />}
                    <TodoForm 
                      onSubmit={handleSubmit}
                      mode={mode}
                      todo={todo}
                      handleDelete={handleDelete}
                      ideas={ideas}
                      onIdeaSelect={onIdeaSelect}
                      ideaId={ideaId}
                      dict={dict}
                      context={context}
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                      onStartTimeChange={handleStartTimeChange}
                      onEndTimeChange={handleEndTimeChange}
                    />
                  </div>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          )
        
      }
  
      if (mode === 'create') {
        return (
          <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild className="hidden">
            {getTriggerButton()}
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>{dict?.calendarPage?.addEvent || "Add Event"}</DialogTitle>
            </DialogHeader>
            <DialogDescription asChild>
              <TodoForm 
                onSubmit={handleSubmit}
                mode={mode}
                todo={todo}
                handleDelete={handleDelete}
                ideas={ideas}
                onIdeaSelect={onIdeaSelect}
                ideaId={ideaId}
                dict={dict}
                context={context}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
              />
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )
      }
  
      return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild className="hidden">
            {getTriggerButton()}
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>{dict?.calendarPage?.addEvent || "Add Event"}</DialogTitle>
            </DialogHeader>
            <DialogDescription asChild>
              <TodoForm 
                onSubmit={handleSubmit}
                mode={mode}
                todo={todo}
                handleDelete={handleDelete}
                ideas={ideas}
                onIdeaSelect={onIdeaSelect}
                ideaId={ideaId}
                dict={dict}
                context={context}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
              />
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );
    }
  
    return mode === 'update' ? (
      <Drawer open={open} onOpenChange={(newOpen) => {
        handleOpenChange(newOpen);
      }}>
        <DrawerTrigger asChild className="hidden">
          {getTriggerButton()}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pt-2">
            <DrawerTitle>{dict?.calendarPage?.editEvent || "Edit Event"}</DrawerTitle>
          </DrawerHeader>
          <DrawerDescription asChild>
            <div className="flex flex-col gap-4">
              {ideas && context === 'calendar' && <IdeaDatas ideas={ideas} ideaId={ideaId} mobile={true} dict={dict} />}
              <TodoForm 
                onSubmit={handleSubmit}
                mode={mode}
                todo={todo}
                handleDelete={handleDelete}
                ideas={ideas}
                onIdeaSelect={onIdeaSelect}
                ideaId={ideaId}
                className="p-4"
                dict={dict}
                context={context}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
              />
            </div>
          </DrawerDescription>
        </DrawerContent>
      </Drawer>
    ) : (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild className="hidden">
          {getTriggerButton()}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pt-2">
            <DrawerTitle>{dict?.calendarPage?.addEvent || "Add Event"}</DrawerTitle>
          </DrawerHeader>
          <DrawerDescription asChild>
            <TodoForm 
              onSubmit={handleSubmit}
              mode={mode}
              todo={todo}
              handleDelete={handleDelete}
              ideas={ideas}
              onIdeaSelect={onIdeaSelect}
              ideaId={ideaId}
              className="p-4"
              dict={dict}
              context={context}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
            />
          </DrawerDescription>
        </DrawerContent>
      </Drawer>
    )
  } else {
    if (isDesktop) {
      if (mode === 'update') {
        return (
          <Dialog open={open} onOpenChange={(newOpen) => {
            handleOpenChange(newOpen);
          }}>
            <DialogTrigger asChild className="hidden">
              {getTriggerButton()}
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>{dict?.calendarPage?.editEvent || "Edit Event"}</DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <div className="flex flex-col gap-4">
                  <TodoForm 
                    onSubmit={handleSubmit}
                    mode={mode}
                    todo={todo}
                    handleDelete={handleDelete}
                    ideas={ideas}
                    onIdeaSelect={onIdeaSelect}
                    ideaId={ideaId}
                    dict={dict}
                    context={context}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={handleStartDateChange}
                    onEndDateChange={handleEndDateChange}
                    onStartTimeChange={handleStartTimeChange}
                    onEndTimeChange={handleEndTimeChange}
                  />
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )
      } else {
        return (
          <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild className="hidden">
            {getTriggerButton()}
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>{dict?.calendarPage?.addEvent || "Add Event"}</DialogTitle>
            </DialogHeader>
            <DialogDescription asChild>
              <TodoForm 
                onSubmit={handleSubmit}
                mode={mode}
                todo={todo}
                ideas={ideas}
                handleDelete={handleDelete}
                onIdeaSelect={onIdeaSelect}
                ideaId={ideaId}
                dict={dict}
                context={context}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
              />
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )
      }
    } else {
      return mode === 'update' ? (
        <Drawer open={open} onOpenChange={(newOpen) => {
          handleOpenChange(newOpen);
        }}>
          <DrawerTrigger asChild className="hidden">
            {getTriggerButton()}
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="pt-2">
              <DrawerTitle>{dict?.calendarPage?.editEvent || "Edit Event"}</DrawerTitle>
            </DrawerHeader>
            <DrawerDescription asChild>
              <div className="flex flex-col gap-4">
                <TodoForm 
                  onSubmit={handleSubmit}
                  mode={mode}
                  todo={todo}
                  handleDelete={handleDelete}
                  ideas={ideas}
                  onIdeaSelect={onIdeaSelect}
                  ideaId={ideaId}
                  className="p-4"
                  dict={dict}
                  context={context}
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={handleStartDateChange}
                  onEndDateChange={handleEndDateChange}
                  onStartTimeChange={handleStartTimeChange}
                  onEndTimeChange={handleEndTimeChange}
                />
              </div>
            </DrawerDescription>
          </DrawerContent>
        </Drawer>
      ) : (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild className="hidden">
          {getTriggerButton()}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pt-2">
            <DrawerTitle>{dict?.calendarPage?.addEvent || "Add Event"}</DrawerTitle>
          </DrawerHeader>
          <DrawerDescription asChild>
            <TodoForm 
              onSubmit={handleSubmit}
              mode={mode}
              todo={todo}
              handleDelete={handleDelete}
              ideas={ideas}
              onIdeaSelect={onIdeaSelect}
              ideaId={ideaId}
              className="p-4"
              dict={dict}
              context={context}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              onStartTimeChange={handleStartTimeChange}
              onEndTimeChange={handleEndTimeChange}
            />
          </DrawerDescription>
        </DrawerContent>
      </Drawer>
      )
    }
  }
}



const IdeaDatas = ({ ideas, ideaId, mobile=false, dict }: { ideas: IdeaWithScripts[] | undefined, ideaId: string, mobile?: boolean, dict: any }) => {
  return (
    <Card className={`p-4 ${mobile ? 'mx-4' : ''}`}>
      <h3 className="text-md font-semibold">{ideas?.find(idea => idea.id.toString() === ideaId.toString())?.title || 'Not found'}</h3>
      <div className="flex items-center justify-between mt-1 gap-2">
        <Link href={`/ideas/${ideas?.find(idea => idea.id.toString() === ideaId.toString())?.id}`} className="flex items-center gap-2 hover:underline underline-offset-4">
          <Link2 size={16} />
          <p className="text-sm">{dict.calendarPage.viewIdea}</p>
        </Link>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <CalendarPlus size={16} />
          {formatDate(ideas?.find(idea => idea.id.toString() === ideaId.toString())?.pub_date || '', 'normal') || dict.calendarPage.noDate}
        </p>
      </div>
    </Card>
  )
}

function TodoForm({ 
  className, 
  onSubmit, 
  mode, 
  todo, 
  handleDelete,
  ideas,
  onIdeaSelect,
  ideaId,
  dict,
  context = 'calendar',
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange
}: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: todo?.title || '',
    description: todo?.description || '',
    priority: todo?.priority || 'medium',
    status: todo?.status || 'pending',
    category: todo?.category || 'production',
    editTime: false,
    idea_id: todo?.idea_id?.toString() || ideaId.toString(),
  })
  const [editTime, setEditTime] = useState(false)
  const TIME_SLOTS = generateTimeSlots(dict);

  
  // State for popover open status
  const [startPickerOpen, setStartPickerOpen] = useState(false)
  const [endPickerOpen, setEndPickerOpen] = useState(false)

  // Synchronize editTime between local state and formData
  useEffect(() => {
    setFormData((prev) => ({ ...prev, editTime }))
  }, [editTime])
  
  // Update form when ideaId prop changes (for new todos)
  useEffect(() => {
    if (!todo) {
      setFormData((prev) => ({ ...prev, idea_id: ideaId.toString() }))
    }
  }, [ideaId, todo])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate that the idea_id exists in the ideas array when ideas are available
    if (ideas && ideas.length > 0) {
      const ideaExists = ideas.find(idea => idea.id.toString() === formData.idea_id)
      if (!ideaExists) {
        console.error('Selected idea does not exist in available ideas:', formData.idea_id)
        return
      }
    }
    
    onSubmit(formData)
  }

  // Handle idea selection
  const handleIdeaChange = (value: string) => {
    setFormData({ ...formData, idea_id: value });
    if (onIdeaSelect && ideas) {
      const selectedIdea = ideas.find(idea => idea.id.toString() === value);
      if (selectedIdea) {
        onIdeaSelect(selectedIdea);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-4', className)}>
      {ideas !== undefined && context === 'calendar' && (
        <div className='flex flex-col gap-2'>
          <Label>{dict.calendarPage.production}</Label>
          <Select 
            value={formData.idea_id} 
            onValueChange={handleIdeaChange}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={dict.calendarPage.productionPlaceholder} className='w-full' />
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
        <Label>{dict.calendarPage.formTitle}</Label>
        <Input 
          type="text" 
          value={formData.title} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label>{dict.calendarPage.formDescription}</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label>{dict.calendarPage.formTime}</Label>
        <div className="flex flex-col border rounded-3xl p-4 bg-card w-full">
          <div className="flex items-center gap-2">
            {mode === 'update' && (
              <div className="flex-1 mb-4">
                <Label className="text-xs text-muted-foreground">{dict.calendarPage.formCurrentTime}</Label>
                <p className="text-sm border w-fit py-1 px-2 rounded-md">
                  {todo?.start_date && format(new Date(todo.start_date), 'MMM dd, yyyy HH:mm')} - 
                  {todo?.end_date && format(new Date(todo.end_date), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
            {mode === 'update' && (
              <div className="flex items-center gap-2">
                <Label htmlFor="edit-time" className="text-sm">{dict.calendarPage.formEditTime}</Label>
                <Checkbox 
                  id="edit-time" 
                  checked={editTime}
                  onCheckedChange={(checked) => setEditTime(checked as boolean)}
                />
              </div>
            )}
          </div>
          
          {(mode === 'create' || editTime) && (
            <div className="space-y-4">
              {/* Start Date & Time */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{dict.calendarPage.formStartTime}</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Date Picker */}
                  <div className="relative z-10 w-full sm:w-auto">
                    <DatePickerWithPrevent
                      selected={startDate}
                      open={startPickerOpen}
                      onOpenChange={setStartPickerOpen}
                      onSelect={onStartDateChange}
                    />
                  </div>
                  
                  {/* Time Picker */}
                  <Select
                    value={format(startDate, 'HH:mm')}
                    onValueChange={onStartTimeChange}
                  >
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <SelectValue>
                          {format(startDate, 'HH:mm')}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="h-80">
                      <ScrollArea className="h-80">
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem
                            key={`start-${slot.time}`}
                            value={slot.time}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{slot.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date().setHours(
                                    parseInt(slot.time.split(':')[0]),
                                    parseInt(slot.time.split(':')[1])
                                  ),
                                  'hh:mm a'
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* End Date & Time */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{dict.calendarPage.formEndTime}</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Date Picker */}
                  <div className="relative z-10 w-full sm:w-auto">
                    <DatePickerWithPrevent
                      selected={endDate}
                      open={endPickerOpen}
                      onOpenChange={setEndPickerOpen}
                      onSelect={onEndDateChange}
                    />
                  </div>
                  
                  {/* Time Picker */}
                  <Select
                    value={format(endDate, 'HH:mm')}
                    onValueChange={onEndTimeChange}
                  >
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <SelectValue>
                          {format(endDate, 'HH:mm')}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="h-80">
                      <ScrollArea className="h-80">
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem
                            key={`end-${slot.time}`}
                            value={slot.time}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{slot.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date().setHours(
                                    parseInt(slot.time.split(':')[0]),
                                    parseInt(slot.time.split(':')[1])
                                  ),
                                  'hh:mm a'
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <div className='flex flex-1 flex-col gap-2'>
          <Label>{dict.calendarPage.formPriority}</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={dict.calendarPage.formPriorityPlaceholder} className='w-full' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='low'>Low</SelectItem>
              <SelectItem value='medium'>Medium</SelectItem>
              <SelectItem value='high'>High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-1 flex-col gap-2'>
          <Label>{dict.calendarPage.formCategory}</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={dict.calendarPage.formCategoryPlaceholder} className='w-full' />
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
        {mode === 'update' && (
          <Button variant='destructive' className='w-fit ml-auto' onClick={handleDelete} type="button">
            <Trash2 className='h-4 w-4' />
          </Button>
        )}
        <Button type='submit' variant='black' className='w-fit ml-auto'>
          {mode === 'update' ? dict.calendarPage.formUpdate : dict.calendarPage.formSubmit}
        </Button>
      </div>
    </form>
  )
}

// Add this component at the end of the file
type DatePickerWithPreventProps = {
  selected: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (date: Date | undefined) => void;
};

const DatePickerWithPrevent = ({ 
  selected, 
  open, 
  onOpenChange, 
  onSelect 
}: DatePickerWithPreventProps) => {
  // Handler that ensures the date is properly propagated
  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      // Create a new date instance to avoid reference issues
      const newDate = new Date(date);
      onSelect(newDate);
      // Close the calendar after selection
      onOpenChange(false);
    }
  };

  return (
    <div className=" w-full">
      <Button
        type="button"
        variant="outline" 
        className={cn(
          "w-full justify-start text-left font-normal py-5",
          "cursor-pointer hover:bg-muted/50 active:scale-[0.98] transition-all",
          "border border-input shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        )}
        onClick={() => onOpenChange(!open)}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{format(selected, 'MMM dd, yyyy')}</span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )} />
        </div>
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 mt-2 z-50">
          <div className="rounded-3xl border bg-card p-2 shadow-lg backdrop-blur-sm">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelectDate}
              initialFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};