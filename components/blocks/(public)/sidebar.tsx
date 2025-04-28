import { SidebarMenuItem } from '@/components/ui/sidebar'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { SidebarMenu } from '@/components/ui/sidebar'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import React from 'react'
import { AppSidebar } from '../app-sidebar'
import { BookOpen, CreditCard, FileSliders, Home, Lightbulb, ListCheck, NotepadText, Rocket, SquareLibrary } from 'lucide-react'
import Link from 'next/link'
import { SidebarGroup } from '@/components/ui/sidebar'


const documentationItems = [
	{
		label: 'Home',
		href: '/documentation',
		icon: <Home />
	},
	{
		label: 'Getting Started',
		href: '/documentation/getting-started',
		icon: <Rocket />
	},
	{
		label: 'Usage',
		href: '/documentation/usage',
		icon: <BookOpen />
	},
	{
		label: 'Configuration',
		href: '/documentation/configuration',
		icon: <FileSliders />
	},
	{
		label: 'Use Cases',
		href: '/documentation/use-cases',
		icon: <ListCheck />
	},
]

const specificItems = [
	{
		label: 'Ideas',
		href: '/documentation/ideas',
		icon: <Lightbulb />
	},
	{
		label: 'Scripts',
		href: '/documentation/scripts',
		icon: <NotepadText />
	},
	{
		label: 'Tokens & Plans',
		href: '/documentation/tokens-and-plans',
		icon: <CreditCard />
	},
]

const platformGuidesItems = [
	{
		label: 'Platform Guide',
		href: '/documentation/platform-guide',
		icon: <SquareLibrary />
	},
	{
		label: 'Ideas Guide',
		href: '/documentation/ideas-guide',
		icon: <SquareLibrary />
	},
	{
		label: 'Scripts Guide',
		href: '/documentation/scripts-guide',
		icon: <SquareLibrary />
	}
]
const PublicSidebar = () => {
	return (
		<AppSidebar isProtected={true}>
			<SidebarGroup>
				<SidebarGroupLabel>Overview</SidebarGroupLabel>
				<SidebarMenu>
				{documentationItems.map((item) => (
					<SidebarMenuItem key={item.label}>
						<SidebarMenuButton asChild>
							<Link href={item.href}>
								{item.icon}
								{item.label}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
				</SidebarMenu>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel>Specific</SidebarGroupLabel>
				<SidebarMenu>
				{specificItems.map((item) => (
					<SidebarMenuItem key={item.label}>
						<SidebarMenuButton asChild>
							<Link href={item.href}>
								{item.icon}
								{item.label}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
				</SidebarMenu>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel>Platform Guides</SidebarGroupLabel>
				<SidebarMenu>
				{platformGuidesItems.map((item) => (
					<SidebarMenuItem key={item.label}>
						<SidebarMenuButton asChild>
							<Link href={item.href}>
								{item.icon}
								{item.label}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
				</SidebarMenu>
			</SidebarGroup>
		</AppSidebar>
	)
}

export default PublicSidebar