import { Separator } from '@/components/ui/separator'
import CustomIcon from '@/components/ui/custom-icon'
import React from 'react'
import { Rocket, ArrowRight, CheckCircle2, Lightbulb, NotepadText, Video, Settings, Users } from 'lucide-react'
import DocLayout from '@/components/blocks/(public)/doc-layout'
import loginImage from '@/assets/docs-image/login.png'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import ContactSupport from '@/components/blocks/(public)/call-to-action'
import CallToAction from '@/components/blocks/(public)/call-to-action'

const breadcrumbs = [
	{ label: 'Home', href: '/' },
	{ label: 'Documentation', href: '/documentation' },
	{ label: 'Getting Started', href: '/documentation/getting-started' },
]

const sections = [
	{ id: 'introduction', title: 'Introduction' },
	{ id: 'account-setup', title: 'Account Setup' },
	{ id: 'platform-overview', title: 'Platform Overview' },
	{ id: 'first-steps', title: 'First Steps' },
	{ id: 'next-steps', title: 'Next Steps' },
]

const GettingStarted = () => {
	return (
		<DocLayout
			icon={<Rocket />}
			title="Getting Started"
			breadcrumbs={breadcrumbs}
			sections={sections}
		>
			<div className="space-y-8">
				<div id="introduction" className="space-y-4">
					<h2 className="text-2xl font-semibold">Introduction</h2>
					<p className="text-gray-600 leading-relaxed">
						Welcome to Videatly, your AI-powered platform for creating, managing, and optimizing video content. 
						This guide will walk you through the essential steps to get started with our platform and make the most of its features.
					</p>
					<p className="text-gray-600 leading-relaxed">
						Videatly combines the power of artificial intelligence with intuitive tools to help you generate video ideas, 
						create detailed scripts, and streamline your content creation workflow. Whether you're a content creator, 
						marketer, or business owner, our platform is designed to help you produce high-quality video content efficiently.
					</p>
					<div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
						<p className="text-sm text-neutral-600 flex items-center gap-2">
							<span className="bg-zinc-100 rounded-xl p-2 border border-zinc-200">
								<CheckCircle2 className="w-4 h-4 text-green-500" />
							</span>
							This guide assumes you have already created an account. If you haven't, please sign up first.
						</p>
					</div>
				</div>

				<div id="account-setup" className="space-y-4">
					<h2 className="text-2xl font-semibold">Account Setup</h2>
					<p className="text-gray-600 leading-relaxed">
						To get started with Videatly, you'll need to create an account and set up your profile. 
						This will allow you to access all the features of our platform and save your work.
					</p>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-4">
							<h3 className="font-medium text-lg mb-2">Sign Up</h3>
							<p className="text-sm text-gray-600 mb-4">
								You can sign up using your Google account for a quick and secure registration process.
							</p>
							<Image src={loginImage} alt="Login Image" className="rounded-xl border border-gray-200 mb-4" />
							<Button variant="outline" className="w-full" asChild>
								<Link href="/sign-in">Sign Up Now</Link>
							</Button>
						</Card>
						
						<Card className="p-4 flex flex-col justify-between">
							<h3 className="font-medium text-lg mb-2">Complete Your Profile</h3>
							<p className="text-sm text-gray-600 mb-4">
								After signing up, complete your profile with your name, profile picture, and other relevant information.
								This helps personalize your experience and allows our AI to better assist you.
							</p>
							<ul className="text-sm text-gray-600 space-y-2 mb-4">
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Add your name and profile picture</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Set your content preferences</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Configure notification settings</span>
								</li>
							</ul>
							<Button variant="outline" className="w-full" asChild>
								<Link href="/profile">Go to Profile</Link>
							</Button>
						</Card>
					</div>
				</div>

				<div id="platform-overview" className="space-y-4">
					<h2 className="text-2xl font-semibold">Platform Overview</h2>
					<p className="text-gray-600 leading-relaxed">
						Videatly offers a comprehensive suite of tools designed to streamline your video content creation process. 
						Here's an overview of the main features:
					</p>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-4">
							<div className="flex items-center gap-3 mb-4">
								<div className="bg-zinc-100 rounded-xl p-2 border border-zinc-200">
									<Lightbulb className="w-5 h-5 text-amber-500" />
								</div>
								<h3 className="font-medium text-lg">Ideas</h3>
							</div>
							<p className="text-sm text-gray-600 mb-4">
								Generate and manage video ideas with our AI-powered assistant. Define your target audience, 
								video type, length, and style to get tailored suggestions.
							</p>
							<ul className="text-sm text-gray-600 space-y-2">
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>AI-powered idea generation</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Customize video parameters</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Save and organize ideas</span>
								</li>
							</ul>
						</Card>
						
						<Card className="p-4">
							<div className="flex items-center gap-3 mb-4">
								<div className="bg-zinc-100 rounded-xl p-2 border border-zinc-200">
									<NotepadText className="w-5 h-5 text-blue-500" />
								</div>
								<h3 className="font-medium text-lg">Scripts</h3>
							</div>
							<p className="text-sm text-gray-600 mb-4">
								Transform your ideas into detailed video scripts. Our AI helps you create engaging narratives 
								with proper structure, hooks, and calls-to-action.
							</p>
							<ul className="text-sm text-gray-600 space-y-2">
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>AI-assisted script writing</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Structure and formatting tools</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Export in multiple formats</span>
								</li>
							</ul>
						</Card>
						
						<Card className="p-4">
							<div className="flex items-center gap-3 mb-4">
								<div className="bg-zinc-100 rounded-xl p-2 border border-zinc-200">
									<Video className="w-5 h-5 text-purple-500" />
								</div>
								<h3 className="font-medium text-lg">Video Planning</h3>
							</div>
							<p className="text-sm text-gray-600 mb-4">
								Plan your video production with our comprehensive tools. Define scenes, shots, 
								and production requirements to ensure a smooth filming process.
							</p>
							<ul className="text-sm text-gray-600 space-y-2">
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Scene breakdowns</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Shot lists and storyboards</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Production checklists</span>
								</li>
							</ul>
						</Card>
						
						<Card className="p-4">
							<div className="flex items-center gap-3 mb-4">
								<div className="bg-zinc-100 rounded-xl p-2 border border-zinc-200">
									<Settings className="w-5 h-5 text-gray-500" />
								</div>
								<h3 className="font-medium text-lg">Settings & Preferences</h3>
							</div>
							<p className="text-sm text-gray-600 mb-4">
								Customize your Videatly experience with personalized settings and preferences.
							</p>
							<ul className="text-sm text-gray-600 space-y-2">
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Account management</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>AI assistant preferences</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Notification settings</span>
								</li>
							</ul>
						</Card>
					</div>
				</div>

				<div id="first-steps" className="space-y-4">
					<h2 className="text-2xl font-semibold">First Steps</h2>
					<p className="text-gray-600 leading-relaxed">
						Now that you're familiar with the platform, let's walk through your first steps to create content with Videatly:
					</p>
					
					<div className="space-y-6">
						<div className="flex flex-col md:flex-row gap-4 items-start">
							<div className="bg-zinc-100 rounded-xl p-3 border border-zinc-200 shrink-0">
								<span className="text-lg font-semibold">1</span>
							</div>
							<div>
								<h3 className="font-medium text-lg">Create Your First Idea</h3>
								<p className="text-gray-600">
									Start by creating a new video idea. Navigate to the Ideas section and click on "New Idea". 
									Define your target audience, video type, length, and style. Our AI will help you develop 
									a compelling concept based on your specifications.
								</p>
								<Button variant="outline" className="mt-4" asChild>
									<Link href="/ideas/new">Create New Idea</Link>
								</Button>
							</div>
						</div>
						
						<div className="flex flex-col md:flex-row gap-4 items-start">
							<div className="bg-zinc-100 rounded-xl p-3 border border-zinc-200 shrink-0">
								<span className="text-lg font-semibold">2</span>
							</div>
							<div>
								<h3 className="font-medium text-lg">Develop Your Script</h3>
								<p className="text-gray-600">
									Once you have an idea you're happy with, move on to creating a script. Select your idea 
									and click "Create Script". Our AI will help you develop a detailed script with proper 
									structure, engaging hooks, and effective calls-to-action.
								</p>
								<Button variant="outline" className="mt-4" asChild>
									<Link href="/scripts">Create Script</Link>
								</Button>
							</div>
						</div>
						
						<div className="flex flex-col md:flex-row gap-4 items-start">
							<div className="bg-zinc-100 rounded-xl p-3 border border-zinc-200 shrink-0">
								<span className="text-lg font-semibold">3</span>
							</div>
							<div>
								<h3 className="font-medium text-lg">Plan Your Production</h3>
								<p className="text-gray-600">
									With your script ready, it's time to plan your video production. Create a production plan 
									with scene breakdowns, shot lists, and production requirements. This will help you 
									organize your filming process and ensure nothing is missed.
								</p>
								<Button variant="outline" className="mt-4" asChild>
									<Link href="/production">Plan Production</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div id="next-steps" className="space-y-4">
					<h2 className="text-2xl font-semibold">Next Steps</h2>
					<p className="text-gray-600 leading-relaxed">
						Congratulations! You've taken your first steps with Videatly. Here are some additional resources 
						to help you make the most of our platform:
					</p>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="p-4 flex flex-col justify-between">
							<h3 className="font-medium text-lg mb-2">Explore Documentation</h3>
							<p className="text-sm text-gray-600 mb-4">
								Dive deeper into our platform with detailed guides and tutorials.
							</p>
							<Button variant="outline" className="w-full" asChild>
								<Link href="/documentation">View Documentation</Link>
							</Button>
						</Card>
						
						<Card className="p-4 flex flex-col justify-between">
							<h3 className="font-medium text-lg mb-2">Join Our Community</h3>
							<p className="text-sm text-gray-600 mb-4">
								Connect with other creators and share your experiences.
							</p>
							<Button variant="outline" className="w-full" asChild>
								<Link href="/community">Join Community</Link>
							</Button>
						</Card>
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
			</div>
		</DocLayout>
	)
}

export default GettingStarted