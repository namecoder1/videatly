'use client';

import React, { useEffect, useState } from 'react'
import { Lightbulb, PlusIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import CustomIcon from '@/components/ui/custom-icon'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import IdeaBox from '@/components/blocks/(protected)/idea-box'
import { IdeaData } from '@/types/types'
import Loader from '@/components/blocks/loader';
import NoData from '@/components/blocks/(protected)/no-data';
import FilterSheet, { FilterType } from '@/components/blocks/(protected)/filter-sheet'
import FilterBar from '@/components/blocks/(protected)/filter-bar'
import { useDictionary } from '@/app/context/dictionary-context';

const IdeasPage = () => {
  const [ideas, setIdeas] = useState<IdeaData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterType>({
    videoType: null,
    contentStyle: null,
    length: null,
    sortBy: null
  })
  const [filteredIdeas, setFilteredIdeas] = useState<IdeaData[]>([])
  const dict = useDictionary()

  const handleFilter = (type: keyof FilterType, value: string) => {
    const newFilters = { ...activeFilters, [type]: value === 'all' ? null : value }
    setActiveFilters(newFilters)

    let filtered = [...ideas]

    if (newFilters.videoType) {
      filtered = filtered.filter(item => item.video_type === newFilters.videoType)
    }
    if (newFilters.contentStyle) {
      filtered = filtered.filter(item => item.video_style === newFilters.contentStyle)
    }
    if (newFilters.length) {
      filtered = filtered.filter(item => item.video_length === newFilters.length)
    }
    if (newFilters.targetInterest) {
      filtered = filtered.filter(item => item.video_target === newFilters.targetInterest)
    }

    if (newFilters.sortBy) {
      filtered.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return newFilters.sortBy === 'newest' ? dateB - dateA : dateA - dateB
      })
    }

    setFilteredIdeas(filtered)
  }

  const handleResetFilters = () => {
    setActiveFilters({
      videoType: null,
      contentStyle: null,
      length: null,
      sortBy: null
    })
    setFilteredIdeas(ideas)
  }

  useEffect(() => {
    const fetchIdeas = async () => {
      const supabase = await createClient()
      const { data, error } = await supabase.from('ideas').select('*').order('created_at', { ascending: false })
      if (error) console.error(error)
      if (data) {
        setIdeas(data)
        setFilteredIdeas(data)
      }
      setIsLoading(false)
    }

    fetchIdeas()
  }, [])

  if (isLoading) return <Loader position='full' />

	return (
		<section className="relative min-h-[calc(100vh-4rem)]">
      <div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<Lightbulb />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>{dict.ideasPage.title}</h1>
        </div>
        <Separator className='my-4' />
      </div>

      <div>
        <div className='flex gap-y-2 flex-col md:flex-row md:items-center md:justify-between mb-4'>
          <h2 className='text-2xl font-bold tracking-tight'>{dict.ideasPage.yourIdeas}</h2>
          <FilterBar 
            activeFilters={activeFilters}
            onReset={handleResetFilters}
            onOpenSheet={() => setIsSheetOpen(true)}
            dict={dict}
          />
        </div>

        {filteredIdeas && filteredIdeas.length > 0 ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
            {filteredIdeas.map((idea) => (
              <IdeaBox key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <NoData title={dict.ideasPage.noIdeasFound} description={dict.ideasPage.noIdeasFoundDescription} />
        )}  
      </div>

      <FilterSheet 
        handleFilter={handleFilter}
        activeFilters={activeFilters}
        setIsSheetOpen={setIsSheetOpen}
        isSheetOpen={isSheetOpen}
        title={dict.components.filterSheet?.filterIdeas || "Filter Ideas"}
        showIdeaFilters={true}
        dict={{...dict, locale: dict.locale || 'en'}}
      />

      <div className='fixed bottom-5 right-5 flex flex-col gap-2 items-end z-[5]'>
        <Button className='bg-black hover:bg-black/80 w-fit group' asChild>
          <Link href='/ideas/create'>
            <PlusIcon className='group-hover:scale-[1.4] transition-transform duration-300' />
            {dict.ideasPage.newIdea}
          </Link>
        </Button>
      </div>
    </section>
	)
}

export default IdeasPage