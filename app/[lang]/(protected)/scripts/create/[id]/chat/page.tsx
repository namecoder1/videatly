'use client'


import { User, CirclePause, ArrowLeft, Loader2, Save, ArrowRight, Brain, LetterText, Target, Clock4, Paintbrush, Film } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useTokens, initializeTokenListener } from '@/hooks/use-tokens'
import { useChat } from '@ai-sdk/react'
import { ScriptData } from '@/types/types'
import { ProfileData } from '@/types/types'
import { encode } from 'gpt-tokenizer/model/gpt-3.5-turbo-0125'
import rehypeRaw from 'rehype-raw'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { deleteScript, fetchScriptData, fetchUserProfile } from '@/app/actions'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { updateScriptTokens } from '@/lib/utils'
import { handleKeyDown, handleInputWithResize } from '@/lib/utils'
import Loader from '@/components/blocks/loader'
import ErrorMessage from '@/components/blocks/(protected)/error-message'
import { Textarea } from '@/components/ui/textarea'

const ScriptsPage = ({ params }: { params: { id: string } }) => {
	const { id } = params;
  const supabase = createClient()
  const router = useRouter();
	const { toast } = useToast();
	const { tokens, updateTokens: updateGlobalTokens } = useTokens()
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [baseTokens, setBaseTokens] = useState(0)
  const [totalTokens, setTotalTokens] = useState(0)
  const [tokensToSubtract, setTokensToSubtract] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false)
  const [canSave, setCanSave] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedScriptId, setSavedScriptId] = useState<string | null>(null)

	useEffect(() => {
		// Set initial token values from Zustand store
		const scriptsTokens = tokens.find(t => t.tool === 'scripts')
		if (scriptsTokens) {
			setBaseTokens(scriptsTokens.base_tokens)
			setTotalTokens(scriptsTokens.base_tokens + scriptsTokens.paid_tokens)
		}

		// Initialize real-time token listener
		const cleanup = initializeTokenListener();
		return () => {
			cleanup();
		};
	}, [tokens])

  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, stop } = useChat({
    api: '/api/script-chat',
    body: {
      profile,
      scriptData,
    },
    onFinish: async (message) => {
      if (message.role === 'assistant') {
        await updateScriptTokens(message.content, setTokensToSubtract, tokens, supabase, setBaseTokens, setTotalTokens, updateGlobalTokens)
        // Check if this is a script message (not the initial greeting)
        const isScriptMessage = message.id !== 'init' && message.content.length > 50;
        setCanSave(isScriptMessage);
      }
    },
    initialMessages: [
      {
        id: 'init',
        role: 'assistant',
        content: scriptData ? 
          `Ciao, ${profile?.name}. Creiamo lo script per questo video. Hai gia in mente una scaletta?` : 
          'Caricamento...'
      }
    ],
  });

	useEffect(() => {
		if (profile && typeof profile.tokens_available === 'number') {
			setHasEnoughTokens(profile.tokens_available > 0)
		}
	}, [profile])

	useEffect(() => {
		if (!id) {
			setError('No script ID provided')
			return
		}

		const loadData = async () => {
			const scriptResult = await fetchScriptData(id)
			if (scriptResult.error) {
				setError(scriptResult.error)
				toast({
					title: "Error",
					description: "Failed to load script data",
					variant: "destructive"
				})
				return
			}
			setScriptData(scriptResult.data)

			const profileResult = await fetchUserProfile()
			if (profileResult.error) {
				setError(profileResult.error)
				return
			}
			setProfile(profileResult.data)
		}

		loadData()
	}, [id, toast])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    originalHandleSubmit(e);
  };

  const handleBack = async () => {
		try {
			const result = await deleteScript(Number(id));
			
			if (result.success) {
				router.back();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to delete the script",
					variant: "destructive"
				});
			}
		} catch (error) {
			console.error('Error deleting script:', error);
			toast({
				title: "Error",
				description: "Failed to delete the script",
				variant: "destructive"
			});
		}
	};

  const handleSave = async () => {
    if (isSaving || !scriptData) return;
    
    setIsSaving(true);
    try {
      // Find the last assistant message that contains the script
      const lastAssistantMessage = messages
        .slice()
        .reverse()
        .find((m: any) => m.role === 'assistant' && m.id !== 'init');

      if (!lastAssistantMessage) {
        toast({
          title: "Error",
          description: "No script content found to save",
          variant: "destructive"
        });
        return;
      }

      // First, remove the script-complete marker
      const content = lastAssistantMessage.content
        .replace(/<data value="script-complete" hidden><\/data>/g, '')
        .trim();

      // If the content is empty after removing the marker, don't save
      if (!content) {
        toast({
          title: "Error",
          description: "No valid script content found to save",
          variant: "destructive"
        });
        return;
      }

      // Split content into sections based on timestamps
      const sections = content.split(/\n\n(?=\[\d{2}:\d{2}\]–\[\d{2}:\d{2}\])/);
      
      // Create structured content
      const structuredContent = sections.map(section => {
        const [timestamp, ...points] = section.split('\n');
        const [startTime, endTime] = timestamp.match(/\[(\d{2}:\d{2})\]–\[(\d{2}:\d{2})\]/)?.slice(1) || ['00:00', '00:00'];
        
        return {
          startTime,
          endTime,
          points: points.map(point => point.replace(/^-\s*/, '').trim())
        };
      });

      // Update the script content in Supabase
      const { error } = await supabase
        .from('scripts')
        .update({
          content: structuredContent
        })
        .eq('id', id)
        .select('*');

      if (error) {
        throw error;
      }

      setSavedScriptId(id);
      setCanSave(false);
      
      toast({
        title: "Success",
        description: "Script saved successfully!",
        variant: "success"
      });
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Error",
        description: "Failed to save the script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

	if (error) return <ErrorMessage error={error} />

	if (!profile || !scriptData) return <Loader position='full' />

	return (
		<section className="flex flex-col w-full max-w-4xl items-center mx-auto py-24">
			<div className="pb-[120px] space-y-6">
				<Button 
					onClick={handleBack}
					variant="outline"
					className="flex items-center gap-2"
				>
					<ArrowLeft className="w-4 h-4" />
					Back
				</Button>

        <ScriptInfo scriptData={scriptData} />

        {messages.map(m => {
          const isScriptMessage = m.role === 'assistant' && m.content.includes('[00:00]');
          if (isScriptMessage) {
            return <ScriptSectionsCard key={m.id} content={m.content} />;
          }
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
										p: ({ children }) => <p className={`mb-2 bg-card w-fit py-2 px-4 rounded-3xl border border-zinc-200 ${m.role === 'user' ? 'ml-auto text-right' : 'mr-auto text-left'}`}>{children}</p>
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
          )
        })}

        {canSave && !savedScriptId && (
          <div className="w-full space-y-2">
            <Button 
              onClick={handleSave}
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
                  Save Script
                </>
              )}
            </Button>
          </div>
        )}

        {savedScriptId && (
          <div className="w-full flex gap-2">
            <Button 
              asChild
              variant='black'
              className="text-white w-full"
            >
              <Link href={`/scripts/${id}`}>
                View Script
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}

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

        <form onSubmit={handleSubmit} className="fixed bottom-2 w-full max-w-2xl mx-auto rounded-3xl backdrop-blur">
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

      </div>
		</section>
	)
}

const ScriptInfo = ({ scriptData }: { scriptData: ScriptData }) => {
  const { tone, verbosity, target_audience, script_type, duration, persona, structure } = scriptData;

  return (
    <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <CardHeader className="space-y-4">
        <CardTitle>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Script Details
          </h3>
        </CardTitle>
        <CardDescription className="text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ScriptInfoItem 
              label="Tone" 
              value={tone} 
              icon={<Brain size={16} />} 
              color="bg-red-500/10 text-red-500"
            />
            <ScriptInfoItem 
              label="Verbosity" 
              value={verbosity} 
              icon={<LetterText size={16} />}
              color="bg-blue-500/10 text-blue-500"
            />
            <ScriptInfoItem 
              label="Target Audience" 
              value={target_audience} 
              icon={<Target size={16} />}
              color="bg-green-500/10 text-green-500"
            />
            <ScriptInfoItem 
              label="Script Type" 
              value={script_type} 
              icon={<Film size={16} />}
              color="bg-purple-500/10 text-purple-500"
            />
            <ScriptInfoItem 
              label="Duration" 
              value={duration} 
              icon={<Clock4 size={16} />}
              color="bg-orange-500/10 text-orange-500"
            />
            <ScriptInfoItem 
              label="Persona" 
              value={persona} 
              icon={<User size={16} />}
              color="bg-yellow-500/10 text-yellow-500"
            />
            <ScriptInfoItem 
              label="Structure" 
              value={structure} 
              icon={<Paintbrush size={16} />}
              color="bg-indigo-500/10 text-indigo-500"
            />
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

const ScriptInfoItem = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => {
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

const ScriptSectionsCard = ({ content }: { content: string }) => {
  // Remove the script-complete marker
  const cleanContent = content.replace(/<data value="script-complete" hidden><\/data>/g, '').trim();
  
  // Split content into sections based on timestamps
  const sections = cleanContent.split(/\n\n(?=\[\d{2}:\d{2}\]–\[\d{2}:\d{2}\])/);
  
  return (
    <div className="rounded-xl border p-6 bg-white dark:bg-zinc-900 shadow space-y-4">
      {sections.map((section, index) => {
        const [timestamp, ...points] = section.split('\n');
        const [startTime, endTime] = timestamp.match(/\[(\d{2}:\d{2})\]–\[(\d{2}:\d{2})\]/)?.slice(1) || ['00:00', '00:00'];
        
        return (
          <div key={index} className="space-y-2">
            <h4 className="font-bold text-primary flex items-center gap-2">
              <Clock4 className="w-4 h-4" />
              {startTime} - {endTime}
            </h4>
            <div className="space-y-1">
              {points.map((point, pointIndex) => (
                <p key={pointIndex} className="text-gray-700 dark:text-gray-200">
                  {point.replace(/^-\s*/, '')}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScriptsPage