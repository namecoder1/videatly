'use client'

import { Button } from "@/components/ui/button"
import { useDictionary } from "@/app/context/dictionary-context";
import { useChat } from 'ai/react';
import { Brain, CirclePause, User as UserIcon, Save, Loader2, ArrowRight, ArrowLeft, LetterText, Paintbrush, Film, Clock4, Target, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getEnumTranslation } from "@/utils/enum-translations";
import TokensChat from "@/components/blocks/(protected)/tokens-chat";
import Image from "next/image";
import { User } from "@supabase/supabase-js";


const IdeaChatPage = ({ params }: { params: { id: string } }) => {
	const { id } = params;
	const dict = useDictionary()
	const router = useRouter();
	const { toast } = useToast();
	const supabase = createClient()
	const { tokens, updateTokens: updateGlobalTokens } = useTokens()

	const [user, setUser] = useState<User | null>(null);
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
		api: '/api/openai/idea-chat',
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
				content: ideaData && profile?.spoken_language === 'it' ? 
					`Ciao, ${profile?.name}. Ho visto che vuoi creare un video con queste caratteristiche.
					Hai gia in mente un video o vuoi che ti aiuti a sviluppare un'idea?` : profile?.spoken_language === 'en' ?
					`Hello, ${profile?.name}. I've seen that you want to create a video with these characteristics.
					Do you already have an idea in mind or do you want me to help you develop an idea?` : profile?.spoken_language === 'es' ?
					`Hola, ${profile?.name}. He visto que quieres crear un video con estas características.
					¿Ya tienes una idea o quieres que te ayude a desarrollar una idea?` : profile?.spoken_language === 'fr' ?
					`Bonjour, ${profile?.name}. Je vois que vous voulez créer un vidéo avec ces caractéristiques.
					As-tu déjà une idée ou veux-tu que je t'aide à développer une idée?` :
					`Loading...`
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
					title: dict.ideaChatPage.toast.fetchError[0],
					description: dict.ideaChatPage.toast.fetchError[1],
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
	}, [id, toast, dict.ideaChatPage.toast.fetchError])

	useEffect(() => {
		const fetchUser = async () => {
			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (userError) {
				console.error('Error fetching user:', userError);
				return;
			}
			setUser(userData.user);
		}
		fetchUser();
	}, [supabase]);

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
					title: dict.ideaChatPage.toast.saveSuccess[0],
					description: dict.ideaChatPage.toast.saveSuccess[1],
					variant: "success"
				});
			} else {
				toast({
					title: dict.ideaChatPage.toast.saveError[0],
					description: dict.ideaChatPage.toast.saveError[1],
					variant: "destructive"
				});
			}
		} catch (error: any) {
			console.error('Error saving idea:', error);
			toast({
				title: dict.ideaChatPage.toast.saveError[0],
				description: dict.ideaChatPage.toast.saveError[1],
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
					title: dict.ideaChatPage.toast.deleteError[0],
					description: dict.ideaChatPage.toast.deleteError[1],
					variant: "destructive"
				});
			}
		} catch (error) {
			console.error('Error deleting idea:', error);
			toast({
				title: dict.ideaChatPage.toast.deleteError[0],
				description: dict.ideaChatPage.toast.deleteError[1],
				variant: "destructive"
			});
		}
	};

	if (error) return <ErrorMessage error={error} />
	
	if (!profile || !ideaData) return <Loader position='full' />

	const idea = ideaData as IdeaData;

	// Trova tutti i messaggi assistant validi
	const assistantIdeaMessages = messages
		.filter(m => m.role === 'assistant' && (
			(m.content.includes('**📝 Title**') && m.content.includes('**📋 Description**')) || // English
			(m.content.includes('**📝 Titolo**') && m.content.includes('**📋 Descrizione**')) || // Italian
			(m.content.includes('**📝 Título**') && m.content.includes('**📋 Descripción**')) || // Spanish
			(m.content.includes('**📝 Titre**') && m.content.includes('**📋 Description**')) // French
		))
		.map(m => m.content);
	const combinedIdeaContent = assistantIdeaMessages.join('\n\n');

	return (
		<section className="flex flex-col w-full max-w-4xl items-center mx-auto py-24">
			<div className="pb-[120px] space-y-6">
				<Button 
					onClick={handleBack}
					variant="outline"
					className="flex items-center gap-2"
				>
					<ArrowLeft className="w-4 h-4" />
					{dict.ideaChatPage.chat.back}
				</Button>

				<IdeaInfo idea={idea} profile={profile} dict={dict} />
				
				{messages.map(m => {
					const isIdeaComplete = m.role === 'assistant' && (
						(m.content.includes('**📝 Title**') && m.content.includes('**📋 Description**')) || // English
						(m.content.includes('**📝 Titolo**') && m.content.includes('**📋 Descrizione**')) || // Italian
						(m.content.includes('**📝 Título**') && m.content.includes('**📋 Descripción**')) || // Spanish
						(m.content.includes('**📝 Titre**') && m.content.includes('**📋 Description**')) // French
					);
					if (isIdeaComplete) {
						return <IdeaSectionsCard key={m.id} content={m.content} />;
					}
					const tokenCount = encode(m.content).length;
					return (
						<div key={m.id} className={`flex items-start gap-x-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
							<div className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-300 dark:border-zinc-600">
								{m.role === 'user' ? (
									<Image src={user?.user_metadata.avatar_url} alt="User" className="rounded-full" width={32} height={32} />
								) : (
									<Brain className='w-4 h-4 text-indigo-500' />
								)}
							</div>
							<div>
								<div className={`flex-1 space-y-2 bg-white rounded-3xl w-fit overflow-hidden ${m.role === 'user' ? 'text-right' : ''}`}>
									<ReactMarkdown 
										components={{
											strong: ({node, ...props}) => <strong className="font-bold mb-2 text-lg text-primary mt-4" {...props} />, 
											p: ({node, ...props}) => <p className="border-2 boder-boder rounded-3xl px-4 py-2 text-gray-700 space-y-2 dark:text-gray-200 whitespace-pre-line" {...props} />
										}}
										rehypePlugins={[rehypeRaw]}
									>
										{m.content}
									</ReactMarkdown>
								</div>
								{m.role === 'assistant' && messages.length > 0 && (
									<div className="text-xs text-muted-foreground mt-1">
										{messages.findIndex(msg => msg.id === m.id) > 0 && `${dict.ideaChatPage.tokens.tokenOutput}: ${tokenCount}`}
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
									{dict.ideaChatPage.chat.isSaving}
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									{dict.ideaChatPage.chat.save}
								</>
							)}
						</Button>
					</div>
				)}

				{savedIdeaId && (
					<div className="w-full flex gap-2">
						<Button variant='black' className="text-white w-full" asChild>
							<Link href={`/ideas/${id}`}>
								<ArrowLeft className="w-4 h-4 ml-2" />
								{dict.ideaChatPage.chat.viewIdea}
							</Link>
						</Button>
						<Button 
							asChild
							variant='outline'
							className="w-full"
						>
							<Link href={`/scripts/create/${id}`}>
								{dict.ideaChatPage.chat.createScript}
								<ArrowRight className="w-4 h-4 ml-2" />
							</Link>
						</Button>
					</div>
				)}
			</div>
			
			{tokensToSubtract > totalTokens && (
				<div className="text-sm text-muted-foreground">
					<p>{dict.ideaChatPage.chat.noTokens}</p>
				</div>
			)}

			{tokensToSubtract <= totalTokens && (
        <TokensChat slot1={dict.ideaChatPage.tokens.tokensLeft1} tokens={totalTokens} slot2={dict.ideaChatPage.tokens.tokensLeft2} />
			)}

			<form onSubmit={handleSubmit} className="fixed bottom-2 w-full max-w-2xl mx-auto rounded-3xl backdrop-blur">
				{isLoading && (
					<button
						onClick={stop}
						className="w-full mb-2 p-2 text-sm border-gray-200 text-red-500 hover:text-red-600 hover:border-red-600 border duration-300 bg-zinc-100 dark:bg-zinc-800 rounded-3xl"
						type="button"
					>
						<CirclePause className='inline-block mr-2' size={20} />
						{dict.ideaChatPage.chat.stop}
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
							placeholder={isLoading ? dict.ideaChatPage.chat.placeholder2 : dict.ideaChatPage.chat.placeholder1}
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

const IdeaInfo = ({ idea, profile, dict }: { idea: IdeaData, profile: ProfileData, dict: any }) => {
	const { description, video_style, video_type, video_length, video_target } = idea;
	const locale = profile.spoken_language || 'en';
	const tags = parseTags(idea.tags || []);
	
	return (
		<Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 w-full">
			<CardHeader className="space-y-4">
				<CardTitle>
					<h3 className="text-xl font-semibold flex items-center gap-2">
						<Film className="w-5 h-5 text-primary" />
						{dict?.ideaChatPage?.info?.title || "Video Details"}
					</h3>
				</CardTitle>
				<CardDescription className="text-sm">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<IdeaInfoItem 
							label={dict?.ideaCreatePage?.form?.suggestions || "Description"}
							value={description} 
							icon={<LetterText size={16} />} 
							color="bg-red-500/10 text-red-500"
						/>
						<IdeaInfoItem 
							label={dict?.ideaCreatePage?.form?.keywords || "Tags"}
							value={tags.join(', ')} 
							icon={<Tag size={16} />}
							color="bg-blue-500/10 text-blue-500"
						/>
						<IdeaInfoItem 
							label={dict?.ideaCreatePage?.form?.contentStyle || "Video Style"}
							value={getEnumTranslation(video_style, locale)} 
							icon={<Paintbrush size={16} />}
							color="bg-green-500/10 text-green-500"
						/>
						<IdeaInfoItem 
							label={dict?.ideaCreatePage?.form?.videoType || "Video Type"}
							value={getEnumTranslation(video_type, locale)} 
							icon={<Film size={16} />}
							color="bg-purple-500/10 text-purple-500"
						/>
						<IdeaInfoItem 
							label={dict?.ideaCreatePage?.form?.videoLength || "Video Length"}
							value={getEnumTranslation(video_length, locale)} 
							icon={<Clock4 size={16} />}
							color="bg-orange-500/10 text-orange-500"
						/>
						<IdeaInfoItem 
							label={dict?.ideaCreatePage?.form?.targetInterest || "Video Target"}
							value={getEnumTranslation(video_target, locale)} 
							icon={<Target size={16} />}
							color="bg-yellow-500/10 text-yellow-500"
						/>

					</div>
				</CardDescription>
			</CardHeader>
		</Card>
	)
}

const IdeaInfoItem = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => {
	return (
		<div className="flex flex-col space-y-1.5 rounded-3xl p-3 bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-colors duration-200">
			<div className="flex items-center gap-2">
				<span className={`rounded-xl p-2 ${color}`}>
					{icon}
				</span>
				<span className="font-semibold text-sm">{label}</span>
			</div>
			<p className="text-sm text-muted-foreground pl-10">
				{value}
			</p>
		</div>
	)
}

// Nuovo componente per mostrare l'idea completa
const IdeaSectionsCard = ({ content }: { content: string }) => {
  return (
    <div className="rounded-3xl border bg-gradient-to-tr from-zinc-50 to-zinc-100 px-6 py-4 dark:bg-zinc-900 shadow">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
					strong: ({node, ...props}) => <strong className="font-bold text-primary space-x-2" {...props} />,
          h4: ({node, ...props}) => <h4 className="font-bold text-primary mb-1 mt-1" {...props} />,
          p: ({node, ...props}) => <p className="last:mb-0 [&:not(:has(+ol))]:mb-6 mt-1  text-gray-700 dark:text-gray-200" {...props} />,
					ol: ({node, ...props}) => <ol className="space-y-1.5 list-decimal list-inside pb-6" {...props} />, // togli bullet e padding
          li: ({node, ...props}) => <li className="mb-0.5 mt-0.5 text-gray-700 dark:text-gray-200" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default IdeaChatPage;