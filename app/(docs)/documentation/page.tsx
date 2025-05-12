import { BookIcon, Lightbulb, NotepadText, Clapperboard } from "lucide-react"
import Link from "next/link"
import DocLayout from "@/components/blocks/(public)/doc-layout"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Documentation', href: '/documentation' },
]
	
const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'core-features', title: 'Core Features' },
  { id: 'platform-guides', title: 'Platform Guides' },
  { id: 'tokens-&-plans', title: 'Tokens & Plans' },
  { id: 'help', title: 'Need Help?' },
]

// const features = [
// 	{
// 		title: "Ideas",
// 		description: "Understand how to use our ideas platform",
// 		features: ["Creating beautiful ideas", "Setting up workflows", "Managing idea executions", "Best practices and examples"],
// 		buttonText: "Learn More",
// 		buttonLink: "/documentation/ideas",
// 		icon: <Lightbulb className="w-4 h-4 text-blue-500" />,
// 		iconBackground: "bg-blue-100",
// 		iconBorder: "border-blue-200",
// 		guideName: "ideas",
// 	},
// 	{
// 		title: "Scripts",
// 		description: "Understand how to use our scripts platform",
// 		features: ["Creating beautiful scripts", "Setting up workflows", "Managing script executions", "Best practices and examples"],
// 		buttonText: "Learn More",
// 		buttonLink: "/documentation/scripts",
// 		icon: <NotepadText className="w-4 h-4 text-yellow-500" />,
// 		iconBackground: "bg-yellow-100",
// 		iconBorder: "border-yellow-200",
// 		guideName: "scripts",
// 	}
// ]

// const guides = [
// 	{
// 		title: "Ideas",
// 		description: "Detailed guide to using the ideas platform",
// 		link: "/documentation/guides/ideas",
// 		icon: <Lightbulb className="w-4 h-4 text-blue-500" />
// 	},
// 	{
// 		title: "Scripts",
// 		description: "Detailed guide to using the scripts platform",
// 		link: "/documentation/guides/scripts",
// 		icon: <NotepadText className="w-4 h-4 text-yellow-500" />
// 	}
// ]

const DocumentationPage = () => {
	return (
		<DocLayout 
			icon={<BookIcon />} 
			title="Documentation" 
			breadcrumbs={breadcrumbs} 
			sections={sections}
		>
			<div className='flex-1'>
				<div>
					<h2 className="text-3xl font-bold mb-3">Introduction</h2>
					<p className="text-neutral-500 tracking-wide leading-relaxed">
					Videatly is a platform that allows you to create and manage your ideas, scripts, and workflows.
					The idea is to create a platform that allows you to improve your Video Production workflow and 
					overall productivity by using AI features and tool builded exactly for this purpose. 
					<br />
					Each feature is builded to improve a specific part of the Video Production workflow. 
					In the guides section you can find more information about each feature and how to use them.

					<br />
					<br />
					This introduction and the use of the platform assumes that you have a basic understanding 
					of the Youtube Video Production workflow and specific terminology.
					If you are not familiar with the Video Production workflow, you can find more information 
					about it in the <Link target="_blank" href="https://www.youtube.com/playlist?list=PLpjK416fmKwQKmatriVu3rdwv7g4ZJSfD" className="text-blue-500 hover:underline">Quickstart Guide to YouTube</Link>.
					</p>
				</div>
				<div className="mt-14" >
					<h3 className="text-2xl font-bold mb-3">Core Features</h3>
					<p className="text-neutral-500 tracking-wide leading-relaxed">
						Videatly covers various parts of the Video Production workflow.
						You start by creating an idea, then from this idea you can create a script; 
						each script is a timeline of video segments, you can add, remove, edit, and reorder them.
						<br />
						From the script you can create a workflow to produce the video; workflow are like
						detailed group of datas that you produced when creating the overall video.
						<br />
						You can also manage your ideas, scripts and workflows from the platform, as well as creating
						todos and tasks to keep track of your work and manage the heavy tasks more efficiently.
						In the workflow section you can also get related images and videos to help you with the production.
						Each video and image is provided by third party services and is not for free.
						<br />
					</p>
					<p className="text-neutral-500 tracking-wide leading-relaxed mt-10 mb-3">
						This is our core features:
					</p>
					<div className="grid grid-cols-3 items-start gap-4">
						<Card className="w-fit">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 mb-1">
									<div className="flex items-center gap-2 bg-yellow-100 border border-yellow-200 rounded-xl p-2 w-fit">
										<Lightbulb className="w-4 h-4 text-yellow-500" />
									</div>
									Ideas
								</CardTitle>
								<CardDescription className="text-neutral-500 tracking-wide leading-relaxed max-w-sm">
									<p className="mb-2">
										Ideas are the first step to create a video.
									</p>
									<p className="text-sm text-neutral-400">
										To create a new idea click in the button <span className="font-bold">Create Idea</span> in the ideas section.
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
									Scripts
								</CardTitle>
								<CardDescription className="text-neutral-500 tracking-wide leading-relaxed max-w-sm">
									<p className="mb-2">
										Scripts are the second step to create a video.
									</p>
									<p className="text-sm text-neutral-400">
										You can create a script by clicking on the idea you want to use and then clicking on the <span className="font-bold">Create Script</span> button.
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
									Production
								</CardTitle>
								<CardDescription className="text-neutral-500 tracking-wide leading-relaxed max-w-sm">
									<p className="mb-2">
										Production is the third step to create a video.
									</p>
									<p className="text-sm text-neutral-400">
										To create a production click on the script you want to use and then clicking on the &quot;Create Production&quot; button.
									</p>									
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
				<div className="mt-14">
					<h3 className="text-2xl font-bold mb-3">Platform Guides</h3>
					<p className="text-neutral-500 tracking-wide leading-relaxed">
						Platform guides are a collection of guides that will help you understand how to use the platform.
						Each important feature has a guide that will help you understand how to use it. For any other information
						not covered in the guides, you can always contact us at <Link href="mailto:support@videatly.com" className="text-blue-500 hover:underline">support@videatly.com</Link>.
						<br />
						<br />
						We recommend to read the guides in the logical order as said before.
					</p>
					<p className="text-neutral-500 tracking-wide leading-relaxed mt-10 mb-3">
						In order, you should read the guides as follows:
					</p>
					<ul className="flex flex-col gap-2  list-inside">
						<li className="flex flex-row items-center gap-2"> -
							<Link href="/documentation/guides/ideas" className="flex flex-row items-center gap-2">
								<Lightbulb className="w-4 h-4 text-blue-500" />
								Ideas Guide: <span className="text-neutral-500">Learn how to create and manage ideas</span>
							</Link>
						</li>
						<li className="flex flex-row items-center gap-2"> -
							<Link href="/documentation/guides/ideas" className="flex flex-row items-center gap-2">
								<NotepadText className="w-4 h-4 text-yellow-500" />
								Scripts Guide: <span className="text-neutral-500">Learn how to create and manage scripts</span>
							</Link>
						</li>
						<li className="flex flex-row items-center gap-2"> -
							<Link href="/documentation/guides/ideas" className="flex flex-row items-center gap-2">
								<Clapperboard className="w-4 h-4 text-red-500" />
								Production Guide: <span className="text-neutral-500">Learn how to create and manage productions</span>
							</Link>
						</li>
					</ul>
				</div>
				<div className="mt-14">
					<h3 className="text-2xl font-bold mb-3">Tokens & Plans</h3>
					<p className="text-neutral-500 tracking-wide leading-relaxed">
						Each user starts with 7500 tokens totally, 5000 for the scripts creation and 2500 for the ideas creation.
						This amount is enough to create 4 videos and at least 4 scripts. The tokens in each plan are renewed every 30 days.
						if you run out of tokens, you can buy more in the <Link href="/pricing" className="text-blue-500 hover:underline">pricing page</Link>.
						<br />
						<br />
						Each plan has a different amount of tokens and a different price.
						The free plan, has already said, has 7500 tokens and is free to use.
						The 2 paid plans have a different amount of tokens and a different price.
					</p>
				</div>
			</div>
		</DocLayout>
	)
}

export default DocumentationPage



