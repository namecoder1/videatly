import { createClient } from "@/utils/supabase/client"

const fetchTodos = async (date: string) => {
  const supabase = createClient()

  // Usa LIKE per cercare todos per la data (usando la parte data del timestamp)
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .like('start_date', `${date}%`)

  if (error) {
    console.error(error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

const createTodo = async (formData: FormData) => {
  const supabase = createClient()

  // I valori provenienti dai DateTimePicker (formato ISO)
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string

  const insertData: any = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    priority: formData.get('priority') as string,
    idea_id: formData.get('idea_id') as string,
    user_id: formData.get('user_id') as string,
    status: formData.get('status') as string,
    category: formData.get('category') as string,
  }

  // Aggiungi i campi di script_id solo se presenti
  if (formData.get('script_id')) {
    insertData.script_id = formData.get('script_id') as string
  }

  // Gestisci i timestamp
  if (startDate) insertData.start_date = startDate
  if (endDate) insertData.end_date = endDate

  const { data, error } = await supabase.from('todos').insert(insertData)

  if (error) {
    console.error(error)
    return { error: error.message }
  }

  return { data }
}

const updateTodo = async (formData: FormData) => {
  const supabase = createClient()

  // I valori provenienti dai DateTimePicker (formato ISO)
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string

  const updateData: any = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    priority: formData.get('priority') as string,
    status: formData.get('status') as string,
    category: formData.get('category') as string,
  }

  // Aggiungi i campi di script_id solo se presenti
  if (formData.get('script_id')) {
    updateData.script_id = formData.get('script_id') as string
  }

  // Gestisci i timestamp
  if (startDate) updateData.start_date = startDate
  if (endDate) updateData.end_date = endDate

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