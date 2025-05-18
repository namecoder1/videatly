'use client';
import { VideoContentStyle, VideoLength, VideoTargetInterest, VideoType } from '@/types/enum';

import CustomIcon from '@/components/ui/custom-icon'
import { Separator } from '@/components/ui/separator'
import { CirclePlus, CircleHelp, MessageCircleQuestion, Video, Tags } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import SearchableSelect from '@/components/blocks/(protected)/searchable-select';
import SimpleTranslatableSelect from '@/components/blocks/(protected)/simple-translatable-select';
import { useDictionary } from '@/app/context/dictionary-context';
import CustomLink from '@/components/blocks/custom-link';
import TagsInput from '@/components/blocks/(protected)/tags-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CreateIdeaPage = () => {
	const router = useRouter();
	const dict = useDictionary()


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
			console.error(dict.ideaCreatePage.creatingError, error)
			return
		}

		router.push(`/ideas/create/${data.id}/chat`)
	}

	return (
		<section>
			<div className='flex flex-col'>
				<div className='flex items-center gap-3'>
					<CustomIcon icon={<CirclePlus />} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>{dict.ideaCreatePage.title}</h1>
				</div>
				<Separator className='my-4' />
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-fit w-full'>
				<form action={createIdea} className="space-y-8 col-span-1 lg:col-span-2">
					<div className="space-y-6">
						<div className="grid gap-4">
							
							<div className='flex flex-col gap-2'>
								<Label htmlFor="description">{dict.ideaCreatePage.form.suggestions}</Label>
								<Textarea
									id="description"
									name="description"
									placeholder={dict.ideaCreatePage.form.suggestionsPlaceholder}
									className="w-full min-h-[150px] resize-y p-4"
									required
								/>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<SimpleTranslatableSelect
									name="contentStyle"
									label={dict.ideaCreatePage.form.contentStyle}
									placeholder={dict.ideaCreatePage.form.contentStylePlaceholder}
									searchPlaceholder={dict.ideaCreatePage.form.contentStyleSearchPlaceholder}
									options={Object.values(VideoContentStyle)}
									required
								/>
								
								<SimpleTranslatableSelect
									name="videoLength"
									label={dict.ideaCreatePage.form.videoLength}
									placeholder={dict.ideaCreatePage.form.videoLengthPlaceholder}
									searchPlaceholder={dict.ideaCreatePage.form.videoLengthSearchPlaceholder}
									options={Object.values(VideoLength)}
									required
								/>

								<SimpleTranslatableSelect
									name="targetInterest"
									label={dict.ideaCreatePage.form.targetInterest}
									placeholder={dict.ideaCreatePage.form.targetInterestPlaceholder}
									searchPlaceholder={dict.ideaCreatePage.form.targetInterestSearchPlaceholder}
									options={Object.values(VideoTargetInterest)}
									required
								/>

								<SimpleTranslatableSelect
									name="videoType"
									label={dict.ideaCreatePage.form.videoType}
									placeholder={dict.ideaCreatePage.form.videoTypePlaceholder}
									searchPlaceholder={dict.ideaCreatePage.form.videoTypeSearchPlaceholder}
									options={Object.values(VideoType)}
									required
								/>
							</div>
							
							<div>
								<TagsInput
									name="keywords"
									label={dict.ideaCreatePage.form.keywords}
									placeholder={dict.ideaCreatePage.form.keywordsPlaceholder}
									addTags={dict.ideaCreatePage.form.addTags}
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
							{dict.ideaCreatePage.form.cancel}
						</Button>
						<Button
							type="submit"
							className="min-w-[100px] bg-black text-white hover:bg-black/90"
						>
							{dict.ideaCreatePage.form.create}
						</Button>
					</div>
				</form>
				<Card className='col-span-1'>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CircleHelp className="w-5 h-5" />
							{dict.ideaCreatePage.form.info.title}
						</CardTitle>
						<CardDescription>
							{dict.ideaCreatePage.form.info.description}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<h3 className="font-semibold flex items-center gap-2">
								<span className="text-blue-600 p-1.5 rounded-xl bg-blue-100">
									<MessageCircleQuestion className="w-5 h-5" />
								</span>
								{dict.ideaCreatePage.form.info.fields[0].title}
							</h3>
							<p className="text-sm text-muted-foreground">
								{dict.ideaCreatePage.form.info.fields[0].description}
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold flex items-center gap-2">
								<span className="text-purple-600 p-1.5 rounded-xl bg-purple-100">
									<Video className="w-5 h-5" />
								</span>
								{dict.ideaCreatePage.form.info.fields[1].title}
							</h3>
							<p className="text-sm text-muted-foreground">
								{dict.ideaCreatePage.form.info.fields[1].description}
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold flex items-center gap-2">
								<span className="text-orange-600 p-1.5 rounded-xl bg-orange-100">
									<Video className="w-5 h-5" />
								</span>
								{dict.ideaCreatePage.form.info.fields[2].title}
							</h3>
							<p className="text-sm text-muted-foreground">
								{dict.ideaCreatePage.form.info.fields[2].description}
							</p>
						</div>
						<div className="space-y-2">
							<h3 className="font-semibold flex items-center gap-2">
								<span className="text-green-600 p-1.5 rounded-xl bg-green-100">
									<Tags className="w-5 h-5" />
								</span>
								{dict.ideaCreatePage.form.info.fields[3].title}
							</h3>
							<p className="text-sm text-muted-foreground">
								{dict.ideaCreatePage.form.info.fields[3].description}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}

export default CreateIdeaPage