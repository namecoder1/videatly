'use client'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import ProtectedSidebar from '@/components/blocks/(protected)/sidebar'

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {

	return (
		<SidebarProvider>
			<ProtectedSidebar />
			<main className='p-4 sm:p-6 w-full'>
				<div className='absolute top-4 right-4 border rounded-2xl p-1.5 hover:bg-gray-100'>
					<SidebarTrigger className='hover:bg-transparent' />
				</div>
				{children}
			</main>
		</SidebarProvider>
	)
}
export default ProtectedLayout