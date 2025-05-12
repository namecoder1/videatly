'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { IdeaData, ScriptBoxProps } from "@/types/types";
import { deleteScript } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Trash2, ArrowRight, Users, Hourglass } from "lucide-react";
import Link from "next/link";
import { personaIcon, structureIcon, toneIcon, typeIcon } from "@/assets/home";
import Image from "next/image";

const ScriptBox = ({ props, onDelete } : { props: ScriptBoxProps, onDelete?: (id: number) => void }) => {
	const { toast } = useToast();
	const [idea, setIdea] = useState<IdeaData | null>(null);
	const { id, idea_id, tone, target_audience, script_type, duration, persona, structure } = props;

	useEffect(() => {
		const fetchIdea = async () => {
			const supabase = await createClient();
			const { data: idea } = await supabase.from('ideas').select('*').eq('id', idea_id).single();
			setIdea(idea);
		}
		fetchIdea();
	}, [idea_id]);

	const handleDelete = async () => {
		const result = await deleteScript(props.id);
		if (result.success) {
			if (onDelete) {
				onDelete(props.id);
			}
			toast({
				title: 'Success',
				description: 'Script deleted successfully',
				variant: 'success'
			});
		} else {
			toast({
				title: 'Error',
				description: 'Failed to delete script: ' + result.error,
				variant: 'destructive'
			});
		}
	}

	return (
		<Card className="flex flex-col h-full">
			<CardHeader className="pb-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{idea?.title || 'Loading...'}</h3>
				</div>
				<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{idea?.description || 'Loading...'}</p>
			</CardHeader>
			<CardContent className="flex-grow">
				<div className="grid grid-cols-2 gap-2">
					<div className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
						<Image src={typeIcon} alt="Type" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{script_type}</span>
					</div>
					<div className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
						<Image src={toneIcon} alt="Tone" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tone}</span>
					</div>
					<div className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
						<Image src={personaIcon} alt="Persona" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{persona}</span>
					</div>
					<div className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
						<Image src={structureIcon} alt="Structure" className="w-4 h-4 min-w-4 min-h-4 mr-2" />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{structure}</span>
					</div>
					<div className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
						<Hourglass className="w-4 h-4 min-w-4 min-h-4 text-amber-500 mr-2" />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{duration}</span>
					</div>
					<div className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
						<Users className="w-4 h-4 min-w-4 min-h-4 text-blue-500 mr-2" />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">{target_audience}</span>
					</div>
				</div>
			</CardContent>
			<CardFooter className="gap-2">
				<Button 
						size='icon' 
						onClick={handleDelete}
						type="button"
						className='px-10'
					>
					<Trash2 className='w-4 h-4' />
				</Button>
				<Button className="w-full" variant='black' asChild>
					<Link href={`/scripts/${id}`}>
						View Script
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

export default ScriptBox;