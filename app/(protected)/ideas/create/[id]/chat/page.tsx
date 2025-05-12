'use client'

import { Button } from "@/components/ui/button"
import { useChat } from 'ai/react';
import { Brain, CirclePause, User, Save, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { IdeaData, ProfileData } from '@/types/types';
import { 
  saveIdea, 
  deleteIdea, 
  fetchIdeaData, 
  fetchUserProfile,
  isValidIdeaMessage
} from '@/app/actions';
import rehypeRaw from 'rehype-raw';
import { createClient } from "@/utils/supabase/client";
import { encode } from 'gpt-tokenizer/model/gpt-3.5-turbo-0125'
import { useTokens, initializeTokenListener } from '@/hooks/use-tokens';
import { handleKeyDown, handleInputWithResize } from '@/lib/utils';
import { parseTags } from '@/lib/extraction';
import Loader from "@/components/blocks/loader";
import { updateIdeaTokens } from '@/lib/utils';
import ErrorMessage from "@/components/blocks/(protected)/error-message";
import { Textarea } from "@/components/ui/textarea";



const IdeaChatPage = ({ params }: { params: { id: string } }) => {
	const { id } = params;
	const router = useRouter();
	const { toast } = useToast();
	const supabase = createClient()
	const { tokens, updateTokens: updateGlobalTokens } = useTokens()

	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [ideaData, setIdeaData] = useState<IdeaData | null>(null);
	const [canSave, setCanSave] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [savedIdeaId, setSavedIdeaId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [hasEnoughTokens, setHasEnoughTokens] = useState(false);
	const [baseTokens, setBaseTokens] = useState(0)
	const [totalTokens, setTotalTokens] = useState(0)
	const [tokensToSubtract, setTokensToSubtract] = useState(0)

	useEffect(() => {
		// Set initial token values from Zustand store
		const ideasTokens = tokens.find(t => t.tool === 'ideas')
		if (ideasTokens) {
			setBaseTokens(ideasTokens.base_tokens)
			setTotalTokens(ideasTokens.base_tokens + ideasTokens.paid_tokens)
		}

		// Initialize real-time token listener
		const cleanup = initializeTokenListener();
		return () => {
			cleanup();
		};
	}, [tokens])

	const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, stop } = useChat({
		api: '/api/idea-chat',
		body: {
			profile,
			ideaData,
		},
		onFinish: async (message) => {
			if (message.role === 'assistant') {
				await updateIdeaTokens(message.content, setTokensToSubtract, tokens, supabase, setBaseTokens, setTotalTokens, updateGlobalTokens)
			}
		},
		initialMessages: [
			{
				id: 'init',
				role: 'assistant',
				content: ideaData ? 
					`Ciao, ${profile?.name}. Ho visto che vuoi creare un video con queste caratteristiche.
					Hai gia in mente un video o vuoi che ti aiuti a sviluppare un'idea?` : 
					'Caricamento...'
			}
		],
	})

	useEffect(() => {
		if (profile && typeof profile.tokens_available === 'number') {
			setHasEnoughTokens(profile.tokens_available > 0)
		}
	}, [profile])

	useEffect(() => {
		if (!id) {
			setError('No idea ID provided')
			return
		}

		const loadData = async () => {
			const ideaResult = await fetchIdeaData(id)
			if (ideaResult.error) {
				setError(ideaResult.error)
				toast({
					title: "Error",
					description: "Failed to load idea data",
					variant: "destructive"
				})
				return
			}
			setIdeaData(ideaResult.data)

			const profileResult = await fetchUserProfile()
			if (profileResult.error) {
				setError(profileResult.error)
				return
			}
			setProfile(profileResult.data)
		}

		loadData()
	}, [id, toast])

	useEffect(() => {
		const lastMessage = messages[messages.length - 1]
		if (lastMessage?.role === 'assistant') {
			// Check if the message contains a valid idea
			const isValidIdea = isValidIdeaMessage(lastMessage.content)
			setCanSave(isValidIdea)
		}
	}, [messages])

	const handleSubmit = originalHandleSubmit

	const handleSaveIdea = async () => {
		console.log('Save attempt - Token status:', {
			isSaving,
			hasIdeaData: !!ideaData,
		});

		if (isSaving || !ideaData) return;
		
		setIsSaving(true);
		try {
			const result = await saveIdea(
				id, 
				ideaData, 
				messages
			);
			
			if (result.success) {
				setSavedIdeaId(id);
				setCanSave(false);
				
				toast({
					title: "Success",
					description: "Idea saved successfully!",
					variant: "success"
				});
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to save the idea",
					variant: "destructive"
				});
			}
		} catch (error: any) {
			console.error('Error saving idea:', error);
			toast({
				title: "Error",
				description: "Failed to save the idea",
				variant: "destructive"
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleBack = async () => {
		try {
			const result = await deleteIdea(id);
			
			if (result.success) {
				router.push('/ideas');
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to delete the idea",
					variant: "destructive"
				});
			}
		} catch (error) {
			console.error('Error deleting idea:', error);
			toast({
				title: "Error",
				description: "Failed to delete the idea",
				variant: "destructive"
			});
		}
	};

	if (error) return <ErrorMessage error={error} />
	
	if (!profile || !ideaData) return <Loader position='full' />

	const idea = ideaData as IdeaData;

	const tags = parseTags(idea.tags || []);

	return (
		<section className="flex flex-col w-full max-w-sm mx-auto py-24">
			<div className="pb-[120px] space-y-6">
				<Button 
					onClick={handleBack}
					variant="outline"
					className="flex items-center gap-2"
				>
					<ArrowLeft className="w-4 h-4" />
					Back
				</Button>

				<Card className="p-4 mb-6">
					<h3 className="font-semibold mb-2">Video Details:</h3>
					<div className="space-y-1 text-sm">
						<p><span className="font-medium">Suggestion:</span> {idea.description}</p>
						<p><span className="font-medium">Target Interest:</span> {idea.video_target}</p>
						<p><span className="font-medium">Video Type:</span> {idea.video_type}</p>
						<p><span className="font-medium">Content Style:</span> {idea.video_style}</p>
						<p><span className="font-medium">Video Length:</span> {idea.video_length}</p>
						<p><span className="font-medium">Tags:</span> {tags.join(', ')}</p>
					</div>
				</Card>
				{messages.map(m => {
					const tokenCount = encode(m.content).length;
					return (
						<div key={m.id} className={`flex items-start gap-x-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-300 dark:border-zinc-600">
								{m.role === 'user' ? (
									<User className='w-4 h-4 text-zinc-500' />
								) : (
									<Brain className='w-4 h-4 text-indigo-500' />
								)}
							</div>
							<div className={`flex-1 space-y-2 overflow-hidden ${m.role === 'user' ? 'text-right' : ''}`}>
								<ReactMarkdown 
									components={{
										p: ({ children }) => <p className="mb-2">{children}</p>
									}}
									rehypePlugins={[rehypeRaw]}
								>
									{m.content}
								</ReactMarkdown>
								{m.role === 'assistant' && (
									<div className="text-xs text-muted-foreground mt-1">
										{`Token output: ${tokenCount}`}
									</div>
								)}
							</div>
						</div>
					);
				})}
				
				{canSave && !savedIdeaId && (
					<div className="w-full space-y-2">
						<Button 
							onClick={handleSaveIdea}
							disabled={isSaving}
							className="w-full bg-primary hover:bg-primary/80 text-white"
						>
							{isSaving ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Save Idea
								</>
							)}
						</Button>
					</div>
				)}

				{savedIdeaId && (
					<div className="w-full flex gap-2">
						<Button className="bg-primary hover:bg-primary/80 text-white w-full" asChild>
							<Link href={`/ideas/${id}`}>
								<ArrowLeft className="w-4 h-4 ml-2" />
								View Idea
							</Link>
						</Button>
						<Button 
							asChild
							className="bg-primary hover:bg-primary/80 text-white w-full"
						>
							<Link href={`/scripts/create/${id}`}>
								Create Script
								<ArrowRight className="w-4 h-4 ml-2" />
							</Link>
						</Button>
					</div>
				)}
			</div>
			
			{tokensToSubtract > totalTokens && (
				<div className="text-sm text-muted-foreground">
					<p>You don&apos;t have enough tokens to continue.</p>
				</div>
			)}

			{tokensToSubtract <= totalTokens && (
				<div className="text-sm text-muted-foreground">
					<p>You have {totalTokens} tokens left.</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="fixed bottom-2 w-full max-w-sm  rounded-3xl backdrop-blur">
				{isLoading && (
					<button
						onClick={stop}
						className="w-full mb-2 p-2 text-sm border-gray-200 text-red-500 hover:text-red-600 hover:border-red-600 border duration-300 bg-zinc-100 dark:bg-zinc-800 rounded-3xl"
						type="button"
					>
						<CirclePause className='inline-block mr-2' size={20} />
						Stop generating
					</button>
				)}
				<div className='flex items-start gap-x-1.5 p-2 border border-zinc-300 dark:border-zinc-800 rounded-3xl shadow-xl bg-card z-50'>
					<div className="flex-1 relative">
						<Textarea
							rows={1}
							className={`w-full h-full rounded-2xl p-4 border bg-transparent focus-visible:outline-none focus-visible:ring-border resize-none duration-200 overflow-y-auto
								scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent hover:scrollbar-thumb-zinc-500 dark:hover:scrollbar-thumb-zinc-500
								${isLoading ? 'cursor-not-allowed' : ''}`}
							value={input}
							placeholder={isLoading ? "Assistant is thinking..." : "Chat with the assistant..."}
							onChange={(e) => {
								handleInputChange(e);
								handleInputWithResize(e);
							}}
							onKeyDown={handleKeyDown}
							disabled={isLoading}
							aria-disabled={isLoading}
							style={{ 
								minHeight: '44px', 
								maxHeight: '200px',
								scrollbarWidth: 'thin',
								scrollbarColor: 'rgb(161 161 170) transparent'
							}}
						/>
					</div>
				</div>
			</form>
		</section>
	);
}

export default IdeaChatPage;