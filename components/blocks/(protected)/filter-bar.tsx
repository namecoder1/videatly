'use client'

import { Button } from '@/components/ui/button'
import { FilterType } from './filter-sheet'

interface FilterBarProps {
  activeFilters: FilterType
  onReset: () => void
  onOpenSheet: () => void
}

const FilterBar = ({ activeFilters, onReset, onOpenSheet }: FilterBarProps) => {
  return (
    <div className='flex items-center gap-4'>
      <Button variant='black' onClick={onOpenSheet}>
        Filter By
      </Button>
      <div className='flex flex-wrap gap-2'>
        {Object.entries(activeFilters).map(([key, value]) => {
          if (!value) return null
          return (
            <div key={key} className='text-sm bg-gray-100 px-2 py-1 rounded-md'>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </div>
          )
        })}
      </div>
      {Object.values(activeFilters).some(value => value !== null) && (
        <Button variant='outline' size='sm' onClick={onReset}>
          Reset Filters
        </Button>
      )}
    </div>
  )
}

export default FilterBar 