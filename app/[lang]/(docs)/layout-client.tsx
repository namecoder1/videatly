'use client'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import PublicSidebar from '@/components/blocks/(public)/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { SheetProvider } from '@/components/ui/sheet-context'
import { DictionaryContext } from '@/app/context/dictionary-context'

const DocsLayout = ({ 
	children, 
	params 
}: { 
	children: React.ReactNode,
	params: { 
		dict: any 
	}
}) => {
	return (
		<DictionaryContext.Provider value={params.dict}>
			<SheetProvider>
				<SidebarProvider>
					<PublicSidebar dict={params.dict} />
					<main className='w-full h-full flex flex-col px-4 sm:px-6'>
						<div className='absolute top-4 right-4 border rounded-2xl p-1.5 bg-card hover:bg-card/80'>
							<SidebarTrigger />
						</div>
						<div className='my-4'>
							{children}
						</div>
					</main>
					<Toaster />
				</SidebarProvider>
			</SheetProvider>
		</DictionaryContext.Provider>
	)
}

export default DocsLayout 