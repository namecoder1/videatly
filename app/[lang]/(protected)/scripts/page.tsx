'use client'

import React, { useEffect, useState } from 'react'
import { FileText, PlusIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import CustomIcon from '@/components/ui/custom-icon'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ScriptBox from '@/components/blocks/(protected)/script-box'
import IdeaBox from '@/components/blocks/(protected)/idea-box'
import { ScriptData, IdeaData } from '@/types/types'
import Loader from '@/components/blocks/loader';
import NoData from '@/components/blocks/(protected)/no-data';
import FilterSheet, { FilterType } from '@/components/blocks/(protected)/filter-sheet'
import FilterBar from '@/components/blocks/(protected)/filter-bar'
import { useDictionary } from '@/app/context/dictionary-context';

const ScriptsPage = () => {
	const dict = useDictionary()
	const [scripts, setScripts] = useState<ScriptData[]>([])
	const [ideas, setIdeas] = useState<IdeaData[]>([])
	const [selectedIdea, setSelectedIdea] = useState<IdeaData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [isIdeaSheetOpen, setIsIdeaSheetOpen] = useState(false)
	const [activeScriptFilters, setActiveScriptFilters] = useState<FilterType>({
		scriptType: null,
		tone: null,
		length: null,
		duration: null,
		scriptTarget: null,
		sortBy: null
	})
	const [activeIdeaFilters, setActiveIdeaFilters] = useState<FilterType>({
		videoType: null,
		contentStyle: null,
		length: null,
		targetInterest: null,
		sortBy: null
	})
	const [filteredScripts, setFilteredScripts] = useState<ScriptData[]>([])
	const [filteredIdeas, setFilteredIdeas] = useState<IdeaData[]>([])

	const handleScriptFilter = (type: keyof FilterType, value: string) => {
		const newFilters = { ...activeScriptFilters, [type]: value === 'all' ? null : value }
		setActiveScriptFilters(newFilters)

		let filtered = [...scripts]

		if (newFilters.scriptType) {
			filtered = filtered.filter(item => item.script_type === newFilters.scriptType)
		}
		if (newFilters.tone) {
			filtered = filtered.filter(item => item.tone === newFilters.tone)
		}
		if (newFilters.duration) {
			filtered = filtered.filter(item => item.duration === newFilters.duration)
		}
		if (newFilters.persona) {
			filtered = filtered.filter(item => item.persona === newFilters.persona)
		}
		if (newFilters.structure) {
			filtered = filtered.filter(item => item.structure === newFilters.structure)
		}
		if (newFilters.scriptTarget) {
			filtered = filtered.filter(item => item.target_audience === newFilters.scriptTarget)
		}

		if (newFilters.sortBy) {
			filtered.sort((a, b) => {
				const dateA = new Date(a.created_at).getTime()
				const dateB = new Date(b.created_at).getTime()
				return newFilters.sortBy === 'newest' ? dateB - dateA : dateA - dateB
			})
		}

		setFilteredScripts(filtered)
	}

	const handleIdeaFilter = (type: keyof FilterType, value: string) => {
		const newFilters = { ...activeIdeaFilters, [type]: value === 'all' ? null : value }
		setActiveIdeaFilters(newFilters)

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

	const handleResetScriptFilters = () => {
		setActiveScriptFilters({
			scriptType: null,
			tone: null,
			length: null,
			duration: null,
			scriptTarget: null,
			sortBy: null
		})
		setFilteredScripts(scripts)
	}

	const handleResetIdeaFilters = () => {
		setActiveIdeaFilters({
			videoType: null,
			contentStyle: null,
			length: null,
			targetInterest: null,
			sortBy: null
		})
		setFilteredIdeas(ideas)
	}

	useEffect(() => {
		const fetchData = async () => {
			const supabase = await createClient()
			const { data: scriptsData, error: scriptsError } = await supabase.from('scripts').select('*').order('created_at', { ascending: false })
			const { data: ideasData, error: ideasError } = await supabase.from('ideas').select('*').order('created_at', { ascending: false })
			
			if (scriptsError) console.error(scriptsError)
			if (ideasError) console.error(ideasError)
			
			if (scriptsData) {
				setScripts(scriptsData)
				setFilteredScripts(scriptsData)
			}
			if (ideasData) {
				// Filter out ideas that already have a script
				const ideasWithoutScripts = ideasData.filter(idea => 
					!scriptsData?.some(script => script.idea_id === idea.id)
				)
				setIdeas(ideasWithoutScripts)
				setFilteredIdeas(ideasWithoutScripts)
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
					<CustomIcon icon={<FileText />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>{dict.scriptsPage?.title || "Scripts"}</h1>
				</div>
				<Separator className='my-4' />
			</div>

			<div>
				<div className='flex gap-y-2 flex-col md:flex-row md:items-center md:justify-between mb-4'>
					<h2 className='text-2xl font-bold tracking-tight'>{dict.scriptsPage?.yourScripts || "Your Scripts"}</h2>
					<FilterBar 
						activeFilters={activeScriptFilters}
						onReset={handleResetScriptFilters}
						onOpenSheet={() => setIsSheetOpen(true)}
						dict={dict}
					/>
				</div>

				{filteredScripts && filteredScripts.length > 0 ? (
					<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
						{filteredScripts.map((script) => (
							<ScriptBox key={script.id} props={script} />
						))}
					</div>
				) : (
					<NoData 
						title={dict.scriptsPage?.noScriptsFound || 'No scripts found'} 
						description={dict.scriptsPage?.noScriptsFoundDescription || 'Start creating scripts by clicking the button below'} 
					/>
				)}
			</div>

			<div className='mt-8'>
				<div className='flex gap-y-2 flex-col md:flex-row md:items-center md:justify-between mb-4'>
					<h2 className='text-2xl font-bold tracking-tight'>{dict.scriptsPage?.yourIdeas || "Your Ideas"}</h2>
					<FilterBar 
						activeFilters={activeIdeaFilters}
						onReset={handleResetIdeaFilters}
						onOpenSheet={() => setIsIdeaSheetOpen(true)}
						dict={dict}
					/>
				</div>

				{filteredIdeas && filteredIdeas.length > 0 ? (
					<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
						{filteredIdeas.map((idea) => (
							<IdeaBox 
								key={idea.id} 
								idea={idea} 
								isActive={selectedIdea?.id === idea.id}
								setSelectedIdea={setSelectedIdea}
							/>
						))}
					</div>
				) : (
					<NoData 
						title={dict.scriptsPage?.noIdeasFound || 'No ideas found'} 
						description={dict.scriptsPage?.noIdeasFoundDescription || 'Start creating ideas by clicking the button below'} 
					/>
				)}
			</div>

			<div className='fixed bottom-5 z-[5] right-5 flex flex-col gap-2 items-end'>
				{selectedIdea && (
					<Button className='bg-black hover:bg-black/80 w-fit group' asChild>
						<Link href={`/scripts/create/${selectedIdea.id}`}>
							<PlusIcon className='group-hover:scale-[1.4] transition-transform duration-300' />
							{dict.scriptsPage?.createScript || "Create Script"}
						</Link>
					</Button>
				)}
		
			</div>

			<FilterSheet 
				handleFilter={handleScriptFilter}
				activeFilters={activeScriptFilters}
				setIsSheetOpen={setIsSheetOpen}
				isSheetOpen={isSheetOpen}
				title={dict.components.filterSheet?.filterScripts || "Filter Scripts"}
				showScriptFilters={true}
				showIdeaFilters={false}
				dict={{...dict, locale: dict.locale || 'it'}}
			/>

			<FilterSheet 
				handleFilter={handleIdeaFilter}
				activeFilters={activeIdeaFilters}
				setIsSheetOpen={setIsIdeaSheetOpen}
				isSheetOpen={isIdeaSheetOpen}
				title={dict.components.filterSheet?.filterIdeas || "Filter Ideas"}
				showScriptFilters={false}
				showIdeaFilters={true}
				dict={{...dict, locale: dict.locale || 'it'}}
			/>
		</section>
	)
}

export default ScriptsPage