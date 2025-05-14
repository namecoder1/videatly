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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetHeader, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { ScriptTone, ScriptTarget, ScriptType, ScriptDuration, VideoType, VideoContentStyle } from '@/types/enum'

const ProductionPage = () => {
	const [data, setData] = useState<(IdeaData & { scripts: ScriptData[] })[]>([])
	const [selected, setSelected] = useState<IdeaData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [activeFilters, setActiveFilters] = useState<{
		scriptType: string | null,
		tone: string | null,
		target: string | null,
		videoType: string | null,
		contentStyle: string | null,
		duration: string | null,
		sortBy: 'newest' | 'oldest' | null
	}>({
		scriptType: null,
		tone: null,
		target: null,
		videoType: null,
		contentStyle: null,
		duration: null,
		sortBy: null
	})
	const [filteredData, setFilteredData] = useState<(IdeaData & { scripts: ScriptData[] })[]>([])

	const handleFilter = (type: keyof typeof activeFilters, value: string) => {
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
		if (newFilters.target) {
			filtered = filtered.filter(item => item.scripts[0]?.target_audience === newFilters.target)
		}
		if (newFilters.videoType) {
			filtered = filtered.filter(item => item.video_type === newFilters.videoType)
		}
		if (newFilters.contentStyle) {
			filtered = filtered.filter(item => item.video_style === newFilters.contentStyle)
		}
		if (newFilters.duration) {
			filtered = filtered.filter(item => item.scripts[0]?.duration === newFilters.duration)
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
			target: null,
			videoType: null,
			contentStyle: null,
			duration: null,
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
					<h1 className='text-3xl font-bold tracking-tight'>Production</h1>
				</div>
				<Separator className='my-4' />
			</div>

			<div className='flex items-center gap-4 mb-6'>
				<Button variant='black' onClick={() => setIsSheetOpen(true)}>
					Filter By
				</Button>
				<div className='flex flex-wrap gap-2'>
					{Object.entries(activeFilters).map(([key, value]) => {
						if (!value) return null
						return (
							<div key={key} className='text-sm bg-gray-100 px-2 py-1 rounded-md'>
								{value}
							</div>
						)
					})}
				</div>
				{Object.values(activeFilters).some(value => value !== null) && (
					<Button variant='outline' size='sm' onClick={handleResetFilters}>
						Reset Filters
					</Button>
				)}
			</div>

			{isSheetOpen && (
				<SheetFilters 
					handleFilter={handleFilter} 
					activeFilters={activeFilters} 
					setIsSheetOpen={setIsSheetOpen} 
					isSheetOpen={isSheetOpen} 
				/>
			)}
			

			<h2 className='text-2xl font-bold tracking-tight mb-4'>Completed Contents</h2>
			{filteredData.length > 0 ? (
				<>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{filteredData.map((item) => (
							<ProductionBox key={item.id} idea={item} script={item.scripts[0]} isActive={selected?.id === item.id} setSelectedIdea={setSelected} />
						))}
					</div>
				</>
			) : (
				<NoData title='No completed contents found' description='To create a production plan, you need to have an idea and a script first.' />
			)}

			{selected && (
				<Button variant='black' asChild className='fixed bottom-4 right-4 z-[5]'>
					<Link href={`/production/${selected.id}`}>
						Create Production
					</Link>
				</Button>
			)}
		</section>
	)
}

const SheetFilters = ({ 
	handleFilter, 
	activeFilters, 
	setIsSheetOpen, 
	isSheetOpen 
} : { 
	handleFilter: (type: keyof typeof activeFilters, value: string) => void,
	activeFilters: {
		scriptType: string | null,
		tone: string | null,
		target: string | null,
		videoType: string | null,
		contentStyle: string | null,
		duration: string | null,
		sortBy: 'newest' | 'oldest' | null
	},
	setIsSheetOpen: (value: boolean) => void,
	isSheetOpen: boolean
}) => {
	return (
		<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Filter By</SheetTitle>
				</SheetHeader>
				<div className='mt-6 space-y-6'>
					<div>
						<h3 className="text-sm font-medium mb-2">Sort By Date</h3>
						<Select 
							onValueChange={(value) => handleFilter('sortBy', value)} 
							value={activeFilters.sortBy || 'all'}
						>
							<SelectTrigger>
								<SelectValue placeholder="Sort by date" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">No sorting</SelectItem>
								<SelectItem value="newest">Newest first</SelectItem>
								<SelectItem value="oldest">Oldest first</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<h3 className="text-sm font-medium mb-2">Duration</h3>
						<Select 
							onValueChange={(value) => handleFilter('duration', value)} 
							value={activeFilters.duration || 'all'}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select duration" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All durations</SelectItem>
								{Object.values(ScriptDuration).map(duration => (
									<SelectItem key={duration} value={duration}>{duration}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<h3 className="text-sm font-medium mb-2">Script Type</h3>
						<Select 
							onValueChange={(value) => handleFilter('scriptType', value)} 
							value={activeFilters.scriptType || 'all'}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select script type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All types</SelectItem>
								{Object.values(ScriptType).map(type => (
									<SelectItem key={type} value={type}>{type}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<h3 className="text-sm font-medium mb-2">Script Tone</h3>
						<Select 
							onValueChange={(value) => handleFilter('tone', value)} 
							value={activeFilters.tone || 'all'}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select tone" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All tones</SelectItem>
								{Object.values(ScriptTone).map(tone => (
									<SelectItem key={tone} value={tone}>{tone}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<h3 className="text-sm font-medium mb-2">Target Audience</h3>
						<Select 
							onValueChange={(value) => handleFilter('target', value)} 
							value={activeFilters.target || 'all'}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select target audience" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All audiences</SelectItem>
								{Object.values(ScriptTarget).map(target => (
									<SelectItem key={target} value={target}>{target}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<h3 className="text-sm font-medium mb-2">Video Type</h3>
						<Select 
							onValueChange={(value) => handleFilter('videoType', value)} 
							value={activeFilters.videoType || 'all'}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select video type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All video types</SelectItem>
								{Object.values(VideoType).map(type => (
									<SelectItem key={type} value={type}>{type}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<h3 className="text-sm font-medium mb-2">Content Style</h3>
						<Select 
							onValueChange={(value) => handleFilter('contentStyle', value)} 
							value={activeFilters.contentStyle || 'all'}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select content style" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All styles</SelectItem>
								{Object.values(VideoContentStyle).map(style => (
									<SelectItem key={style} value={style}>{style}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}

export default ProductionPage