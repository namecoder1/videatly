'use client'

import SearchableSelect from '@/components/blocks/(protected)/searchable-select'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from '@/components/ui/card'
import CustomIcon from '@/components/ui/custom-icon'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { ScriptTone, ScriptVerbosity, ScriptTarget, ScriptType, ScriptDuration, ScriptPersona, ScriptStructure } from '@/types/enum'
import { IdeaData } from '@/types/types'
import { createClient } from '@/utils/supabase/client'
import { CircleHelp, Clock4, ExternalLink, Film, Link2, Loader2, NotepadText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import Loader from '@/components/blocks/loader'


const ScriptPage = ({ params }: { params: { id: string } }) => {
	const { id } = params;
  const router = useRouter();
  const [ideaData, setIdeaData] = useState<IdeaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error} = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id)
      .single()

      if (error) {
        console.log(error)
        router.push('/scripts')
      }

			const { data: scriptData, error: scriptError } = await supabase
			.from('scripts')
			.select('*')
			.eq('idea_id', id)
			.single()

			if (scriptError) {
				console.log(scriptError)
			}

			if (scriptData) {
				router.push(`/scripts`)
			}

      setIdeaData(data)
      setIsLoading(false)
    }

    fetchData()
  }, [id, router])

	async function createScript(formData: FormData) {
		const supabase = createClient()
		const { data: { user } } = await supabase.auth.getUser()

		const script = {
			id: id,
			idea_id: id,
			user_id: user?.id,
			tone: formData.get('tone'),
			verbosity: formData.get('verbosity'),
			target_audience: formData.get('target_audience'),
			script_type: formData.get('script_type'),
			duration: formData.get('duration'),
			call_to_action: formData.get('call_to_action'),
			persona: formData.get('persona'),
			structure: formData.get('structure')
		}

		if (!script.tone || !script.verbosity || !script.target_audience || !script.script_type || !script.duration || !script.persona || !script.structure) {
			toast({
				title: 'Error creating script',
				description: 'Please fill in all fields',
				variant: 'destructive'
			})
			return
		}

		const { data, error } = await supabase
			.from('scripts')
			.insert(script)
			.select()
			.single()

		if (error) {
			console.error('Error creating script:', error)
			toast({
				title: 'Error creating script',
				description: error.message,
				variant: 'destructive'
			})
			return
		}

		router.push(`/scripts/create/${data.id}/chat`)
	}



  if (isLoading) return <Loader position='full' />

	return (
		<section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<NotepadText />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>Create Script</h1>
        </div>
        <Separator className='my-4' />
      </div>
      
		<Card className='mb-4 mt-2'>
			<CardHeader className='pb-2'>	
				<div className='flex items-center gap-2 text-sm text-muted-foreground font-medium justify-between'>
					<p className='flex items-center gap-2'>
						<span className='p-1 rounded-lg bg-blue-100 border border-blue-300'>
							<Link2 className='w-4 h-4 text-blue-500' /> 
						</span>
						<span>Related Idea</span>
					</p>
					<Button size='sm' variant='outline'>
						<Link href={`/ideas/${ideaData?.id}`} target='_blank' className='flex items-center gap-2'>
							<ExternalLink className='w-4 h-4' />
							View Idea
						</Link>
					</Button>
				</div>
				<CardTitle className='text-lg font-semibold mt-1'>{ideaData?.title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className='text-sm text-muted-foreground line-clamp-2'>{ideaData?.description}</p>
				<span className='flex gap-2 mt-3 text-xs'>
					{ideaData?.video_type && (
						<span className='flex items-center gap-2 text-muted-foreground'>
							<Film className='w-3 h-3 text-purple-500' />
							{ideaData.video_type}
						</span>
					)}
					{ideaData?.video_length && (
						<span className='flex items-center gap-2 text-muted-foreground'>
							<Clock4 className='w-3 h-3 text-amber-500' />
							{ideaData.video_length}
						</span>
					)}
				</span>
			</CardContent>
		</Card>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-fit w-full'>
				<form action={createScript} className="space-y-8 col-span-1 lg:col-span-2">
					<div className="space-y-6">
						<div className="grid gap-4">
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<SearchableSelect
									name="tone"
									label="Tone"
									placeholder="Select a tone"
									searchPlaceholder="Search tone..."
									options={Object.values(ScriptTone)}
									required
								/>

								<SearchableSelect
									name="verbosity"
									label="Verbosity"
									placeholder="Select a verbosity"
									searchPlaceholder="Search verbosity..."
									options={Object.values(ScriptVerbosity)}
									required
								/>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<SearchableSelect
									name="target_audience"
									label="Target Audience"
									placeholder="Select a target audience"
									searchPlaceholder="Search target audience..."
									options={Object.values(ScriptTarget)}
									required
								/>
								<SearchableSelect
									name="script_type"
									label="Script Type"
									placeholder="Select a script type"
									searchPlaceholder="Search script type..."
									options={Object.values(ScriptType)}
									required
								/>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<SearchableSelect
									name="duration"
									label="Duration"
									placeholder="Select a duration"
									searchPlaceholder="Search duration..."
									options={Object.values(ScriptDuration)}
									required
								/>
								<SearchableSelect
									name="persona"
									label="Persona"
									placeholder="Select a persona"
									searchPlaceholder="Search persona..."
									options={Object.values(ScriptPersona)}
									required
								/>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
								<SearchableSelect
									name="structure"
									label="Structure"
									placeholder="Select a structure"
									searchPlaceholder="Search structure..."
									options={Object.values(ScriptStructure)}
								/>

								<div className='flex flex-col gap-2'>
									<Label>Call to Action</Label>
									<div className='flex items-center gap-2'>
										<Checkbox
											name='call_to_action'
										/>
										<p className='text-sm'>Add a call to action</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					
					<Separator className="my-6" />
					
					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							className="min-w-[100px]"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="min-w-[100px] bg-black text-white hover:bg-black/90"
							disabled={isLoading}
						>
							{isLoading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Create Script'}
						</Button>
					</div>
				</form>
				<Card className='col-span-1'>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CircleHelp className="w-5 h-5" />
							Script Details
						</CardTitle>
						<CardDescription>
							Here you can find the details about the script you want to create.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<h3 className="font-semibold flex items-center gap-2">
								<span className="text-blue-600 p-1.5 rounded-xl bg-blue-100">
									<CircleHelp className="w-5 h-5" />
								</span>
								Tone & Verbosity
							</h3>
							<p className="text-sm text-muted-foreground">
								Insert here the tone and verbosity for your script. The tone is the personality of the person who is speaking, while the verbosity is the level of detail in the script.
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold flex items-center gap-2">
								<span className="text-orange-600 p-1.5 rounded-xl bg-orange-100">
									<CircleHelp className="w-5 h-5" />
								</span>
								Duration & Persona
							</h3>
							<p className="text-sm text-muted-foreground">
								Choose a duration that matches your content and audience. Educational videos work well with explainer formats, while entertainment may benefit from storytelling. Consider platform-specific lengths - shorter for social media, longer for in-depth topics.
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold flex items-center gap-2">
								<span className="text-purple-600 p-1.5 rounded-xl bg-purple-100">
									<CircleHelp className="w-5 h-5" />
								</span>
								Script Type & Target Audience
							</h3>
							<p className="text-sm text-muted-foreground">
								Select a script type that aligns with your content goals. Different types have different engagement patterns. Define your target audience&apos;s interests to optimize content discovery and reach the right viewers.
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold flex items-center gap-2">
								<span className="text-green-600 p-1.5 rounded-xl bg-green-100">
									<CircleHelp className="w-5 h-5" />
								</span>
								Structure & Call to Action
							</h3>
							<p className="text-sm text-muted-foreground">
								Select a structure that aligns with your content goals. Different structures have different engagement patterns. Define your target audience&apos;s interests to optimize content discovery and reach the right viewers.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

		</section>
	)
}

export default ScriptPage