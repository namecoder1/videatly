'use client'
import { SidebarMenuItem } from '@/components/ui/sidebar'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { SidebarMenu } from '@/components/ui/sidebar'
import { SidebarGroupLabel } from '@/components/ui/sidebar'
import React from 'react'
import { AppSidebar } from '../app-sidebar'
import { BookOpen, CreditCard, FileSliders, Home, Lightbulb, ListCheck, NotepadText, Rocket, SquareLibrary } from 'lucide-react'
import Link from 'next/link'
import { SidebarGroup } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'


const PublicSidebar = ({ dict }: { dict: any }) => {

	const pathname = usePathname();

  const currentLang = pathname.split('/')[1] || 'en';


	const documentationItems = [
		{
			label: dict.docSidebar.documentation[0],
			href: `/${currentLang}/documentation`,
			icon: <Home />
		},
		{
			label: dict.docSidebar.documentation[1],
			href: `/${currentLang}/documentation/getting-started`,
			icon: <Rocket />
		},
		{
			label: dict.docSidebar.documentation[2],
			href: `/${currentLang}/documentation/usage`,
			icon: <BookOpen />
		},
		{
			label: dict.docSidebar.documentation[3],
			href: `/${currentLang}/documentation/configuration`,
			icon: <FileSliders />
		},
		{
			label: dict.docSidebar.documentation[4],
			href: `/${currentLang}/documentation/use-cases`,
			icon: <ListCheck />
		},
	]
	
	const specificItems = [
		{
			label: dict.docSidebar.specific[0],
			href: `/${currentLang}/documentation/ideas`,
			icon: <Lightbulb />
		},
		{
			label: dict.docSidebar.specific[1],
			href: `/${currentLang}/documentation/scripts`,
			icon: <NotepadText />
		},
		{
			label: dict.docSidebar.specific[2],
			href: `/${currentLang}/documentation/tokens-and-plans`,
			icon: <CreditCard />
		},
	]
	
	const platformGuidesItems = [
		{
			label: dict.docSidebar.platform[0],
			href: `/${currentLang}/documentation/platform-guide`,
			icon: <SquareLibrary />
		},
		{
			label: dict.docSidebar.platform[1],
			href: `/${currentLang}/documentation/ideas-guide`,
			icon: <SquareLibrary />
		},
		{
			label: dict.docSidebar.platform[2],
			href: `/${currentLang}/documentation/scripts-guide`,
			icon: <SquareLibrary />
		}
	]

	return (
		<AppSidebar isProtected={true} dict={dict}>
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