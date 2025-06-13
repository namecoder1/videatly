'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

interface GoogleTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number;
  provider_token?: string | null;
  provider_refresh_token?: string | null;
}

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleTokens, setGoogleTokens] = useState<GoogleTokens | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.provider_token) {
        setGoogleTokens({
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token,
          expires_at: session.expires_at,
          provider_token: session.provider_token,
          provider_refresh_token: session.provider_refresh_token,
        });
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session?.provider_token) {
        setGoogleTokens({
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token,
          expires_at: session.expires_at,
          provider_token: session.provider_token,
          provider_refresh_token: session.provider_refresh_token,
        });
      } else {
        setGoogleTokens(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading, googleTokens };
} 