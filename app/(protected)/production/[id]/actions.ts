import { createClient } from "@/utils/supabase/client"
import { parse, format, isValid } from 'date-fns'

// Funzione helper per gestire sia 12h che 24h
const parseTimeFlexible = (timeStr: string | null | undefined) => {
  if (!timeStr) return null;
  let parsed = parse(timeStr, 'hh:mm a', new Date())
  if (!isValid(parsed)) {
    parsed = parse(timeStr, 'HH:mm', new Date())
  }
  if (!isValid(parsed)) {
    parsed = parse(timeStr, 'HH:mm:ss', new Date())
  }
  return isValid(parsed) ? parsed : null;
}

const fetchTodos = async (date: string) => {
  const supabase = createClient()

  const { data, error } = await supabase.from('todos').select('*').eq('date', date)

  if (error) {
    console.error(error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

const createTodo = async (formData: FormData) => {
  const supabase = createClient()

  const startTimeStr = formData.get('startTime') as string | null
  const endTimeStr = formData.get('endTime') as string | null

  const startTime = parseTimeFlexible(startTimeStr)
  const endTime = parseTimeFlexible(endTimeStr)

  const insertData: any = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    date: formData.get('date') as string,
    priority: formData.get('priority') as string,
    idea_id: formData.get('idea_id') as string,
    script_id: formData.get('script_id') as string,
    user_id: formData.get('user_id') as string,
    status: formData.get('status') as string,
    category: formData.get('category') as string,
  }
  if (startTime) insertData.start_time = format(startTime, 'HH:mm')
  if (endTime) insertData.end_time = format(endTime, 'HH:mm')

  const { data, error } = await supabase.from('todos').insert(insertData)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  return { data }
}

const updateTodo = async (formData: FormData) => {
  const supabase = createClient()

  const startTimeStr = formData.get('startTime') as string | null
  const endTimeStr = formData.get('endTime') as string | null

  const startTime = parseTimeFlexible(startTimeStr)
  const endTime = parseTimeFlexible(endTimeStr)

  const updateData: any = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    priority: formData.get('priority') as string,
    status: formData.get('status') as string,
    category: formData.get('category') as string,
  }
  if (formData.get('date')) updateData.date = formData.get('date') as string
  if (startTime) updateData.start_time = format(startTime, 'HH:mm')
  if (endTime) updateData.end_time = format(endTime, 'HH:mm')

  const { data, error } = await supabase
    .from('todos')
    .update(updateData)
    .eq('id', formData.get('id'))

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  return { data }
}

const deleteTodo = async (id: string) => {
  const supabase = createClient()

  const { data, error } = await supabase.from('todos').delete().eq('id', id)
  
  if (error) {
    console.error(error)
    return { error: error.message }
  }

  return { data }
}

export { fetchTodos, createTodo, updateTodo, deleteTodo }