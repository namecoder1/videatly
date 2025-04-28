import { Button } from "@/components/ui/button"
import { ArrowRight, BookIcon, Lightbulb, LinkIcon, NotepadText, TriangleAlert, Users } from "lucide-react"
import Link from "next/link"
import DocLayout from "@/components/blocks/(public)/doc-layout"
import { Card } from "@/components/ui/card"
import CallToAction from "@/components/blocks/(public)/call-to-action"

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

const features = [
	{
		title: "Ideas",
		description: "Understand how to use our ideas platform",
		features: ["Creating beautiful ideas", "Setting up workflows", "Managing idea executions", "Best practices and examples"],
		buttonText: "Learn More",
		buttonLink: "/documentation/ideas",
		icon: <Lightbulb className="w-4 h-4 text-blue-500" />,
		iconBackground: "bg-blue-100",
		iconBorder: "border-blue-200",
		guideName: "ideas"
	},
	{
		title: "Scripts",
		description: "Understand how to use our scripts platform",
		features: ["Creating beautiful scripts", "Setting up workflows", "Managing script executions", "Best practices and examples"],
		buttonText: "Learn More",
		buttonLink: "/documentation/scripts",
		icon: <NotepadText className="w-4 h-4 text-yellow-500" />,
		iconBackground: "bg-yellow-100",
		iconBorder: "border-yellow-200",
		guideName: "scripts"
	}
]

const guides = [
	{
		title: "Ideas",
		description: "Detailed guide to using the ideas platform",
		link: "/documentation/guides/ideas"
	},
	{
		title: "Scripts",
		description: "Detailed guide to using the scripts platform",
		link: "/documentation/guides/scripts"
	}
]

const DocumentationPage = () => {
	return (
		<DocLayout 
			icon={<BookIcon />} 
			title="Documentation" 
			breadcrumbs={breadcrumbs} 
			sections={sections}
		>
			<div className="space-y-12">
					<div id="introduction">
						<h2 className="text-2xl font-semibold mb-4">Introduction</h2>
						<p className="text-gray-600 leading-relaxed mb-6">
							Welcome to our platform documentation. This guide will help you understand how to effectively use our platform to manage your ideas and automate your workflows.
						</p>
						
						<CallToAction
							props={{
								description: "Before diving in, we recommend starting with our quick guide to understand the core concepts and basic usage patterns.",
								buttonText: "Learn More",
								buttonLink: "/documentation/getting-started",
								icon: <BookIcon className="w-4 h-4 text-blue-500" />,
								iconColor: "bg-blue-500"
							}}
						/>
					</div>

					<div id="core-features">
						<h2 className="text-2xl font-semibold mb-4">Core Features</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{features.map((feature, index) => (
								<BreakdownComponent key={index} {...feature} />
							))}
						</div>
					</div>

					<div id="platform-guides">
						<h2 className="text-2xl font-semibold mb-4">Platform Guides</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{guides.map((guide, index) => (
								<PlatformGuide key={index} {...guide} />
							))}
						</div>
					</div>

					<div id="tokens-&-plans">
						<h2 className="text-2xl font-semibold mb-4">Tokens & Plans</h2>
						<p className="text-gray-600 leading-relaxed mb-6">
							Each user starts with 
						</p>
					</div>

					<CallToAction
						props={{
							description: "Our support team is here to assist you with any questions or issues you may have.",
							buttonText: "Contact Support",
							buttonLink: "mailto:support@videatly.ai",
							icon: <Users className="w-4 h-4 text-blue-500" />,
							iconColor: "bg-blue-500"
						}}
					/>
				</div>
		</DocLayout>
	)
}


const BreakdownComponent = ({ title, description, features, icon, iconBackground, iconBorder, guideName }: { 
	title: string, 
	description: string, 
	features: string[],
	buttonText: string, 
	buttonLink: string, 
	icon: React.ReactNode, 
	iconBackground: string,
	iconBorder: string,
	guideName: string
}) => {
	return (
		<Card className="p-4 h-full flex flex-col">
			<div className="flex items-center gap-3 mb-4">
				<div className={`rounded-xl p-2 border ${iconBackground} ${iconBorder}`}>
					{icon}
				</div>
				<h3 className="font-medium text-lg">{title}</h3>
			</div>
			<p className="text-sm text-gray-600 mb-4">{description}</p>
			<ul className="text-sm text-gray-600 space-y-3 mt-auto">
				{features.map((feature, index) => (
					<li key={index} className="flex items-start">
						<span className="mr-2">•</span>
						<span>{feature}</span>
					</li>
				))}
			</ul>
			<div className="flex items-center justify-center gap-4">
				<Button variant="outline" className="mt-6 group w-full" asChild>
					<Link href={`/documentation/${guideName}`} className="">Learn More <ArrowRight className="group-hover:translate-x-1 transition-all" /></Link>
				</Button>
				<Button variant="outline" className="mt-6 group w-full" asChild>
					<Link href={`/documentation/guides/${guideName}`} className="">Start the Guide <ArrowRight className="group-hover:translate-x-1 transition-all" /></Link>
				</Button>
			</div>
		</Card>
	)
}

const PlatformGuide = ({ title, description, link }: { 
	title: string, 
	description: string,
	link: string
}) => {
	return (
		<Card className="px-4 py-3.5 h-full flex flex-col group">
			<Link href={link} className="flex items-start justify-between">
				<h3 className="text-lg font-semibold mb-2">{title}</h3>
				<div className="flex items-center gap-2">
					<LinkIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-all" />
					<p className="text-xs text-gray-600 group-hover:text-gray-800 group-hover:underline underline-offset-4 transition-all">View Guide</p>
				</div>
			</Link>
			<p className="text-sm text-gray-600">{description}</p>
		</Card>
	)
}

export default DocumentationPage



