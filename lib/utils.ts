import { toast } from "@/hooks/use-toast"
import { ProfileData, Token } from "@/types/types"
import { SupabaseClient } from "@supabase/supabase-js"
import { clsx, type ClassValue } from "clsx"
import { format, Locale } from "date-fns"
import { enUS, es, fr, it } from 'date-fns/locale'
import { encode } from "gpt-tokenizer/model/gpt-3.5-turbo-0125"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ------------------------------------------------------------------------------------------------
// DATE FORMATTING

// Map of supported locales
const localeMap: Record<string, Locale> = {
  'en-US': enUS,
  'es': es,
  'fr': fr,
  'it': it,
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDateWithLocale(
  date: string | Date,
  dateCase: 'normal' | 'full' | 'short',
  locale: string = 'en-US'
) {
  const d = new Date(date);
  const dateLocale = localeMap[locale] || enUS;

  let formatted = '';

  if (dateCase === 'normal') {
    formatted = format(d, 'MMMM d, yyyy', { locale: dateLocale });
  } else if (dateCase === 'full') {
    formatted = format(d, 'MMMM d, yyyy HH:mm', { locale: dateLocale });
  } else if (dateCase === 'short') {
    formatted = format(d, 'EEE', { locale: dateLocale });
  }

  return capitalizeFirstLetter(formatted);
}


export function formatDate(date: string | Date, dateCase: 'normal' | 'full') {
  const d = new Date(date)
  if (dateCase === 'normal') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
    })
  } else if (dateCase === 'full') {
    return d.toLocaleTimeString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }
}

export const formatStringDate = (date: string) => {
  if (!date) return new Date()
  
  const [time, timezone] = date.split('+')
  const [hours, minutes] = time.split(':').map(Number)
  
  const today = new Date()
  today.setHours(hours)
  today.setMinutes(minutes)
  today.setSeconds(0)
  today.setMilliseconds(0)

  if (timezone) {
    const timezoneOffset = parseInt(timezone) * 60 * 60 * 1000 // Convert to milliseconds
    return new Date(today.getTime() - timezoneOffset)
  }

  return today
}

// ------------------------------------------------------------------------------------------------
// CHAT FUNCTIONS

export const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      // Permetti il newline con shift+enter
      return;
    }
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (form) {
      form.requestSubmit();
    }
  }
};

export const handleScrollToElement = (e: React.MouseEvent<HTMLAnchorElement>, elementId: string) => {
  e.preventDefault()
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    })
  }
}


const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const textarea = e.target;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

export const handleInputWithResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  autoResize(e);
  return e;
};

// ------------------------------------------------------------------------------------------------
// TOKENS FUNCTIONS

export const updateIdeaTokens = async (
  messageContent: string, 
  setTokensToSubtract: (tokens: number) => void, 
  tokens: Token[], 
  supabase: SupabaseClient<any, "public", any>,
  setBaseTokens: (tokens: number) => void, 
  setTotalTokens: (tokens: number) => void, 
  updateGlobalTokens: (tool: string, 
  baseTokens: number, paidTokens: number) => void
) => {
  const tokenCount = encode(messageContent).length
  setTokensToSubtract(tokenCount)

  const ideasTokens = tokens.find(t => t.tool === 'ideas')
  if (!ideasTokens) {
    toast({
      title: "Error",
      description: "No tokens found for ideas",
      variant: "destructive"
    })
    return
  }

  const totalAvailableTokens = ideasTokens.base_tokens + ideasTokens.paid_tokens
  if (tokenCount > totalAvailableTokens) {
    toast({
      title: "Error",
      description: "Not enough tokens available",
      variant: "destructive"
    })
    return
  }

  let newBaseTokens = ideasTokens.base_tokens
  let newPaidTokens = ideasTokens.paid_tokens

  if (tokenCount <= ideasTokens.base_tokens) {
    newBaseTokens = ideasTokens.base_tokens - tokenCount
  } else {
    const remainingTokens = tokenCount - ideasTokens.base_tokens
    newBaseTokens = 0
    newPaidTokens = ideasTokens.paid_tokens - remainingTokens
  }
  
  const { data, error } = await supabase.from('tokens').update({
    base_tokens: newBaseTokens,
    paid_tokens: newPaidTokens
  }).eq('tool', 'ideas')
  
  if (error) {
    console.error('Error updating tokens:', error)
    toast({
      title: "Error",
      description: "Failed to update tokens",
      variant: "destructive"
    })
  } else {
    toast({
      title: "Success",
      description: `Tokens updated successfully! You used ${tokenCount} tokens.`,
      variant: "success"
    })
    setBaseTokens(newBaseTokens)
    setTotalTokens(newBaseTokens + newPaidTokens)
    
    // Update the global state with the new token values
    updateGlobalTokens('ideas', newBaseTokens, newPaidTokens)
  }
}

export const updateScriptTokens = async (
  messageContent: string, 
  setTokensToSubtract: (tokens: number) => void, 
  tokens: Token[], 
  supabase: SupabaseClient<any, "public", any>,
  setBaseTokens: (tokens: number) => void, 
  setTotalTokens: (tokens: number) => void, 
  updateGlobalTokens: (tool: string, 
  baseTokens: number, paidTokens: number) => void
) => {
  const tokenCount = encode(messageContent).length
  setTokensToSubtract(tokenCount)

  const scriptsTokens = tokens.find(t => t.tool === 'scripts')
  if (!scriptsTokens) {
    toast({
      title: "Error",
      description: "No tokens found for scripts",
      variant: "destructive"
    })
    return
  }

  const totalAvailableTokens = scriptsTokens.base_tokens + scriptsTokens.paid_tokens
  if (tokenCount > totalAvailableTokens) {
    toast({
      title: "Error",
      description: "Not enough tokens available",
      variant: "destructive"
    })
    return
  }

  let newBaseTokens = scriptsTokens.base_tokens
  let newPaidTokens = scriptsTokens.paid_tokens

  if (tokenCount <= scriptsTokens.base_tokens) {
    newBaseTokens = scriptsTokens.base_tokens - tokenCount
  } else {
    const remainingTokens = tokenCount - scriptsTokens.base_tokens
    newBaseTokens = 0
    newPaidTokens = scriptsTokens.paid_tokens - remainingTokens
  }
  
  const { data, error } = await supabase.from('tokens').update({
    base_tokens: newBaseTokens,
    paid_tokens: newPaidTokens
  }).eq('tool', 'scripts')
  
  if (error) {
    console.error('Error updating tokens:', error)
    toast({
      title: "Error",
      description: "Failed to update tokens",
      variant: "destructive"
    })
  } else {
    toast({
      title: "Success",
      description: `Tokens updated successfully! You used ${tokenCount} tokens.`,
      variant: "success"
    })
    setBaseTokens(newBaseTokens)
    setTotalTokens(newBaseTokens + newPaidTokens)
    updateGlobalTokens('scripts', newBaseTokens, newPaidTokens)
  }
}

// ---

// Test functions

export const handleTestExpiration = async ({ userData, setTestLoading, router }: { 
  userData: ProfileData | null, 
  setTestLoading: (value: React.SetStateAction<boolean>) => void, 
  router: AppRouterInstance 
}) => {
  if (!userData?.auth_user_id) return
  
  setTestLoading(true)
  try {
    const response = await fetch('/api/stripe/test/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`
      },
      body: JSON.stringify({
        userId: userData.auth_user_id
      })
    })
    
    const result = await response.json()
    if (result.error) {
      throw new Error(result.error)
    }
    
    // Ricarica i dati dell'utente
    router.refresh()
  } catch (err: any) {
    console.error('Test error:', err)
  } finally {
    setTestLoading(false)
  }
}

// ---

// Subscription Functions

export const getPlanLabel = (plan: string) => {
  if (plan === 'pro') return 'Pro';
  if (plan === 'ultra') return 'Ultra';
  if (plan === 'free') return 'Free';
  return plan;
}

// --- 

// Calculate Functions

export const calculateSubscriptionProgress = ({ userData} : {
  userData: ProfileData | null
}) => {
  if (!userData?.subscription_end) {
    console.log('No subscription end date found');
    return 0;
  }
  
  const endDate = new Date(userData.subscription_end);
  const now = new Date();
  
  // Per test: aggiungiamo un giorno alla data corrente
  const date = new Date(now);
  
  console.log('Subscription end date:', endDate);
  console.log('Current date:', now);
  console.log('Test date (tomorrow):', date);
  
  // Se la data di fine è nel passato, mostra 100%
  if (endDate < now) {
    console.log('End date is in the past');
    return 100;
  }

  // Usa la data di inizio effettiva dell'abbonamento
  const startDateStr = userData.subscription_start || userData.created_at;
  if (!startDateStr) {
    console.log('No start date found');
    return 0;
  }
  
  const startDate = new Date(startDateStr);
  console.log('Actual start date:', startDate);
  
  // Se la data di inizio è nel futuro, mostra 0%
  if (startDate > now) {
    console.log('Start date is in the future');
    return 0;
  }
  
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  // Usa testDate invece di now per simulare il giorno successivo
  const daysPassed = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log('Days passed:', daysPassed);
  console.log('Total days:', totalDays);
  
  const progress = Math.min(Math.round((daysPassed / totalDays) * 100), 100);
  console.log('Calculated progress:', progress);
  
  return progress;
};