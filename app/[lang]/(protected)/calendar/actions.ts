import { IdeaData, TodoProps } from "@/types/types"
import { fetchTodos } from "../production/[id]/actions"
import IdeaWithScripts from "./page"

export const handleTodayClick = (setSelectedDate: (date: Date) => void, today: Date) => {
  return () => {
    setSelectedDate(today)
  }
}

export const handleDateSelect = (
  setSelectedDate: (date: Date) => void,
  setEvents: (todos: TodoProps[]) => void
) => {
  return async (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    const formattedDate = date.toLocaleDateString('en-CA')
    const { data: todos, error: todosError } = await fetchTodos(formattedDate)
    if (todosError) {
      console.error('Failed to fetch todos:', todosError)
    } else {
      setEvents(todos || [])
    }
  }
}

export const handleTodoUpdate = (
  setEvents: (todos: TodoProps[]) => void,
  selectedDate: Date,
  fetchTodosForMonth: () => Promise<void>
) => {
  return async () => {
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-CA')
      const { data: todos, error: todosError } = await fetchTodos(formattedDate)
      if (todosError) {
        console.error('Failed to fetch todos:', todosError)
      } else {
        setEvents(todos || [])
      }
    }
    await fetchTodosForMonth()
  }
}

export const handleIdeaSelect = (
  setSelectedIdea: (idea: typeof IdeaWithScripts | null) => void,
  ideas: IdeaData[]
) => {
  return (idea: IdeaData) => {
    const selectedIdeaWithScripts = ideas.find(i => i.id === idea.id)
    if (selectedIdeaWithScripts) {
      setSelectedIdea(selectedIdeaWithScripts as unknown as typeof IdeaWithScripts)
    }
  }
}

export const isPublicationDate = (ideas: IdeaData[], date: Date) => {
  return ideas.some(idea => {
    if (!idea.pub_date) return false
    const pubDate = new Date(idea.pub_date)
    return pubDate.toLocaleDateString() === date.toLocaleDateString()
  })
}

export const hasTodos = (daysWithTodos: string[], date: Date) => {
  const dateString = date.toLocaleDateString('en-CA')
  return daysWithTodos.includes(dateString)
}