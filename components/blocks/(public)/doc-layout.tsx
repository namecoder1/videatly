import { DocsSidebar } from './docs-sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import React from 'react'
import Breadcrumbs from '../breadcrumbs'
import CustomIcon from '@/components/ui/custom-icon'
import { Lightbulb, NotepadText, BookIcon } from 'lucide-react'

const DocLayout = ({ icon, title, breadcrumbs, sections, children }: { icon: React.ReactNode, title: string, breadcrumbs: any, sections: any, children: React.ReactNode }) => {
	return (
		<section className="flex flex-col lg:grid lg:grid-cols-7 w-full h-fit overflow-hidden">
			<div className="col-span-full shrink-0">
				<div className='flex items-center gap-3'>
					<CustomIcon icon={icon} color='red' />
					<h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
				</div>
				<Separator className='my-4' />
			</div>

			<ScrollArea className=" lg:col-span-5 h-[calc(100vh-7rem)] ">
				<Breadcrumbs breadcrumbs={breadcrumbs} className="mb-6" />
				{children}
			</ScrollArea>
			<div className="w-full shrink-0 col-span-2 hidden lg:block">
				<DocsSidebar 
					sections={sections}
				/>
			</div>
		</section>
	)
}

export default DocLayout