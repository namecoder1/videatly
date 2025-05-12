import { useSidebar } from '@/components/ui/sidebar'
import { useEffect, useState, useMemo } from 'react'

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

type Breakpoint = keyof typeof BREAKPOINTS

interface ViewportState {
  width: number
  height: number
  breakpoint: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeScreen: boolean
}

export const useSidebarViewport: any = () => {
  const { state, isMobile: sidebarIsMobile } = useSidebar()
  const [viewportState, setViewportState] = useState<ViewportState>({
    width: 0,
    height: 0,
    breakpoint: 'sm',
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeScreen: false
  })
  const [sidebarWidth, setSidebarWidth] = useState<number>(0)

  useEffect(() => {
    const updateDimensions = () => {
      const sidebarElement = document.querySelector('[data-sidebar="sidebar"]')
      if (sidebarElement) {
        const sidebarRect = sidebarElement.getBoundingClientRect()
        setSidebarWidth(sidebarRect.width)
      }

      const width = window.innerWidth
      const height = window.innerHeight

      // Determine breakpoint
      const breakpoint = Object.entries(BREAKPOINTS)
        .reverse()
        .find(([_, value]) => width >= value)?.[0] as Breakpoint || 'sm'

      setViewportState({
        width,
        height,
        breakpoint,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg && width < BREAKPOINTS['2xl'],
        isLargeScreen: width >= BREAKPOINTS['2xl']
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [state])

  const availableWidth = useMemo(() => {
    if (sidebarIsMobile) {
      return viewportState.width
    }
    return state === 'expanded' ? viewportState.width - sidebarWidth : viewportState.width
  }, [viewportState.width, sidebarWidth, state, sidebarIsMobile])

  const gridClasses = useMemo(() => {
    const baseClasses = 'grid gap-4 transition-all duration-300'
    
    // Calculate columns based on available width
    const minCardWidth = 280 // Reduced minimum width for each card to allow two columns on mobile
    
    // Determine grid columns based on viewport width and available space
    let gridColumns = 'grid-cols-1'
    
    // Allow two columns on mobile if there's enough space
    if (availableWidth >= minCardWidth * 2) {
      gridColumns = 'grid-cols-2'
    }
    
    // Desktop and larger screens - maintain 2x2 grid
    if (availableWidth >= BREAKPOINTS.lg) {
      gridColumns = 'grid-cols-2'
    }

    return {
      container: `${baseClasses} ${gridColumns}`,
      card: 'transition-all duration-300 transform hover:scale-[1.02]',
      // Additional utility classes
      fullWidth: 'w-full',
      maxWidth: 'max-w-full',
      responsivePadding: 'p-4 md:p-6 lg:p-8'
    }
  }, [availableWidth])

  const cardClasses = useMemo(() => {
    return {
      base: 'transition-all duration-300 transform hover:scale-[1.02]',
      active: 'ring-2 ring-blue-500 shadow-lg',
      inactive: 'hover:shadow-md',
      background: 'bg-white dark:bg-gray-800'
    }
  }, [])

  return {
    ...viewportState,
    sidebarWidth,
    availableWidth,
    gridClasses,
    cardClasses,
    isSidebarExpanded: state === 'expanded',
    isMobile: sidebarIsMobile
  }
} 