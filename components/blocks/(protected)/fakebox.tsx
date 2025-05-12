import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'
import { FilterType } from './filter-sheet'

const Fakebox = ({ activeFilters, handleSelectChange, selecter }: { 
  activeFilters: FilterType, 
  handleSelectChange: (type: keyof FilterType, value: string) => void, 
  selecter: string 
}) => {
  return (
    <div className='relative'>
      <div className='flex items-center gap-2 w-full'>
        <Label htmlFor='sort-by-date' className={`py-2 w-full text-center px-4 bg-card border border-input text-md rounded-3xl ${activeFilters.sortBy === selecter ? 'bg-blue-500 text-white' : ''}`}>
          {selecter.charAt(0).toUpperCase() + selecter.slice(1)}
        </Label>
      </div>
      <Checkbox 
        id='sort-by-date' 
        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        onClick={() => handleSelectChange('sortBy', activeFilters.sortBy === selecter ? 'all' : selecter)}
        checked={activeFilters.sortBy === selecter}
      />
    </div>
  )
}

export default Fakebox