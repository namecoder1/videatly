'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ExternalLink, Lightbulb, ListVideo, Loader2, Pencil, Plus, Timer, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useMediaQuery } from '@/hooks/use-media-query'
import Markdown from 'react-markdown'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Sponsorship, Tool } from '@/types/types'
import { formatDate } from '@/utils/supabase/utils'


const parseTools = (toolsString: string): Tool[] => {
	try {
		const lines = toolsString.split('\n');
		return lines.map(line => {
			const [name, url] = line.split('(');
			if (!url) return { name: line.trim(), url: '' };
			return {
				name: name.trim(),
				url: url.replace(')', '').trim()
			};
		});
	} catch (e) {
		return [];
	}
};

const parseSponsorships = (sponsorshipString: string): Sponsorship[] => {
	try {
		// Rimuove i delimitatori markdown se presenti
		const cleanString = sponsorshipString.replace(/^```markdown\n/, '').replace(/\n```$/, '');
		
		// Divide per righe e filtra le righe vuote
		const lines = cleanString.split('\n').filter(line => line.trim());
		const opportunities: Sponsorship[] = [];
		
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			// Se la linea contiene un nome (con o senza URL)
			if (line && !line.startsWith('Netlify')) {
				const urlMatch = line.match(/\((.*?)\)/);
				const name = line.replace(/\(.*?\)/, '').replace(/^[#\-*]\s*/, '').trim();
				const url = urlMatch ? urlMatch[1] : undefined;
				
				// Cerca la descrizione nelle righe successive fino alla prossima opportunità
				let description = '';
				i++;
				while (i < lines.length && !lines[i].includes('(http')) {
					if (lines[i].trim()) {
						description += (description ? '\n' : '') + lines[i].trim();
					}
					i++;
				}
				i--; // Torna indietro di una riga per non saltare la prossima opportunità
				
				opportunities.push({ name, description, url });
			}
		}
		
		return opportunities;
	} catch (e) {
		console.error('Error parsing sponsorships:', e);
		return [];
	}
};

const IdeaPage = ({ params }: { params: { id: string } }) => {
	const { id } = params
	const { toast } = useToast()
	const [user, setUser] = useState<any>(null)
	const [subscription, setSubscription] = useState<any>(null)
	const [script, setScript] = useState<any>(null)
	const [todos, setTodos] = useState<any>([])
	const [modifyTools, setModifyTools] = useState(false)
	const [modifySponsorship, setModifySponsorship] = useState(false)
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		video_type: '',
		video_style: '',
		video_length: '',
		video_target: '',
		thumbnail_idea: '',
		meta_description: '',
		topics: '',
		hook: '',
		mood: '',
		cta: '',
		editing_tips: '',
		music_suggestions: '',
		sponsorship_opportunities: '',
		tools_recommendations: '',
	})
	const topics = formData.topics?.slice(1) || []
	const supabase = createClient()
	const isMobile = useMediaQuery('(max-width: 768px)')
	const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1424px)')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter') {
			if (e.shiftKey) {
				// Permetti il newline con shift+enter
				return;
			}
			e.preventDefault();
			updateIdea(e as any);
		}
	};

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
					setError('Idea not found')
					return
				}

				setUser(authResponse.data.user)
				setFormData(ideaResponse.data || {})
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
				setError('Failed to load idea')
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [id])

	const updateIdea = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		
		const { data, error} = await supabase
			.from('ideas')
			.update(formData)
			.eq('id', id)

		if (error) {
			console.error('Error updating idea:', error)
			toast({
				title: 'Error updating idea',
				description: error.message,
				variant: 'destructive',
			})
		} else {
			toast({
				title: 'Idea updated',
				description: 'Your idea has been updated successfully',
				variant: 'success'
			})
		}	
	}

	const isPro = subscription?.subscription === 'pro'
	const isUltra = subscription?.subscription === 'ultra'

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-4">
				<div className="animate-spin">
					<Loader2 className="w-8 h-8" />
				</div>
				<p className="text-sm text-muted-foreground">
					Loading data...
				</p>
		</div>
		)
	}

	if (error) {
		return <div className="p-4 text-red-500">{error}</div>
	}

	return (
		<section className='p-4 space-y-4 w-full max-w-full'>
			<div className='flex flex-col items-start justify-start w-full'>
				<h1 className='text-2xl font-bold text-left flex items-center gap-2'><Lightbulb size={20} /> Idea Details</h1>
				<h2 className='text-lg font-semibold mt-1 text-muted-foreground text-left'>{formData.title || 'Untitled'}</h2>
				<Separator className='my-2' />
				<div className='mt-0.5 flex flex-col-reverse lg:flex-row gap-4 w-full max-w-5xl'>
					<Tabs defaultValue="general" className="w-full ">
						<form onSubmit={updateIdea}>
						<TabsList className='w-full'>
								<TabsTrigger value="general" className='w-full'>General</TabsTrigger>
								<TabsTrigger value="details" className='w-full'>Details</TabsTrigger>
								<TabsTrigger value="content" className='w-full'>Content</TabsTrigger>
						</TabsList>
						<TabsContent value="general" >
							<h2 className='text-lg font-bold text-left'>General</h2>
							<div className='flex flex-col gap-4 mt-6'>
								<div className='flex flex-col gap-3'>
									<CustomField 
										label="Video Title"
										name="title"
										value={formData.title} 
										onChange={handleInputChange}
										onKeyDown={handleKeyDown}
										height='100px'
									/>
								</div>
								<div className='flex flex-col gap-3'>
									<Label className='text-md font-medium'>Idea Description</Label>
									<Textarea 
										name="description"
										value={formData.description} 
										onChange={handleInputChange}
										onKeyDown={handleKeyDown}
										className='h-[200px] dark:border-card border-input bg-white dark:bg-transparent max-w-2xl p-4 resize-none'
									/>
								</div>
								{isPro || isUltra ? (
									<div className='flex flex-col gap-3'>
										<Label className='text-md font-medium'>Topics</Label>
										<Card className='p-4 dark:border-card border-input bg-white dark:bg-transparent max-w-2xl'>
										<ul className="list-disc pl-4 space-y-2">
											{Array.isArray(formData.topics) ? 
												formData.topics.map((topic, index) => (
													<li key={index} className="text-muted-foreground">
														{topic}
													</li>
												))
												:
												<li className="text-muted-foreground">No topics available</li>
											}
										</ul>
									</Card>
								</div>
								) : (
									<div className='flex flex-col gap-4'>
										<div className='flex flex-col gap-3'>
											<Label className='text-md font-medium'>Topics</Label>
											<p className='text-muted-foreground text-sm'>Upgrade to Pro or Ultra to add topics</p>
										</div>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="details">
							<h2 className='text-lg font-bold text-left'>Details</h2>
							<div className='flex flex-col gap-4 mt-6'>
								<div className='flex flex-col gap-3'>
									<CustomField 
										label="Meta Description"
										name="meta_description"
										value={formData.meta_description} 
										onChange={handleInputChange}
										onKeyDown={handleKeyDown}
										height='120px'
									/>
								</div>
								<div className='flex flex-col gap-3'>
									<CustomField 
										label="Thumbnail Idea"
										name="thumbnail_idea"
										value={formData.thumbnail_idea} 
										onChange={handleInputChange}
										onKeyDown={handleKeyDown}
										height='120px'
									/>
								</div>
								{isPro || isUltra ? (
									<>
										<div className='flex flex-col gap-3'>
											<div className='flex items-center justify-between'>
												<Label className='text-md font-medium'>Tools Recommendations</Label>
												<Button 
													variant="ghost" 
													size="sm" 
													type="button"
													onClick={() => setModifyTools(!modifyTools)}
												>
													{modifyTools ? 'Done' : 'Modify'}
												</Button>
											</div>
											{modifyTools ? (
												<Textarea 
													id='tools_recommendations'
													name="tools_recommendations"
													value={formData.tools_recommendations} 
													onChange={handleInputChange}
													onKeyDown={handleKeyDown}
													className='h-[200px] dark:border-card border-input bg-white dark:bg-transparent max-w-2xl p-4 resize-none'
												/>
											) : (
												<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
													{parseTools(formData.tools_recommendations).map((tool, index) => (
														<Card key={index} className='py-2 px-3'>
															<div className='flex items-center justify-between'>
																<span className='font-medium'>{tool.name}</span>
																{tool.url && (
																	<Button variant='ghost' size='sm' asChild>
																		<Link href={tool.url} target='_blank' rel='noopener noreferrer'>
																			<ExternalLink size={16} />
																		</Link>
																	</Button>
																)}
															</div>
														</Card>
													))}
												</div>
											)}
										</div>
										<div className='flex flex-col gap-3'>
											<div className='flex items-center justify-between'>
												<Label className='text-md font-medium'>Sponsorship Opportunities</Label>
												<Button 
													variant="ghost" 
													size="sm" 
													type="button"
													onClick={() => setModifySponsorship(!modifySponsorship)}
												>
													{modifySponsorship ? 'Done' : 'Modify'}
												</Button>
											</div>
											{modifySponsorship ? (
												<Textarea 
													id='sponsorship_opportunities'
													name="sponsorship_opportunities"
													value={formData.sponsorship_opportunities} 
													onChange={handleInputChange}
													onKeyDown={handleKeyDown}
													className='h-[200px] dark:border-card border-input bg-white dark:bg-transparent max-w-2xl p-4 resize-none'
												/>
											) : (
												<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
													{parseSponsorships(formData.sponsorship_opportunities).map((sponsorship, index) => (
														<Card key={index} className='p-4'>
															<div className='flex items-center justify-between mb-2'>
																<h3 className='font-semibold text-lg'>{sponsorship.name}</h3>
																{sponsorship.url && (
																	<Button variant='ghost' size='sm' asChild>
																		<Link href={sponsorship.url} target='_blank' rel='noopener noreferrer'>
																			<ExternalLink size={16} />
																		</Link>
																	</Button>
																)}
															</div>
															<p className='text-muted-foreground text-sm'>{sponsorship.description}</p>
														</Card>
													))}
												</div>
											)}
										</div>
									</>
								) : (
									<div className='flex flex-col gap-4'>
										<div className='flex flex-col gap-3'>
											<Label className='text-md font-medium'>Sponsorship Opportunities</Label>
											<p className='text-muted-foreground text-sm'>Upgrade to Pro or Ultra to add sponsorship opportunities</p>
										</div>
										<div className='flex flex-col gap-3'>
											<Label className='text-md font-medium'>Tools Recommendations</Label>
											<p className='text-muted-foreground text-sm'>Upgrade to Pro or Ultra to add tools recommendations</p>
										</div>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="content">
							<h2 className='text-lg font-bold text-left'>Content</h2>
							<div className='flex flex-col gap-4 mt-6'>
								<Label className='text-md font-medium'>Script</Label>
								{script ? (
									<div className='mt-6 relative'>
											<div className='blur-sm'>
												<Markdown>{script.content}</Markdown>
											</div>
											<div className='absolute top-0 right-0 left-0 bottom-0 flex flex-col gap-2 items-center justify-center'>
												<Button variant='outline' asChild>
													<Link href={`/scripts/${script.id}`}>
														<Pencil size={16} /> Edit Script
													</Link>
												</Button>
											</div>
									</div>
								) : (
									<div className='flex flex-col items-center justify-center gap-4 mt-6'>
										<p className='text-sm text-muted-foreground'>No script yet</p>
										<Button variant='outline' className='w-fit' asChild>
											<Link href={`/scripts/new`}>
												<Plus size={16} /> Create Script
											</Link>
										</Button>
									</div>
								)}
							</div>
						</TabsContent>
					</form>
					</Tabs>

					<div className='hidden lg:block border-l border-zinc-300 dark:border-zinc-700' />
					<div className='flex flex-col gap-4'>
						<Card className="
							w-full 
							lg:min-w-[300px] lg:max-w-[300px]
							sticky top-4 h-fit
							p-4
						">
							<h2 className='text-lg font-bold text-left'>Details</h2>
							<Separator className='my-3' />
							<div className='flex flex-col gap-3'>
								<div className='flex items-center gap-2'>
									<span className='font-bold flex items-center gap-2'>
										<div className='p-1 rounded-md bg-primary/80 text-primary-foreground w-fit flex items-center justify-center'>
											<ListVideo size={14} />
										</div>
										Video Type:
									</span> 
									<span className='text-muted-foreground'>{formData.video_type}</span>
								</div>
								<div className='flex items-center gap-2'>
									<span className='font-bold flex items-center gap-2'>
										<div className='p-1 rounded-md bg-primary/80 text-primary-foreground w-fit flex items-center justify-center'>
											<Pencil size={14} />
										</div>
										Content Style:
									</span> 
									<span className='text-muted-foreground'>{formData.video_style}</span>
								</div>
								<div className='flex items-center gap-2'>
									<span className='font-bold flex items-center gap-2'>
										<div className='p-1 rounded-md bg-primary/80 text-primary-foreground w-fit flex items-center justify-center'>
											<Timer size={14} />
										</div>
										Video Length:
									</span> 
									<span className='text-muted-foreground'>{formData.video_length}</span>
								</div>
								<div className='flex items-center gap-2'>
									<span className='font-bold flex items-center gap-2'>
										<div className='p-1 rounded-md bg-primary/80 text-primary-foreground w-fit flex items-center justify-center'>
											<Users size={14} />
										</div>
										Target Interest:
									</span> 
									<span className='text-muted-foreground'>{formData.video_target} </span>
								</div>
							</div>
						</Card>
						<PubDatePopover>
							<Button>
								Set pub. date
							</Button>
						</PubDatePopover>
					</div>
				</div>
			</div>
		</section>
	)
}

const PubDatePopover = ({children}: {children: React.ReactNode}) => {
  const [date, setDate] = useState<Date>()

	return (
		<Popover>
			<PopoverTrigger>
				{children}
			</PopoverTrigger>
			<PopoverContent>
				{date ? formatDate(date as any, 'normal') : 'No pub. date set'}
				<Separator className='my-2' />
				<Calendar
					mode="single"
          selected={date}
					onSelect={(newDate) => setDate(newDate) }
          initialFocus
				/>
			</PopoverContent>
		</Popover>
	)
}


const CustomField = ({ label, value, height = '60px', onChange, onKeyDown, name }: {
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

export default IdeaPage