'use client'

import { CardContent } from '@/components/ui/card'
import SearchableSelect from '@/components/blocks/(protected)/searchable-select'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardHeader } from '@/components/ui/card'
import CustomIcon from '@/components/ui/custom-icon'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { ScriptTone, ScriptVerbosity, ScriptTarget, ScriptType, ScriptDuration, ScriptPersona, ScriptStructure } from '@/types/enum'
import { IdeaData } from '@/types/types'
import { createClient } from '@/utils/supabase/client'
import { CircleHelp, Loader2, NotepadText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'


const ScriptPage = ({ params }: { params: { id: string } }) => {
	const { id } = params;
  const router = useRouter();
  const [ideaData, setIdeaData] = useState<IdeaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchIdeaData = async () => {
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

      setIdeaData(data)
      setIsLoading(false)
    }

    fetchIdeaData()
  }, [id])

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

		console.log(script)

		const { data, error } = await supabase
			.from('scripts')
			.insert(script)
			.select()
			.single()

		if (error) {
			console.error('Error creating script:', error)
			return
		}

		router.push(`/scripts/create/${data.id}/chat`)
	}

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-10 h-10 animate-spin' />
      </div>
    )
  }

	return (
		<section>
			<div className='flex flex-col'>
        <div className='flex items-center gap-3'>
          <CustomIcon icon={<NotepadText />} color='red' />
          <h1 className='text-3xl font-bold tracking-tight'>Create Script</h1>
        </div>
        <Separator className='my-4' />
      </div>
      
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
								{/* TODO: Add CTA checklist */}

								<SearchableSelect
									name="target_audience"
									label="Target Audience"
									placeholder="Select a target audience"
									searchPlaceholder="Search target audience..."
									options={Object.values(ScriptTarget)}
									required
								/>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<SearchableSelect
									name="script_type"
									label="Script Type"
									placeholder="Select a script type"
									searchPlaceholder="Search script type..."
									options={Object.values(ScriptType)}
									required
								/>

								<SearchableSelect
									name="duration"
									label="Duration"
									placeholder="Select a duration"
									searchPlaceholder="Search duration..."
									options={Object.values(ScriptDuration)}
									required
								/>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<SearchableSelect
									name="persona"
									label="Persona"
									placeholder="Select a persona"
									searchPlaceholder="Search persona..."
									options={Object.values(ScriptPersona)}
									required
								/>

								<SearchableSelect
									name="structure"
									label="Structure"
									placeholder="Select a structure"
									searchPlaceholder="Search structure..."
									options={Object.values(ScriptStructure)}
								/>
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
						>
							Create Idea
						</Button>
					</div>
				</form>
				<Card className='col-span-1'>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CircleHelp className="w-5 h-5" />
							Idea Details
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<h3 className="font-semibold">Suggestion</h3>
							<p className="text-sm text-muted-foreground">
								Insert here the suggestions for your script, you can add more suggestions when you will be in the chat.
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold">Content Style & Length</h3>
							<p className="text-sm text-muted-foreground">
								Choose a style that matches your content and audience. Educational videos work well with explainer formats, while entertainment may benefit from storytelling. Consider platform-specific lengths - shorter for social media, longer for in-depth topics.
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold">Video Type & Target Interest</h3>
							<p className="text-sm text-muted-foreground">
								Select formats that align with your content goals. Different types have different engagement patterns. Define your target audience's interests to optimize content discovery and reach the right viewers.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

		</section>
	)
}

export default ScriptPage