'use client'

import { Separator } from '@/components/ui/separator'
import CustomIcon from '@/components/ui/custom-icon'
import { Clapperboard } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ProductionBox from '@/components/blocks/(protected)/production-box'
import ProductionCreatedBox from '@/components/blocks/(protected)/production-created-box'
import { IdeaData, ProfileData, ScriptData, ProductionData } from '@/types/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Loader from '@/components/blocks/loader'
import NoData from '@/components/blocks/(protected)/no-data'
import FilterSheet, { FilterType } from '@/components/blocks/(protected)/filter-sheet'
import { useDictionary } from '@/app/context/dictionary-context'
import FilterBar from '@/components/blocks/(protected)/filter-bar'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

type ProductionCreatedData = ProductionData & {
	ideas: IdeaData,
	scripts: ScriptData
}

const ProductionPage = () => {
	const dict = useDictionary()
	const { toast } = useToast()
	const router = useRouter()
	const [subscription, setSubscription] = useState<any | null>(null)
	const [availableData, setAvailableData] = useState<(IdeaData & { scripts: ScriptData[] })[]>([])
	const [createdProductions, setCreatedProductions] = useState<ProductionCreatedData[]>([])
	const [selected, setSelected] = useState<{ idea: IdeaData, script: ScriptData } | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	
	// Filter states for created productions
	const [isCreatedSheetOpen, setIsCreatedSheetOpen] = useState(false)
	const [createdActiveFilters, setCreatedActiveFilters] = useState<FilterType>({
		scriptType: null,
		tone: null,
		scriptTarget: null,
		duration: null,
		persona: null,
		structure: null,
		verbosity: null,
		sortBy: null
	})
	const [filteredCreatedProductions, setFilteredCreatedProductions] = useState<ProductionCreatedData[]>([])

	// Filter states for available productions
	const [isAvailableSheetOpen, setIsAvailableSheetOpen] = useState(false)
	const [availableActiveFilters, setAvailableActiveFilters] = useState<FilterType>({
		scriptType: null,
		tone: null,
		scriptTarget: null,
		duration: null,
		persona: null,
		structure: null,
		verbosity: null,
		sortBy: null
	})
	const [filteredAvailableData, setFilteredAvailableData] = useState<(IdeaData & { scripts: ScriptData[] })[]>([])
	
	const [timezone, setTimezone] = useState('')

	const handleCreatedFilter = (type: keyof FilterType, value: string) => {
		const newFilters = { ...createdActiveFilters, [type]: value === 'all' ? null : value }
		setCreatedActiveFilters(newFilters)

		let filtered = [...createdProductions]

		// Apply all active filters for created productions
		if (newFilters.scriptType) {
			filtered = filtered.filter(item => item.scripts?.script_type === newFilters.scriptType)
		}
		if (newFilters.tone) {
			filtered = filtered.filter(item => item.scripts?.tone === newFilters.tone)
		}
		if (newFilters.scriptTarget) {
			filtered = filtered.filter(item => item.scripts?.target_audience === newFilters.scriptTarget)
		}
		if (newFilters.duration) {
			filtered = filtered.filter(item => item.scripts?.duration === newFilters.duration)
		}
		if (newFilters.persona) {
			filtered = filtered.filter(item => item.scripts?.persona === newFilters.persona)
		}
		if (newFilters.structure) {
			filtered = filtered.filter(item => item.scripts?.structure === newFilters.structure)
		}
		if (newFilters.verbosity) {
			filtered = filtered.filter(item => item.scripts?.verbosity === newFilters.verbosity)
		}

		// Apply sorting
		if (newFilters.sortBy) {
			filtered.sort((a, b) => {
				const dateA = new Date(a.created_at).getTime()
				const dateB = new Date(b.created_at).getTime()
				return newFilters.sortBy === 'newest' ? dateB - dateA : dateA - dateB
			})
		}

		setFilteredCreatedProductions(filtered)
	}

	const handleAvailableFilter = (type: keyof FilterType, value: string) => {
		const newFilters = { ...availableActiveFilters, [type]: value === 'all' ? null : value }
		setAvailableActiveFilters(newFilters)

		let filtered = [...availableData]

		// Apply all active filters for available productions
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

		setFilteredAvailableData(filtered)
	}

	const handleCreatedResetFilters = () => {
		setCreatedActiveFilters({
			scriptType: null,
			tone: null,
			scriptTarget: null,
			duration: null,
			persona: null,
			structure: null,
			verbosity: null,
			sortBy: null
		})
		setFilteredCreatedProductions(createdProductions)
	}

	const handleAvailableResetFilters = () => {
		setAvailableActiveFilters({
			scriptType: null,
			tone: null,
			scriptTarget: null,
			duration: null,
			persona: null,
			structure: null,
			verbosity: null,
			sortBy: null
		})
		setFilteredAvailableData(availableData)
	}

	useEffect(() => {
		const fetchData = async () => {
			const supabase = createClient()
			setIsLoading(true)

			const { data: user } = await supabase.auth.getUser()
			if (!user?.user?.id) {
				setIsLoading(false)
				return
			}

			try {
				// First, get all ideas with scripts and subscription
				const { data: ideasWithScripts, error: ideasError } = await supabase
					.from('ideas')
					.select(`
						*, 
						scripts(*),
						users!inner(subscription)
					`)
					.eq('user_id', user.user.id)
					.order('created_at', { ascending: false })

				if (ideasError) throw ideasError

				// Then, get all productions for this user
				const { data: productions, error: productionsError } = await supabase
					.from('production')
					.select('*')
					.eq('user_id', user.user.id)
					.order('created_at', { ascending: false })

				if (productionsError) throw productionsError

				if (!ideasWithScripts || ideasWithScripts.length === 0) {
					setIsLoading(false)
					return
				}

				// Set subscription data
				setSubscription(ideasWithScripts[0].users?.subscription)

				// Process the data
				const createdProductionsData: ProductionCreatedData[] = []
				const availableIdeasData: (IdeaData & { scripts: ScriptData[] })[] = []

				// Create a map of productions by idea_id for easy lookup
				const productionsByIdea = new Map()
				const usedPairs = new Set()

				if (productions) {
					productions.forEach((prod: any) => {
						if (!productionsByIdea.has(prod.idea_id)) {
							productionsByIdea.set(prod.idea_id, [])
						}
						productionsByIdea.get(prod.idea_id).push(prod)
						usedPairs.add(`${prod.idea_id}_${prod.script_id}`)
					})
				}

				ideasWithScripts.forEach(idea => {
					// Handle created productions
					const ideaProductions = productionsByIdea.get(idea.id) || []
					
					ideaProductions.forEach((prod: any) => {
						const script = idea.scripts.find((s: ScriptData) => s.id === prod.script_id)
						if (script) {
							createdProductionsData.push({
								...prod,
								ideas: idea,
								scripts: script
							})
						}
					})

					// Handle available ideas (filter out used scripts)
					const availableScripts = (idea.scripts || []).filter(
						(script: ScriptData) => !usedPairs.has(`${idea.id}_${script.id}`)
					)

					if (availableScripts.length > 0) {
						availableIdeasData.push({
							...idea,
							scripts: availableScripts
						})
					}
				})

				setCreatedProductions(createdProductionsData)
				setFilteredCreatedProductions(createdProductionsData)
				setAvailableData(availableIdeasData)
				setFilteredAvailableData(availableIdeasData)

			} catch (error) {
				console.error('Error fetching data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
		setTimezone(tz)

		fetchData()
	}, [])

	const today = new Date().toISOString().split('T')[0]

	const hasPubDate = filteredAvailableData.some(item => item.pub_date !== null)
	
	const handleCreateProduction = async () => {
		const supabase = createClient()
		setIsLoading(true)
		if (!selected) return;

		try {
			const { data: productionData, error: productionError } = await supabase
				.from('production')
				.insert({
					idea_id: selected.idea.id,
					script_id: selected.script.id,
					user_id: selected.idea.user_id,
					status: 'pending',
				})
				.select()

			if (productionError) throw productionError

			// Trigger todo generation in background
			fetch('/api/openai/todo-generator', {
				method: 'POST',
				body: JSON.stringify({
					scriptData: selected.script,
					ideaData: selected.idea,
					lang: dict.locale,
					timezone: timezone,
					today: today,
					subscription: subscription,
					productionId: productionData[0].id
				})
			}).catch(error => {
				console.error('Error generating todos:', error)
				toast({ 
					title: dict.productionsPage?.todosErrorTitle || 'Errore', 
					description: dict.productionsPage?.todosErrorDescription || 'Errore nella creazione dei task', 
					variant: 'destructive' 
				})
			})

			toast({ 
				title: dict.productionsPage?.productionCreatedTitle || 'Produzione creata!', 
				description: dict.productionsPage?.productionCreatedDescription || 'La produzione è stata creata con successo.' 
			})
			
			router.push(`/production/${productionData[0].id}`)
		} catch (error) {
			console.error(error)
			toast({ 
				title: dict.productionsPage?.productionErrorTitle || 'Errore', 
				description: dict.productionsPage?.productionErrorDescription || 'Errore nella creazione della produzione', 
				variant: 'destructive' 
			})
		} finally {
			setIsLoading(false)
		}
	};

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

			{/* Created Productions Section */}
			<div className='mb-8'>
				<div className='flex gap-y-2 flex-col xl:flex-row xl:items-center xl:justify-between mb-4'>
					<h2 className='text-2xl font-bold tracking-tight'>
						{dict.productionsPage?.createdProductionsTitle || "Created Productions"}
					</h2>
					<FilterBar 
						activeFilters={createdActiveFilters}
						onReset={handleCreatedResetFilters}
						onOpenSheet={() => setIsCreatedSheetOpen(true)}
						dict={dict}
					/>
				</div>

				{filteredCreatedProductions && filteredCreatedProductions.length > 0 ? (
					<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
						{filteredCreatedProductions.map((production) => (
							<ProductionCreatedBox key={production.id} production={production} />
						))}
					</div>
				) : (
					<NoData 
						title={dict.productionsPage?.noCreatedProductionsFound || 'No created productions found'} 
						description={dict.productionsPage?.noCreatedProductionsDescription || 'Your completed production plans will appear here.'} 
					/>
				)}
			</div>

			{/* Available Productions Section */}
			<div>
				<div className='flex gap-y-2 flex-col xl:flex-row xl:items-center xl:justify-between mb-4'>
					<h2 className='text-2xl font-bold tracking-tight'>
						{dict.productionsPage?.availableProductionsTitle || "Available for Production"}
					</h2>
					<FilterBar 
						activeFilters={availableActiveFilters}
						onReset={handleAvailableResetFilters}
						onOpenSheet={() => setIsAvailableSheetOpen(true)}
						dict={dict}
					/>
				</div>

				{filteredAvailableData && filteredAvailableData.length > 0 ? (
					<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
						{filteredAvailableData.map((item) => (
							<ProductionBox 
								key={item.id} 
								idea={item} 
								script={item.scripts[0]} 
								isActive={selected?.idea.id === item.id} 
								setSelectedIdea={() => setSelected({ idea: item, script: item.scripts[0] })} 
							/>
						))}
					</div>
				) : (
					<NoData 
						title={dict.productionsPage?.noAvailableFound || 'No content available for production'} 
						description={dict.productionsPage?.noAvailableDescription || 'To create a production plan, you need to have an idea and a script first.'} 
					/>
				)}
			</div>

			{/* Filter Sheets */}
			<FilterSheet 
				handleFilter={handleCreatedFilter}
				activeFilters={createdActiveFilters}
				setIsSheetOpen={setIsCreatedSheetOpen}
				isSheetOpen={isCreatedSheetOpen}
				title={dict.components.filterSheet?.filterCreatedProductions || "Filter Created Productions"}
				showProductionFilter={true}
				dict={{...dict, locale: dict.locale}}
			/>

			<FilterSheet 
				handleFilter={handleAvailableFilter}
				activeFilters={availableActiveFilters}
				setIsSheetOpen={setIsAvailableSheetOpen}
				isSheetOpen={isAvailableSheetOpen}
				title={dict.components.filterSheet?.filterAvailableProductions || "Filter Available Productions"}
				showProductionFilter={true}
				dict={{...dict, locale: dict.locale}}
			/>

			{/* Create Production Button */}
			{selected && (
				<Button variant='black' disabled={!hasPubDate || isLoading} onClick={handleCreateProduction} className='fixed bottom-4 right-4 z-[5]'>
					{!hasPubDate ? 'Set date first' : dict.productionsPage?.createProduction}
				</Button>
			)}
		</section>
	)
}

export default ProductionPage