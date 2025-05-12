import PublicSidebar from '@/components/blocks/(public)/sidebar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

const DocsLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SidebarProvider>
			<PublicSidebar />
			<main className='w-full h-full flex flex-col px-4 sm:px-6'>
				<div className='absolute top-4 right-4 border rounded-2xl p-1.5 bg-card hover:bg-card/80'>
					<SidebarTrigger />
				</div>
				<div className='my-4'>
					{children}
				</div>
			</main>
		</SidebarProvider>
	)
}

export default DocsLayout