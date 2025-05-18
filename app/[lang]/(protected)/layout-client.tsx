'use client'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import ProtectedSidebar from '@/components/blocks/(protected)/sidebar'
import { Toaster } from '@/components/ui/toaster'
import { SheetProvider } from '@/components/ui/sheet-context'
import { DictionaryContext } from '@/app/context/dictionary-context'

const ProtectedLayout = ({ 
	children, 
	params 
}: { 
	children: React.ReactNode,
	params: { 
		dict: any,
		lang?: string 
	}
}) => {
	// Assicuriamoci che locale sia impostato correttamente nel dizionario
	const enhancedDict = {
		...params.dict,
		locale: params.dict.locale || params.lang || 'en'
	};
	
	console.log('ProtectedLayout - Using locale:', enhancedDict.locale);
	
	return (
		<DictionaryContext.Provider value={enhancedDict}>
			<SheetProvider>
				<SidebarProvider>
					<ProtectedSidebar />
					<main className='p-4 sm:p-6 w-full'>
						<div className='absolute top-4 right-4 border rounded-2xl p-1.5 bg-card hover:bg-card/80	'>
							<SidebarTrigger />
						</div>
						{children}
					</main>
					<Toaster />
				</SidebarProvider>
			</SheetProvider>
		</DictionaryContext.Provider>
	)
}
export default ProtectedLayout 