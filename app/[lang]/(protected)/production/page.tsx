'use client'

import { Separator } from '@/components/ui/separator'
import CustomIcon from '@/components/ui/custom-icon'
import { Clapperboard } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ProductionBox from '@/components/blocks/(protected)/production-box'
import { IdeaData, ScriptData } from '@/types/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Loader from '@/components/blocks/loader'
import NoData from '@/components/blocks/(protected)/no-data'
import FilterSheet, { FilterType } from '@/components/blocks/(protected)/filter-sheet'
import { useDictionary } from '@/app/context/dictionary-context'
import FilterBar from '@/components/blocks/(protected)/filter-bar'

const ProductionPage = () => {
	const dict = useDictionary()
	const [data, setData] = useState<(IdeaData & { scripts: ScriptData[] })[]>([])
	const [selected, setSelected] = useState<IdeaData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [activeFilters, setActiveFilters] = useState<FilterType>({
		scriptType: null,
		tone: null,
		scriptTarget: null,
		duration: null,
		persona: null,
		structure: null,
		verbosity: null,
		sortBy: null
	})
	const [filteredData, setFilteredData] = useState<(IdeaData & { scripts: ScriptData[] })[]>([])

	const handleFilter = (type: keyof FilterType, value: string) => {
		const newFilters = { ...activeFilters, [type]: value === 'all' ? null : value }
		setActiveFilters(newFilters)

		let filtered = [...data]

		// Apply all active filters
		if (newFilters.scriptType) {
			filtered = filtered.filter(item => item.scripts[0]?.script_type === newFilters.scriptType)
		}
		if (newFilters.tone) {
			filtered = filtered.filter(item => item.scripts[0]?.tone === newFilters.tone)
		}
		if (newFilters.scriptTarget) {
			filtered = filtered.filter(item => item.scripts[0]?.target_audience === newFilters.scriptTarget)
		}
		if (newFilters.duration) {
			filtered = filtered.filter(item => item.scripts[0]?.duration === newFilters.duration)
		}
		if (newFilters.persona) {
			filtered = filtered.filter(item => item.scripts[0]?.persona === newFilters.persona)
		}
		if (newFilters.structure) {
			filtered = filtered.filter(item => item.scripts[0]?.structure === newFilters.structure)
		}
		if (newFilters.verbosity) {
			filtered = filtered.filter(item => item.scripts[0]?.verbosity === newFilters.verbosity)
		}

		// Apply sorting
		if (newFilters.sortBy) {
			filtered.sort((a, b) => {
				const dateA = new Date(a.created_at).getTime()
				const dateB = new Date(b.created_at).getTime()
				return newFilters.sortBy === 'newest' ? dateB - dateA : dateA - dateB
			})
		}

		setFilteredData(filtered)
	}

	const handleResetFilters = () => {
		setActiveFilters({
			scriptType: null,
			tone: null,
			scriptTarget: null,
			duration: null,
			persona: null,
			structure: null,
			verbosity: null,
			sortBy: null
		})
		setFilteredData(data)
	}

	useEffect(() => {
		const fetchData = async () => {
			const supabase = createClient()
			setIsLoading(true)

			const { data: ideasWithScripts, error } = await supabase
				.from('ideas')
				.select(`
					*,
					scripts!inner(*)
				`)
				.order('created_at', { ascending: false })

			if (error) {
				console.error(error)
				return
			}

			if (ideasWithScripts) {
				setData(ideasWithScripts)
				setFilteredData(ideasWithScripts)
			}

			setIsLoading(false)
		}

		fetchData()
	}, [])

	if (isLoading) return <Loader position='full' />
	
	return (
		<section className="relative min-h-[calc(100vh-4rem)]">
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<Clapperboard />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>{dict.productionsPage?.title || "Production"}</h1>
				</div>
				<Separator className='my-4' />
			</div>

			<div>
				<div className='flex gap-y-2 flex-col xl:flex-row xl:items-center xl:justify-between mb-4'>
					<h2 className='text-2xl font-bold tracking-tight'>{dict.productionsPage?.productionsTitle || "Productions"}</h2>
					<FilterBar 
						activeFilters={activeFilters}
						onReset={handleResetFilters}
						onOpenSheet={() => setIsSheetOpen(true)}
						dict={dict}
					/>
				</div>

				{filteredData && filteredData.length > 0 ? (
					<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
						{filteredData.map((item) => (
							<ProductionBox key={item.id} idea={item} script={item.scripts[0]} isActive={selected?.id === item.id} setSelectedIdea={setSelected} />
						))}
					</div>
				) : (
					<NoData 
						title={dict.productionsPage?.noContentsFound || 'No completed contents found'} 
						description={dict.productionsPage?.noContentsFoundDescription || 'To create a production plan, you need to have an idea and a script first.'} 
					/>
				)}
			</div>

			<FilterSheet 
				handleFilter={handleFilter}
				activeFilters={activeFilters}
				setIsSheetOpen={setIsSheetOpen}
				isSheetOpen={isSheetOpen}
				title={dict.components.filterSheet?.filterProductions || "Filter Productions"}
				showProductionFilter={true}
				dict={{...dict, locale: dict.locale}}
			/>

			{selected && (
				<Button variant='black' asChild className='fixed bottom-4 right-4 z-[5]'>
					<Link href={`/production/${selected.id}`}>
						{dict.productionsPage?.createProduction || "Create Production"}
					</Link>
				</Button>
			)}
		</section>
	)
}

export default ProductionPage