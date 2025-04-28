'use client';

import CustomIcon from '@/components/ui/custom-icon'
import { Separator } from '@/components/ui/separator'
import { CirclePlus, CircleHelp } from 'lucide-react'
import { VideoContentStyle, VideoLength, VideoTargetInterest, VideoType } from '@/types/enum'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/blocks/(protected)/searchable-select';
import TagsInput from '@/components/blocks/(protected)/tags-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CreateIdeaPage = () => {
	const router = useRouter();

	async function createIdea(formData: FormData) {
		const supabase = createClient()
		const { data: { user } } = await supabase.auth.getUser()

		const idea = {
			description: formData.get('description'),
			video_style: formData.get('contentStyle'),
			video_length: formData.get('videoLength'),
			video_type: formData.get('videoType'),
			video_target: formData.get('targetInterest'),
			tags: formData.get('keywords'),
			creating_status: 'creating',
			user_id: user?.id
		}

		const { data, error } = await supabase
			.from('ideas')
			.insert(idea)
			.select()
			.single()

		if (error) {
			console.error('Error creating idea:', error)
			return
		}

		router.push(`/ideas/create/${data.id}/chat`)
	}

	return (
		<section>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<CirclePlus />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>Create Idea</h1>
				</div>
				<Separator className='my-4' />
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-fit w-full'>
				<form action={createIdea} className="space-y-8 col-span-1 lg:col-span-2">
					<div className="space-y-6">
						<div className="grid gap-4">
							
							<div className='flex flex-col gap-2'>
								<Label htmlFor="description">Suggestions</Label>
								<Textarea
									id="description"
									name="description"
									placeholder="Insert here the suggestions for the idea"
									className="w-full min-h-[150px] resize-y "
									required
								/>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<SearchableSelect
									name="contentStyle"
									label="Content Style"
									placeholder="Select a style"
									searchPlaceholder="Search content style..."
									options={Object.values(VideoContentStyle)}
									required
								/>
								
								<SearchableSelect
									name="videoLength"
									label="Video Length"
									placeholder="Select length"
									searchPlaceholder="Search video length..."
									options={Object.values(VideoLength)}
									required
								/>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<SearchableSelect
									name="videoType"
									label="Video Type"
									placeholder="Select video type"
									searchPlaceholder="Search video type..."
									options={Object.values(VideoType)}
									required
								/>
								
								<SearchableSelect
									name="targetInterest"
									label="Target Interest"
									placeholder="Select target interest"
									searchPlaceholder="Search target interest..."
									options={Object.values(VideoTargetInterest)}
									required
								/>
							</div>
							
							<div>
								<TagsInput
									name="keywords"
									label="Keywords"
									placeholder="Type and press space or comma to add keywords"
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
								Insert here the suggestions for the idea, you can add more suggestions when you will be in the chat.
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
						<div className="space-y-2">
							<h3 className="font-semibold">Keywords</h3>
							<p className="text-sm text-muted-foreground">
								Include 5-7 relevant keywords that your audience might search for. Mix specific and broader terms. Consider including variations of your main topic and related concepts to improve SEO and content discovery.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

export default CreateIdeaPage