'use client'

import { Button } from "@/components/ui/button"
import { useChat } from 'ai/react';
import { Brain, CirclePause, Send, User, Save, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { IdeaData, ProfileData } from '@/types/types';
import { 
  checkMessageForSave, 
  saveIdea, 
  deleteIdea, 
  fetchIdeaData, 
  fetchUserProfile 
} from '@/app/actions';
import { parseTags } from '@/utils/supabase/utils';
import { get_encoding } from 'tiktoken';
import rehypeRaw from 'rehype-raw';

const encoding = get_encoding('cl100k_base');

const IdeaChatPage = ({ params }: { params: { id: string } }) => {
	const { id } = params;
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [ideaData, setIdeaData] = useState<IdeaData | null>(null);
  const [canSave, setCanSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedIdeaId, setSavedIdeaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasEnoughTokens, setHasEnoughTokens] = useState(false);
  
	const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
		body: {
			profile,
			ideaData,
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
		onFinish: async (message) => {
			const aiTokens = encoding.encode(message.content).length;
      if (
        message.role === 'assistant' &&
        profile &&
        typeof profile.tokens_available === 'number'
      ) {
        if (aiTokens > profile.tokens_available) {
          toast({
            title: "Token limit exceeded",
            description: `La risposta dell'assistente richiede ${aiTokens} token, ma ne hai solo ${profile.tokens_available}.`,
            variant: "destructive"
          });
          return false;
        } else {
          // Aggiorna i token disponibili lato server
          fetch('/api/tokens/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profile.auth_user_id , tokensToSubtract: aiTokens }),
          }).then(res => res.json()).then(res => {
            if (!res.success) {
              toast({ title: 'Errore update token', description: res.error, variant: 'destructive' });
            }
          });
          setProfile({ ...profile, tokens_available: profile.tokens_available - aiTokens });
        }
      }
		}
	})

	// Debug logging for messages and canSave state
	useEffect(() => {
		console.log('Current messages:', messages);
		console.log('Can save state:', canSave);
	}, [messages, canSave]);

	useEffect(() => {
		if (profile && typeof profile.tokens_available === 'number') {
			setHasEnoughTokens(profile.tokens_available > 0);
		}
	}, [profile]);

	const handleSaveIdea = async () => {
    console.log('Save attempt - Token status:', {
      isSaving,
      hasIdeaData: !!ideaData,
      hasEnoughTokens,
      tokens: profile?.tokens_available
    });

    if (isSaving || !ideaData) return;
    
    // Remove the token check here since we're already showing the warning
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

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleBack = async () => {
    try {
      const result = await deleteIdea(id);
      
      if (result.success) {
        // Reindirizza alla pagina precedente
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


	useEffect(() => {
    if (!id) {
      setError('No idea ID provided');
      return;
    }

    async function loadData() {
      // Fetch idea data
      const ideaResult = await fetchIdeaData(id);
      if (ideaResult.error) {
        setError(ideaResult.error);
        toast({
          title: "Error",
          description: "Failed to load idea data",
          variant: "destructive"
        });
        return;
      }
      setIdeaData(ideaResult.data);

      // Fetch user profile
      const profileResult = await fetchUserProfile();
      if (profileResult.error) {
        setError(profileResult.error);
        return;
      }
      setProfile(profileResult.data);
    }

    loadData();
  }, [id, toast]);

	// Show error state if there's an error
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<Card className="p-6 max-w-md w-full">
					<h2 className="text-xl font-semibold mb-4">Error Loading Data</h2>
					<p className="text-red-500 mb-4">{error}</p>
					<Button onClick={() => router.push('/ideas/new')}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Go Back
					</Button>
				</Card>
			</div>
		);
	}
	
	// Show loading state with debug info
	if (!profile || !ideaData) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-4">
				<div className="animate-spin">
					<Loader2 className="w-8 h-8" />
				</div>
				<p className="text-sm text-muted-foreground">
					Loading data...
				</p>
			</div>
		);
	}

	// Type assertion since we've checked for null
	const idea = ideaData as IdeaData;

	const tags = parseTags(idea.tags || []);

	return (
    <div className="flex flex-col w-full max-w-sm mx-auto py-24">
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
            const tokenCount = encoding.encode(m.content).length;
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
              <Button 
                asChild
                className="bg-primary hover:bg-primary/80 text-white w-full"
              >
                <Link href="/scripts">
                  Create Script
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-2 w-full max-w-sm mb-8 rounded-xl backdrop-blur ">
        {isLoading && (
          <button
            onClick={stop}
            className="w-full mb-2 p-2 text-sm text-red-500 hover:text-red-600 hover:border-red-600 border border-transparent duration-300 bg-zinc-100 dark:bg-zinc-800 rounded"
            type="button"
          >
            <CirclePause className='inline-block mr-2' size={20} />
            Stop generating
          </button>
        )}
        <div className='flex items-start gap-x-1.5 p-2 border border-zinc-300 dark:border-zinc-800 rounded-xl shadow-xl bg-card z-50 overflow-hidden'>
          <textarea
            rows={1}
            className={`w-full p-2 border border-zinc-300 dark:border-zinc-800 rounded-lg bg-input resize-none overflow-hidden
              ${isLoading ? 'cursor-not-allowed' : ''}`}
            value={input}
            placeholder={isLoading ? "Assistant is thinking..." : "Chat with the assistant..."}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-disabled={isLoading}
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
          <Button type='submit' variant='outline' disabled={isLoading}>
            <Send className="mr-2" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

export default IdeaChatPage;