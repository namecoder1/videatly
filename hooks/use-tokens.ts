import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Token {
  tool: string
  base_tokens: number
  paid_tokens: number
}

interface TokenState {
  tokens: Token[]
  setTokens: (tokens: Token[]) => void
  updateTokens: (tool: string, newBaseTokens: number) => void
}

export const useTokens = create<TokenState>()(
  persist(
    (set, get) => ({
      tokens: [],
      setTokens: (tokens) => {
        set({ tokens })
      },
      updateTokens: (tool, newBaseTokens) => {
        const currentState = get()
        set((state) => ({
          tokens: state.tokens.map(t => 
            t.tool === tool 
              ? { ...t, base_tokens: newBaseTokens }
              : t
          )
        }))
      }
    }),
    {
      name: 'tokens-storage',
      onRehydrateStorage: (state) => {
        console.log('Rehydrating Zustand')
      }
    }
  )
) 