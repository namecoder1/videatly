'use client'

import { Button } from '@/components/ui/button'
import { FilterType } from './filter-sheet'
import { getEnumTranslation } from '@/utils/enum-translations'

interface FilterBarProps {
  activeFilters: FilterType
  onReset: () => void
  onOpenSheet: () => void
  dict: any
}

const FilterBar = ({ activeFilters, onReset, onOpenSheet, dict }: FilterBarProps) => {
  return (
    <div className='flex items-center gap-4'>
      <Button variant='black' onClick={onOpenSheet}>
        {dict.components.filterBar.filterBy}
      </Button>
      <div className='flex flex-wrap gap-2'>
        {Object.entries(activeFilters).map(([key, value]) => {
          if (!value) return null;
          
          // Special handling for sortBy which isn't an enum
          if (key === 'sortBy') {
            // Translate the sort values
            const sortLabel = value === 'newest' 
              ? (dict.components.filterBar?.newest || 'Newest') 
              : (dict.components.filterBar?.oldest || 'Oldest');
            return (
              <div key={key} className='text-sm bg-gray-100 px-2 py-1 rounded-md'>
                {sortLabel}
              </div>
            );
          }
          
          return (
            <div key={key} className='text-sm bg-gray-100 px-2 py-1 rounded-md'>
              {getEnumTranslation(value as string, dict.locale) || (value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
            </div>
          );
        })}
      </div>
      {Object.values(activeFilters).some(value => value !== null) && (
        <Button variant='outline' size='sm' onClick={onReset}>
          {dict.components.filterBar.resetFilter}
        </Button>
      )}
    </div>
  )
}

export default FilterBar 