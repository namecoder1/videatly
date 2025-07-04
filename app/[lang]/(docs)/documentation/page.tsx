import { BookIcon, Lightbulb, NotepadText, Clapperboard } from "lucide-react"
import Link from "next/link"
import DocLayout from "@/components/blocks/(public)/doc-layout"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDocumentationContent } from "@/documentation-content"

interface DocumentationPageProps {
  params: {
    lang: string
  }
}

const DocumentationPage = async ({ params }: DocumentationPageProps) => {
	const content = await getDocumentationContent(params.lang);

	const sections = [
		{ id: 'introduction', title: content.introduction.title },
		{ id: 'core-features', title: content.introduction.core_features.title },
		{ id: 'platform-guides', title: content.introduction.platform_guides.title },
		{ id: 'tokens-&-plans', title: content.introduction.tokens_plans.title },
	]
	
	return (
		<DocLayout 
			icon={<BookIcon />} 
			title={content.introduction.title} 
			breadcrumbs={content.introduction.breadcrumbs} 
			sections={sections}
		>
			<div className='flex-1'>
				<div>
					<h2 className="text-3xl font-bold mb-3" id="introduction">{content.introduction.title}</h2>
					<p className="text-neutral-500 tracking-wide leading-relaxed">
					{content.introduction.introduction.content}
					</p>
				</div>
				<div className="mt-14" >
					<h3 className="text-2xl font-bold mb-3" id="core-features">{content.introduction.core_features.title}</h3>
					<p className="text-neutral-500 tracking-wide leading-relaxed">
						{content.introduction.core_features.content}
					</p>
					<p className="text-neutral-500 tracking-wide leading-relaxed mt-10 mb-3">
						{content.introduction.core_features.features.title}
					</p>
					<div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-4">
						<Card className="w-fit">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 mb-1">
									<div className="flex items-center gap-2 bg-yellow-100 border border-yellow-200 rounded-xl p-2 w-fit">
										<Lightbulb className="w-4 h-4 text-yellow-500" />
									</div>
									{content.introduction.core_features.features.ideas.title}
								</CardTitle>
								<CardDescription className="text-neutral-500 tracking-wide leading-relaxed max-w-sm">
									<p className="mb-2">
										{content.introduction.core_features.features.ideas.description}
									</p>
									<p className="text-sm text-neutral-400">
										{content.introduction.core_features.features.ideas.hint}
									</p>
								</CardDescription>
							</CardHeader>
						</Card>
						<Card className="w-fit">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 mb-1">
									<div className="flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-xl p-2 w-fit">
										<NotepadText className="w-4 h-4 text-blue-500" />
									</div>
									{content.introduction.core_features.features.scripts.title}
								</CardTitle>
								<CardDescription className="text-neutral-500 tracking-wide leading-relaxed max-w-sm">
									<p className="mb-2">
										{content.introduction.core_features.features.scripts.description}
									</p>
									<p className="text-sm text-neutral-400">
										{content.introduction.core_features.features.scripts.hint}
									</p>
								</CardDescription>
							</CardHeader>
						</Card>
						<Card className="w-fit">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 mb-1">
									<div className="flex items-center gap-2 bg-red-100 border border-red-200 rounded-xl p-2 w-fit">
										<Clapperboard className="w-4 h-4 text-red-500" />
									</div>
									{content.introduction.core_features.features.production.title}
								</CardTitle>
								<CardDescription className="text-neutral-500 tracking-wide leading-relaxed max-w-sm">
									<p className="mb-2">
										{content.introduction.core_features.features.production.description}
									</p>
									<p className="text-sm text-neutral-400">
										{content.introduction.core_features.features.production.hint}
									</p>									
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
				<div className="mt-14">
					<h3 className="text-2xl font-bold mb-3" id="platform-guides">{content.introduction.platform_guides.title}</h3>
					<p className="text-neutral-500 tracking-wide leading-relaxed">
						{content.introduction.platform_guides.content}
					</p>
					<p className="text-neutral-500 tracking-wide leading-relaxed mt-10 mb-3">
						{content.introduction.platform_guides.guidesPhrase}
					</p>
					<ul className="flex flex-col gap-2  list-inside">
						{content.introduction.platform_guides.guides.map((guide, index) => (
							<li key={index} className="flex flex-row items-center gap-2"> -
								<Link href={guide.link} className="flex flex-row items-center gap-2">
									{index === 0 && <Lightbulb className="w-4 h-4 text-blue-500" />}
									{index === 1 && <NotepadText className="w-4 h-4 text-yellow-500" />}
									{index === 2 && <Clapperboard className="w-4 h-4 text-red-500" />}
									{guide.title}: <span className="text-neutral-500 text-sm">{guide.description}</span>
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div className="mt-14">
					<h3 className="text-2xl font-bold mb-3" id="tokens-&-plans">{content.introduction.tokens_plans.title}</h3>
					<p className="text-neutral-500">
						{content.introduction.tokens_plans.content}
					</p>
				</div>
			</div>
		</DocLayout>
	)
}

export default DocumentationPage



