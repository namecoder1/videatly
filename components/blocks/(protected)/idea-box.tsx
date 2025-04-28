'use client'

import React from 'react'
import { IdeaData } from '@/types/types'
import Link from 'next/link'
import { ArrowRight, Blocks, Clock4, Film, Paintbrush, Target, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { parseTags } from '@/utils/supabase/utils'
import { useToast } from '@/hooks/use-toast'
import { deleteIdea } from '@/app/actions'

const IdeaBox = ({ idea }: { idea: IdeaData }) => {
	const { toast } = useToast();
	// Funzione per convertire i tags in un array di stringhe
	
	const tags = parseTags(idea.tags || []);

	const handleDelete = async () => {
		const result = await deleteIdea(idea.id.toString());
		if (result.success) {
			// Remove the element from the DOM
			const element = document.getElementById(idea.id.toString());
			if (element) {
				element.remove();
			}
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

	console.log(tags)

	return (
		<div id={idea.id.toString()} className='bg-white p-4 rounded-3xl border border-gray-200'>
			<div className='flex justify-between items-center'>
				<h3 className='text-xl font-semibold mb-2'>{idea.title}</h3>
				<Button 
					variant='ghost' 
					size='icon' 
					onClick={handleDelete}
					type="button"
				>
					<Trash2 className='w-4 h-4' />
				</Button>
			</div>
			<p className='text-sm text-gray-500 mb-4'>{idea.description}</p>
			<div className='flex gap-2 my-4'>
				{tags.map((tag: string) => (
					<Badge variant='outline' key={tag}>
						{tag}
					</Badge>
				))}
			</div>
			<div className='grid grid-cols-2 gap-3 mt-2'>
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
			<div className='flex justify-end'>
				<Button asChild className='bg-black hover:bg-black/80 w-fit mt-4'>
					<Link href={`/ideas/${idea.id}`} >
						<p className='text-white'>View Idea</p>
					<ArrowRight className='w-4 h-4' />
				</Link>
			</Button>
			</div>
		</div>
	)
}

export default IdeaBox