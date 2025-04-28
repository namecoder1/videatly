'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { encodedRedirect } from '@/utils/supabase/utils'

export const signInWithGoogleAction = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`
    }
  });

  if (error) {
    return encodedRedirect("error", "/", error.message);
  }

  return redirect(data.url);
};

export async function logOut() {
	const supabase = await createClient()
	const { error } = await supabase.auth.signOut()

	if (error) {
		console.error(error)
	}

	redirect('/')
}

export async function deleteAccount() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('User error:', userError)
    throw new Error('User not found')
  }

  const { error: deleteError, data } = await supabase
    .from('users')
    .delete()
    .eq('auth_user_id', user.id)
    .select()

  if (deleteError) {
    console.error('Delete error:', deleteError)
    throw new Error(`Failed to delete user data: ${deleteError.message}`)
  }

  const { error: deleteAuthError } = await supabase.auth.signOut()

  if (deleteAuthError) {
    console.error('Sign out error:', deleteAuthError)
    throw new Error(`Failed to sign out: ${deleteAuthError.message}`)
  }

  return redirect('/')
}

export const signInWithCustomRedirect = async (redirectPath: string) => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}${redirectPath}`
    }
  });

  if (error) {
    return encodedRedirect("error", "/", error.message);
  }

  // Se vuoi ignorare data.url e reindirizzare sempre al percorso specificato
  return redirect(redirectPath);
};

