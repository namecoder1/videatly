// this is used to generate all tailwind classes for the calendar
// if you want to use your own colors, you can override the classes here

export const priorityOptions = [
  {
    value: 'high',
    label: 'High',
    class: {
      base: 'bg-red-500 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-500',
      light: 'bg-red-300 border-red-300 bg-red-300/10 text-red-300',
      dark: 'dark:bg-red-700 dark:border-red-700 bg-red-700/10 text-red-700',
    },
  },
  {
    value: 'medium',
    label: 'Medium',
    class: {
      base: 'bg-orange-500 border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500',
      light: 'bg-orange-300 border-orange-300 bg-orange-300/10 text-orange-300',
      dark: 'dark:bg-orange-700 dark:border-orange-700 bg-orange-700/10 text-orange-700',
    },
  },
  {
    value: 'low',
    label: 'Low',
    class: {
      base: 'bg-blue-500 border-blue-500 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500',
      light: 'bg-blue-300 border-blue-300 bg-blue-300/10 text-blue-300',
      dark: 'dark:bg-blue-700 dark:border-blue-700 bg-blue-700/10 text-blue-700',
    },
  },
]

// For backward compatibility
export const colorOptions = priorityOptions
