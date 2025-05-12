'use client'

import React from 'react'
import { IdeaData } from '@/types/types'
import Link from 'next/link'
import { ArrowRight, Clock4, Film, Paintbrush, Target, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { parseTags } from '@/lib/extraction'
import { useToast } from '@/hooks/use-toast'
import { deleteIdea } from '@/app/actions'
import { useSidebarViewport } from '@/hooks/use-sidebar-viewport'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

const IdeaBox = ({ 
	idea, 
	isActive, 
	setSelectedIdea 
}: { 
	idea: IdeaData,
	isActive?: boolean,
	setSelectedIdea?: (idea: IdeaData) => void
}) => {
	const { toast } = useToast();
	const { gridClasses, cardClasses } = useSidebarViewport()
	const { container } = gridClasses
	const { base, active, background } = cardClasses

	const tags = parseTags(idea.tags || []);

	const handleDelete = async () => {
		const result = await deleteIdea(idea.id.toString());
		if (result.success) {
			// Remove the element from the DOM
			const element = document.getElementById(idea.id.toString());
			if (element) element.remove();
			
			toast({
				title: 'Success',
				description: 'Idea deleted successfully',
				variant: 'success'
			});
		} else {
			toast({
				title: 'Error',
				description: 'Failed to delete idea: ' + result.error,
				variant: 'destructive'
			});
		}
	};

	return (
		<Card 
			id={idea.id.toString()} 
			onClick={() => setSelectedIdea?.(idea)}
			className={cn(
				base,
				isActive ? active : background,
				'p-6 rounded-3xl border border-gray-200 flex flex-col justify-between',
				setSelectedIdea ? 'cursor-pointer' : ''
			)}
		>
			<div>
				<h3 className='text-xl font-semibold mb-2'>{idea.title}</h3>
			</div>
			<p className='text-sm text-gray-500 mb-4'>{idea.description}</p>
			<div className='flex gap-2 my-4'>
				{tags.map((tag: string) => (
					<Badge variant='outline' key={tag}>
						{tag}
					</Badge>
				))}
			</div>
			<div className={container}>
				<div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
					<Paintbrush className='w-4 h-4 min-w-4 min-h-4 text-blue-500 mr-2' />
					<span className='text-sm font-medium'>{idea.video_style}</span>
				</div>
				<div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
					<Film className='w-4 h-4 min-w-4 min-h-4 text-purple-500 mr-2' />
					<span className='text-sm font-medium'>{idea.video_type}</span>
				</div>
				<div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
					<Clock4 className='w-4 h-4 min-w-4 min-h-4 text-amber-500 mr-2' />
					<span className='text-sm font-medium'>{idea.video_length}</span>
				</div>
				<div className='flex items-center p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors'>
					<Target className='w-4 h-4 min-w-4 min-h-4 text-red-500 mr-2' />
					<span className='text-sm font-medium'>{idea.video_target}</span>
				</div>
			</div>
			<div className='flex justify-center gap-2 mt-4'>
				<Button 
						size='icon' 
						onClick={handleDelete}
						type="button"
						className='px-10'
					>
					<Trash2 className='w-4 h-4' />
				</Button>
				<Button asChild className='bg-black hover:bg-black/80 w-full'>
					<Link href={`/ideas/${idea.id}`} >
						<p className='text-white'>View Idea</p>
					<ArrowRight className='w-4 h-4' />
				</Link>
			</Button>
			</div>
		</Card>
	)
}

export default IdeaBox