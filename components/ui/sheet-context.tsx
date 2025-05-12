'use client'

import React, { createContext, useContext, useState } from 'react'

type SheetContextType = {
  isAnySheetOpen: boolean
  setIsAnySheetOpen: (isOpen: boolean) => void
}

export const SheetContext = createContext<SheetContextType | undefined>(undefined)

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [isAnySheetOpen, setIsAnySheetOpen] = useState(false)

  return (
    <SheetContext.Provider value={{ isAnySheetOpen, setIsAnySheetOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

export function useSheet() {
  const context = useContext(SheetContext)
  if (context === undefined) {
    throw new Error('useSheet must be used within a SheetProvider')
  }
  return context
} 