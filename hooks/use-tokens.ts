import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Channel name for token updates
const TOKEN_CHANNEL = 'token-updates';

interface Token {
  tool: string
  base_tokens: number
  paid_tokens: number
}

interface TokenState {
  tokens: Token[]
  setTokens: (tokens: Token[]) => void
  updateTokens: (tool: string, newBaseTokens: number, newPaidTokens: number) => void
}

// Create a broadcast channel for token updates
const tokenChannel = typeof window !== 'undefined' ? new BroadcastChannel(TOKEN_CHANNEL) : null;

// Flag to track if the update is from a broadcast
let isBroadcasting = false;

export const useTokens = create<TokenState>()(
  persist(
    (set, get) => ({
      tokens: [],
      setTokens: (tokens) => {

        set({ tokens });
        // Only broadcast if this is not a broadcast update
        if (tokenChannel && !isBroadcasting) {
          isBroadcasting = true;
          tokenChannel.postMessage({ type: 'TOKENS_UPDATED', tokens });
          // Reset the flag after a short delay
          setTimeout(() => {
            isBroadcasting = false;
          }, 100);
        }
      },
      updateTokens: (tool, newBaseTokens, newPaidTokens) => {
        set((state) => {
          const newTokens = state.tokens.map(t => 
            t.tool === tool 
              ? { ...t, base_tokens: newBaseTokens, paid_tokens: newPaidTokens }
              : t
          );
          console.log('New tokens state:', newTokens);
          // Only broadcast if this is not a broadcast update
          if (tokenChannel && !isBroadcasting) {
            isBroadcasting = true;
            tokenChannel.postMessage({ type: 'TOKENS_UPDATED', tokens: newTokens });
            // Reset the flag after a short delay
            setTimeout(() => {
              isBroadcasting = false;
            }, 100);
          }
          return { tokens: newTokens };
        });
      }
    }),
    {
      name: 'tokens-storage',
      onRehydrateStorage: (state) => {
        console.log('Rehydrating Zustand state:', state);
      }
    }
  )
)

// Funzione per inizializzare il listener dei token
export const initializeTokenListener = () => {
  if (!tokenChannel) return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'TOKENS_UPDATED') {
      console.log('Received token update:', event.data.tokens);
      const store = useTokens.getState();
      // Only update if the tokens are different
      const currentTokens = store.tokens;
      const newTokens = event.data.tokens;
      
      const hasChanged = currentTokens.some((current, index) => {
        const next = newTokens[index];
        return current.base_tokens !== next.base_tokens || 
               current.paid_tokens !== next.paid_tokens;
      });

      if (hasChanged) {
        store.setTokens(newTokens);
      }
    }
  };

  tokenChannel.addEventListener('message', handleMessage);

  return () => {
    tokenChannel.removeEventListener('message', handleMessage);
  };
}; 