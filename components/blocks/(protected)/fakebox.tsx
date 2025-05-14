import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'
import { FilterType } from './filter-sheet'

interface FakeboxProps {
  activeFilters: FilterType
  handleSelectChange: (type: keyof FilterType, value: string) => void
  selecter: string
  dict?: any
}

const Fakebox = ({ activeFilters, handleSelectChange, selecter, dict }: FakeboxProps) => {
  // Get the translated label for the sort value
  const getLabel = () => {
    if (dict?.components?.filterSheet) {
      return dict.components.filterSheet[selecter] || selecter.charAt(0).toUpperCase() + selecter.slice(1)
    }
    return selecter.charAt(0).toUpperCase() + selecter.slice(1)
  }

  return (
    <div className='relative'>
      <div className='flex items-center gap-2 w-full'>
        <Label htmlFor='sort-by-date' className={`py-2 w-full text-center px-4 bg-card border border-input text-md rounded-3xl ${activeFilters.sortBy === selecter ? 'bg-blue-500 text-white' : ''}`}>
          {getLabel()}
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