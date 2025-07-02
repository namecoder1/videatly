import { create } from "zustand";
import { persist } from "zustand/middleware";

// Channel name for token updates
const TOKEN_CHANNEL = "token-updates";

interface Token {
  tool: string;
  base_tokens: number;
  paid_tokens: number;
}

interface TokenState {
  tokens: Token[];
  setTokens: (tokens: Token[]) => void;
  updateTokens: (
    tool: string,
    newBaseTokens: number,
    newPaidTokens: number
  ) => void;
}

// Create a broadcast channel for token updates
const tokenChannel =
  typeof window !== "undefined" ? new BroadcastChannel(TOKEN_CHANNEL) : null;

// Flag to track if the update is from a broadcast - use a more reliable approach
let isBroadcasting = false;
let isListenerInitialized = false;

export const useTokens = create<TokenState>()(
  persist(
    (set, get) => ({
      tokens: [],
      setTokens: (tokens) => {
        set({ tokens });
        // Only broadcast if this is not a broadcast update and we're not already broadcasting
        if (tokenChannel && !isBroadcasting) {
          isBroadcasting = true;
          tokenChannel.postMessage({ type: "TOKENS_UPDATED", tokens });
          // Reset the flag immediately in the next tick to avoid race conditions
          Promise.resolve().then(() => {
            isBroadcasting = false;
          });
        }
      },
      updateTokens: (tool, newBaseTokens, newPaidTokens) => {
        set((state) => {
          const newTokens = state.tokens.map((t) =>
            t.tool === tool
              ? { ...t, base_tokens: newBaseTokens, paid_tokens: newPaidTokens }
              : t
          );
          console.log("New tokens state:", newTokens);
          // Only broadcast if this is not a broadcast update and we're not already broadcasting
          if (tokenChannel && !isBroadcasting) {
            isBroadcasting = true;
            tokenChannel.postMessage({
              type: "TOKENS_UPDATED",
              tokens: newTokens,
            });
            // Reset the flag immediately in the next tick to avoid race conditions
            Promise.resolve().then(() => {
              isBroadcasting = false;
            });
          }
          return { tokens: newTokens };
        });
      },
    }),
    {
      name: "tokens-storage",
      onRehydrateStorage: (state) => {
        console.log("Rehydrating Zustand state:", state);
      },
    }
  )
);

// Function to compare two token arrays safely
const areTokenArraysEqual = (arr1: Token[], arr2: Token[]): boolean => {
  if (arr1.length !== arr2.length) return false;

  return arr1.every((token1, index) => {
    const token2 = arr2[index];
    return (
      token1 &&
      token2 &&
      token1.tool === token2.tool &&
      token1.base_tokens === token2.base_tokens &&
      token1.paid_tokens === token2.paid_tokens
    );
  });
};

// Function to initialize the listener - prevent multiple initializations
export const initializeTokenListener = () => {
  if (!tokenChannel || isListenerInitialized) {
    return () => {}; // Return empty cleanup function if already initialized or no channel
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === "TOKENS_UPDATED" && !isBroadcasting) {
      console.log("Received token update:", event.data.tokens);
      const store = useTokens.getState();
      const currentTokens = store.tokens;
      const newTokens = event.data.tokens;

      // Use safer comparison to check if tokens have changed
      if (!areTokenArraysEqual(currentTokens, newTokens)) {
        // Set the broadcasting flag before updating to prevent echo
        isBroadcasting = true;
        store.setTokens(newTokens);
        // Reset the flag immediately in the next tick
        Promise.resolve().then(() => {
          isBroadcasting = false;
        });
      }
    }
  };

  tokenChannel.addEventListener("message", handleMessage);
  isListenerInitialized = true;

  return () => {
    if (tokenChannel) {
      tokenChannel.removeEventListener("message", handleMessage);
      isListenerInitialized = false;
    }
  };
};
