'use client'

import SponsorshipManager from '@/components/blocks/(protected)/sponsorship-manager'
import ToolsManager from '@/components/blocks/(protected)/tools-manager'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Lightbulb, Pencil, Plus, Calendar1Icon, X, Paintbrush, Film, Clock4, Target } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { formatDate } from '@/lib/utils'
import Loader from '@/components/blocks/loader'
import { handleKeyDown } from '@/lib/utils'
import ErrorMessage from '@/components/blocks/(protected)/error-message'
import CustomIcon from '@/components/ui/custom-icon'
import Blocked from '@/components/blocks/(protected)/blocked'
import { Sponsorship, Tool } from '@/types/types'
import { Input } from '@/components/ui/input'
import { updateTools, updateSponsorships } from './actions'
import { useDictionary } from '@/app/context/dictionary-context'
import { getEnumTranslation } from '@/utils/enum-translations'



const IdeaPage = ({ params }: { params: { id: string } }) => {
	const { id } = params
	const dict = useDictionary()
	const locale = dict.locale || 'it';
	const { toast } = useToast()
	const [user, setUser] = useState<any>(null)
	const [subscription, setSubscription] = useState<any>(null)
	const [script, setScript] = useState<any>(null)
	const [todos, setTodos] = useState<any>([])
	const [formData, setFormData] = useState<{
		title: string;
		description: string;
		video_type: string;
		video_style: string;
		video_length: string;
		video_target: string;
		thumbnail_idea: string;
		meta_description: string;
		topics: string[];
		hook: string;
		mood: string;
		cta: string;
		editing_tips: string;
		music_suggestions: string;
		sponsorship_opportunities: Sponsorship[];
		tools_recommendations: Tool[];
		pub_date: string;
	}>({
		title: '',
		description: '',
		video_type: '',
		video_style: '',
		video_length: '',
		video_target: '',
		thumbnail_idea: '',
		meta_description: '',
		topics: [],
		hook: '',
		mood: '',
		cta: '',
		editing_tips: '',
		music_suggestions: '',
		sponsorship_opportunities: [],
		tools_recommendations: [],
		pub_date: '',
	})
	const supabase = createClient()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			try {
				// Esegue tutte le query in parallelo
				const [authResponse, ideaResponse, todosResponse, scriptResponse] = await Promise.all([
					supabase.auth.getUser(),
					supabase.from('ideas').select('*').eq('id', id).single(),
					supabase.from('todos').select('*').eq('idea_id', id),
					supabase.from('scripts').select('*').eq('idea_id', id).single()
				])

				if (ideaResponse.error) {
					setError(dict.ideaPage?.toast?.setErrorNotFound)
					return
				}

				if (scriptResponse.error) {
					toast({
						title: dict.ideaPage?.toast?.scriptNotFound?.title,
						description: dict.ideaPage?.toast?.scriptNotFound?.description,
						variant: 'destructive'
					})
				}

				setUser(authResponse.data.user)
				setFormData({
					...ideaResponse.data,
					topics: ideaResponse.data.topics || []
				})
				setTodos(todosResponse.data || [])
				setScript(scriptResponse.data || null)
				
				// Fetch subscription solo se abbiamo l'utente
				if (authResponse.data.user) {
					const { data: subscription, error: subscriptionError } = await supabase
						.from('users')
						.select('subscription')
						.eq('auth_user_id', authResponse.data.user.id)
						.single()

					if (subscriptionError) {
						console.error('Subscription error:', subscriptionError)
						return
					}

					setSubscription(subscription)
				}
			} catch (err) {
				setError(dict.ideaPage?.toast?.setError)
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [id, supabase, toast])

	const updateIdea = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) e.preventDefault()

		console.log('Updating idea with data:', formData)

		try {
			const { data, error } = await supabase
				.from('ideas')
				.update({
					title: formData.title,
					description: formData.description,
					video_type: formData.video_type,
					video_style: formData.video_style,
					video_length: formData.video_length,
					video_target: formData.video_target,
					thumbnail_idea: formData.thumbnail_idea,
					meta_description: formData.meta_description,
					topics: formData.topics,
					hook: formData.hook,
					mood: formData.mood,
					cta: formData.cta,
					editing_tips: formData.editing_tips,
					music_suggestions: formData.music_suggestions,
					sponsorship_opportunities: formData.sponsorship_opportunities,
					tools_recommendations: formData.tools_recommendations,
					pub_date: formData.pub_date
				})
				.eq('id', id)
				.select()

			if (error) {
				console.error('Error updating idea:', error)
				toast({
					title: dict.ideaPage?.toast?.updateIdeaError?.title,
					description: dict.ideaPage?.toast?.updateIdeaError?.description,
					variant: 'destructive',
				})
			} else {
				console.log('Successfully updated idea:', data)
				toast({
					title: dict.ideaPage?.toast?.updateIdeaSuccess?.title,
					description: dict.ideaPage?.toast?.updateIdeaSuccess?.description,
					variant: 'success'
				})
			}
		} catch (err) {
			console.error('Error updating idea:', err)
			toast({
				title: dict.ideaPage?.toast?.updateIdeaError?.title,
				description: dict.ideaPage?.toast?.updateIdeaError?.description,
				variant: 'destructive',
			})
		}
	}

	const updateTopics = async (topics: string[]) => {
		try {
			const { data, error } = await supabase
				.from('ideas')
				.update({ topics })
				.eq('id', id)
				.select()

			if (error) {
				console.error('Error updating topics:', error)
				toast({
					title: dict.ideaPage?.toast?.updateTopicsError?.title,
					description: dict.ideaPage?.toast?.updateTopicsError?.description,
					variant: 'destructive',
				})
			} else {
				console.log('Successfully updated topics:', data)
				toast({
					title: dict.ideaPage?.toast?.updateTopicsSuccess?.title,
					description: dict.ideaPage?.toast?.updateTopicsSuccess?.description,
					variant: 'success'
				})
			}
		} catch (err) {
			console.error('Error updating topics:', err)
			toast({
				title: dict.ideaPage?.toast?.updateTopicsError?.title,
				description: dict.ideaPage?.toast?.updateTopicsError?.description,
				variant: 'destructive',
			})
		}
	}

	const isPro = subscription?.subscription === 'pro'
	const isUltra = subscription?.subscription === 'ultra'

	if (loading) return <Loader position='full' />

	if (error) return <ErrorMessage error={dict.ideaPage?.errorMessage} />


	return (
		<section className='space-y-4 w-full max-w-full'>
			<div className='flex flex-col items-start justify-start w-full'>
				<div className='flex flex-col w-full'>
					<div className='flex items-center gap-3'>
						<CustomIcon icon={<Lightbulb />} color='red' />
						<h1 className='text-lg sm:text-2xl md:text-3xl font-bold tracking-tight mr-16'>{formData.title}</h1>
					</div>
					<Separator className='my-2 w-full' />
				</div>				
				<div className='mt-0.5 flex flex-col-reverse xl:flex-row gap-4 w-full'>
					<Tabs defaultValue="general" className="w-full">
						<form onSubmit={updateIdea}>
						<TabsList className='w-full mb-5'>
								<TabsTrigger value="general" className='w-full'>{dict.ideaPage?.tabs?.general}</TabsTrigger>
								<TabsTrigger value="details" className='w-full'>{dict.ideaPage?.tabs?.details}</TabsTrigger>
								<TabsTrigger value="content" className='w-full'>{dict.ideaPage?.tabs?.content}</TabsTrigger>
						</TabsList>
						<TabsContent value="general" >
							<h2 className='text-lg font-bold text-left'>{dict.ideaPage.general.title}</h2>
							<div className='flex flex-col gap-6 mt-6'>
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
									<div className='flex flex-col gap-3'>
										<CustomField 
											label={dict.ideaPage.general.fields.title}
											name="title"
											value={formData.title} 
											onChange={handleInputChange}
											onKeyDown={handleKeyDown}
											height='150px'
										/>
									</div>
									<div className='flex flex-col gap-3'>
										<Label className='text-md font-medium'>{dict.ideaPage.general.fields.description}</Label>
										<Textarea 
											name="description"
											value={formData.description} 
											onChange={handleInputChange}
											onKeyDown={handleKeyDown}
											className='h-[150px] dark:border-card border-input bg-white dark:bg-transparent w-full p-4 resize-none'
										/>
									</div>
								</div>
								<div className='flex flex-col gap-3'>
									<Label className='text-md font-medium'>{dict.ideaPage.general.fields.metaDescription}</Label>
									<Textarea 
										name="meta_description"
										value={formData.meta_description} 
										onChange={handleInputChange}
										onKeyDown={handleKeyDown}
										className='h-[100px] dark:border-card border-input bg-white dark:bg-transparent max-w-2xl p-4 resize-none'
									/>
								</div>
								{isPro || isUltra ? (
									<TopicsManager 
										topics={formData.topics} 
										onChange={(topics) => setFormData({ ...formData, topics })}
										onUpdate={updateTopics}
										dict={dict}
									/>
								) : (
									<div className='flex flex-col gap-3'>
										<Label className='text-md font-medium'>{dict.ideaPage.general.topics}</Label>
										<Blocked text='Upgrade to Pro or Ultra to add topics' />
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="details">
							<h2 className='text-lg font-bold text-left'>{dict.ideaPage.details.title}</h2>
							<div className='flex flex-col gap-6 mt-6'>
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
									<div className='flex flex-col gap-3'>
										<CustomField 
											label={dict.ideaPage.details.fields.thumbnailIdea}
											name="thumbnail_idea"
											value={formData.thumbnail_idea} 
											onChange={handleInputChange}
											onKeyDown={handleKeyDown}
											height='150px'
										/>
									</div>
									<div className='flex flex-col gap-3'>
										<CustomField 
											label={dict.ideaPage.details.fields.musicSuggestions}
											name="music_suggestions"
											value={formData.music_suggestions} 
											onChange={handleInputChange}
											onKeyDown={handleKeyDown}
											height='150px'
										/>
									</div>
								</div>
								{isPro || isUltra ? (
									<>
										<ToolsManager 
											tools={formData.tools_recommendations} 
											onChange={(tools) => updateTools(tools, setFormData, id, dict)}
											dict={dict}
										/>
										<SponsorshipManager 
											sponsorships={formData.sponsorship_opportunities}
											onChange={(sponsorships) => updateSponsorships(sponsorships, setFormData, id, dict)}
											dict={dict}
										/>
									</>
								) : (
									<>
										<div className='flex flex-col gap-3'>
											<Label className='text-md font-medium'>{dict.ideaPage.details.fields.toolsRecommendation}</Label>
											<Blocked text={dict.ideaPage.details.fields.toolRecommendationBlocked} />
										</div>
										<div className='flex flex-col gap-3'>
											<Label className='text-md font-medium'>{dict.ideaPage.details.fields.sponsorships}</Label>
											<Blocked text={dict.ideaPage.details.fields.sponsorshipRecommendationBlocked} />
										</div>
									</>
								)}
							</div>
						</TabsContent>

						<TabsContent value="content">
							<h2 className='text-lg font-bold text-left'>{dict.ideaPage.content.title}</h2>
							<div className='flex flex-col gap-6 mt-6'>
								<Label className='text-md font-medium'>{dict.ideaPage.content.fields.script}</Label>
								{script ? (
									<div className='relative'>
										<div className='blur-sm'>
											{script.content.slice(0, 8).map((section: any) => (
												<div key={section.id} className='flex flex-col gap-2 border border-zinc-300 mb-2 p-4 rounded-3xl bg-card'>
													<h3 className='font-medium text-lg'>{section.startTime} - {section.endTime}</h3>
													<p className='text-sm text-muted-foreground'>{section.points.join('\n')}</p>
												</div>
											))}
										</div>
										<div className='absolute top-0 right-0 left-0 bottom-0 flex flex-col gap-2 items-center justify-center'>
											<Button variant='black' asChild>
												<Link href={`/scripts/${script.id}`}>
													<Pencil size={16} className="mr-2" /> {dict.ideaPage.content.fields.editScript}
												</Link>
											</Button>
										</div>
									</div>
								) : (
									<div className='flex flex-col items-center justify-center gap-4 mt-6 p-8 border border-dashed rounded-lg'>
										<p className='text-sm text-muted-foreground'>{dict.ideaPage.content.fields.noScript}</p>
										<Button variant='outline' className='w-fit' asChild>
											<Link href={`/scripts/create/${id}`}>
												<Plus size={16} className="mr-2" /> {dict.ideaPage.content.fields.createScript}
											</Link>
										</Button>
									</div>
								)}
							</div>
						</TabsContent>
					</form>
					</Tabs>

					<div className='hidden lg:block border-l border-zinc-300 dark:border-zinc-700' />
					<div className='flex flex-col gap-4 xl:min-w-[300px] xl:max-w-[300px] top-4 h-fit'>
						<Card className="
							w-full 
							p-4
						">
							<h2 className='text-lg font-bold text-left'>{dict.ideaPage.details.title}</h2>
							<Separator className='my-3' />
							<div className='grid grid-cols-2 xl:flex xl:flex-col gap-3'>
								<div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
									<Paintbrush className='w-4 h-4 min-w-4 min-h-4 text-blue-500 mr-2' />
									<span className='text-sm font-medium'>{getEnumTranslation(formData.video_style, locale)}</span>
								</div>
								<div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
									<Film className='w-4 h-4 min-w-4 min-h-4 text-purple-500 mr-2' />
									<span className='text-sm font-medium'>{getEnumTranslation(formData.video_type, locale)}</span>
								</div>
								<div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
									<Clock4 className='w-4 h-4 min-w-4 min-h-4 text-amber-500 mr-2' />
									<span className='text-sm font-medium'>{getEnumTranslation(formData.video_length, locale)}</span>
								</div>
								<div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
									<Target className='w-4 h-4 min-w-4 min-h-4 text-red-500 mr-2' />
									<span className='text-sm font-medium'>{getEnumTranslation(formData.video_target, locale)}</span>
								</div>
							</div>
						</Card>
						<PubDatePopover
							formData={formData}
							setFormData={setFormData}
							supabase={supabase}
							id={id}
							toast={toast}
							dict={dict}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}


const PubDatePopover = ({ 
	formData, 
	setFormData, 
	supabase, 
	id, 
	toast,
	dict
}: { 
	formData: any, 
	setFormData: (data: any) => void, 
	supabase: any, 
	id: string, 
	toast: any,
	dict: any
}) => {
	const today = new Date()
	const [date, setDate] = useState<Date | undefined>(formData.pub_date ? new Date(formData.pub_date) : undefined)
	const [isOpen, setIsOpen] = useState(false)

	const handleDateSelect = async (newDate: Date | undefined) => {
		setDate(newDate)
		setIsOpen(false)
		
		// Update formData and database
		const updatedFormData = { ...formData, pub_date: newDate?.toISOString() }
		setFormData(updatedFormData)
		
		const { error } = await supabase
			.from('ideas')
			.update({ pub_date: newDate ? newDate.toISOString() : null })
			.eq('id', id)

		if (error) {
			toast({
				title: dict.ideaPage?.toast?.pubDateUpdateError?.title,
				description: dict.ideaPage?.toast?.pubDateUpdateError?.description,
				variant: 'destructive',
			})
		} else {
			toast({
				title: dict.ideaPage?.toast?.pubDateUpdateSuccess?.title,
				description: dict.ideaPage?.toast?.pubDateUpdateSuccess?.description,
				variant: 'success'
			})
		}
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button 
					variant="outline" 
					className="w-full flex items-center justify-between gap-2"
				>
					<div className="flex items-center gap-2">
						<Calendar1Icon size={16} />
						{date ? formatDate(date.toISOString(), 'normal') : 'Select a day'}
					</div>
					{date && (
						<Button 
							variant="ghost" 
							size="sm" 
							className="h-6 w-6 p-0"
							onClick={(e) => {
								e.stopPropagation()
								handleDateSelect(undefined)
							}}
						>
							<X size={14} />
						</Button>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={handleDateSelect}
					initialFocus
					defaultMonth={today}
					fromDate={today}
					weekStartsOn={1}
				/>
			</PopoverContent>
		</Popover>
	)
}


const CustomField = ({ label, value, height = '290px', onChange, onKeyDown, name }: {
	label: string, 
	value: string, 
	height?: string,
	name: string,
	onChange:(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, 
	onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void 
}) => {
	const heightValue = height?.replace('px', '') || '60'
	
	return (
		<div className='flex flex-col gap-3'>
			<Label htmlFor={name} className='text-md font-medium'>{label}</Label>
			<Textarea 
				name={name}
				value={value} 
				onKeyDown={onKeyDown}
				className={`dark:border-card border-input bg-white dark:bg-transparent max-w-2xl p-4 resize-none h-[${heightValue}px]`}
				onChange={onChange}
			/>
		</div>
	)
}


const TopicsManager = ({ 
	topics, 
	onChange,
	onUpdate,
	dict 
}: { 
	topics: string[], 
	onChange: (topics: string[]) => void,
	onUpdate: (topics: string[]) => Promise<void>,
	dict: any 
}) => {
	const [newTopic, setNewTopic] = useState('')

	const handleAddTopic = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && newTopic.trim()) {
			e.preventDefault()
			const updatedTopics = [...topics, newTopic.trim()]
			onChange(updatedTopics)
			setNewTopic('')
			await onUpdate(updatedTopics)
		}
	}

	const handleRemoveTopic = async (index: number) => {
		const newTopics = topics.filter((_, i) => i !== index)
		onChange(newTopics)
		await onUpdate(newTopics)
	}

	const handleDragStart = (e: React.DragEvent, index: number) => {
		e.dataTransfer.setData('text/plain', index.toString())
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
	}

	const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault()
		const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
		const newTopics = [...topics]
		const [removed] = newTopics.splice(dragIndex, 1)
		newTopics.splice(dropIndex, 0, removed)
		onChange(newTopics)
		await onUpdate(newTopics)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<Label className='text-md font-medium'>{dict.ideaPage.general.fields.topics}</Label>
				<div className='flex items-center gap-2'>
					<Input
						value={newTopic}
						onChange={(e) => setNewTopic(e.target.value)}
						onKeyDown={handleAddTopic}
						placeholder={dict.ideaPage.general.fields.topicsPlaceholder}
						className='xl:w-[300px]'
					/>
					<Button 
						variant="ghost" 
						size="icon"
						onClick={async () => {
							if (newTopic.trim()) {
								const updatedTopics = [...topics, newTopic.trim()]
								onChange(updatedTopics)
								setNewTopic('')
								await onUpdate(updatedTopics)
							}
						}}
						disabled={!newTopic.trim()}
					>
						<Plus size={16} />
					</Button>
				</div>
			</div>
			<div className='grid grid-cols-1 gap-2'>
				{Array.isArray(topics) && topics.length > 0 ? (
					topics.map((topic, index) => (
						<div 
							key={index}
							draggable
							onDragStart={(e) => handleDragStart(e, index)}
							onDragOver={handleDragOver}
							onDrop={(e) => handleDrop(e, index)}
							className='group relative flex items-center gap-2 p-3 rounded-lg border border-border bg-card transition-all hover:shadow-md cursor-move'
						>
							<div className='flex-1 flex items-center gap-2'>
								<span className='text-xs text-muted-foreground select-none'>#{index + 1}</span>
								<span className='text-sm truncate max-w-[200px] sm:max-w-full'>{topic}</span>
							</div>
							<div className='absolute right-1 top-0 bottom-0 flex items-center gap-1'>
								<Button
									variant="ghost"
									size="icon"
									className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100/50 backdrop-blur-sm'
									onClick={() => handleRemoveTopic(index)}
								>
									<X size={14} className='text-red-500' />
								</Button>
							</div>
						</div>
					))
				) : (
					<div className='col-span-full flex flex-col items-center justify-center gap-2 p-8 border border-dashed rounded-lg'>
						<p className="text-muted-foreground text-sm text-center">{dict.ideaPage.general.fields.noTopics}</p>
					</div>
				)}
			</div>
			{topics.length > 0 && (
				<p className='text-xs text-muted-foreground mt-2'>
					{dict.ideaPage.general.fields.tipTopics}
				</p>
			)}
		</div>
	)
}


export default IdeaPage