'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { encodedRedirect } from '@/utils/supabase/utils'
import { locales } from '@/middleware'

export const signInWithGoogleAction = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  
  // Get language from current URL
  const headersList = (await headers());
  const referer = headersList.get("referer") || "";
  const refererUrl = new URL(referer);
  const pathParts = refererUrl.pathname.split('/');
  const lang = pathParts.length > 1 && locales.includes(pathParts[1]) ? pathParts[1] : 'en';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?lang=${lang}`
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
	
	// Get current language from URL
	const headersList = headers();
	const referer = headersList.get("referer") || "";
	const refererUrl = new URL(referer);
	const pathParts = refererUrl.pathname.split('/');
	const lang = pathParts.length > 1 && locales.includes(pathParts[1]) ? pathParts[1] : 'en';
	
	if (error) {
		console.error(error)
	}

	redirect(`/${lang}`)
}

export async function deleteAccount() {
  const supabase = await createClient()
  
  // Get current language from URL
  const headersList = headers();
  const referer = headersList.get("referer") || "";
  const refererUrl = new URL(referer);
  const pathParts = refererUrl.pathname.split('/');
  const lang = pathParts.length > 1 && locales.includes(pathParts[1]) ? pathParts[1] : 'en';
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('User error:', userError)
    throw new Error('User not found')
  }

  const { error: deleteError } = await supabase
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

  return redirect(`/${lang}`)
}

export const signInWithCustomRedirect = async (redirectPath: string) => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  
  // Get current language from URL
  const headersList = (await headers());
  const referer = headersList.get("referer") || "";
  const refererUrl = new URL(referer);
  const pathParts = refererUrl.pathname.split('/');
  const lang = pathParts.length > 1 && locales.includes(pathParts[1]) ? pathParts[1] : 'en';
  
  // If redirectPath doesn't already include the language, add it
  let finalRedirectPath = redirectPath;
  if (!finalRedirectPath.startsWith(`/${lang}`)) {
    finalRedirectPath = `/${lang}${redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`}`;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?lang=${lang}`
    }
  });

  if (error) {
    return encodedRedirect("error", `/${lang}`, error.message);
  }

  // If you want to ignore data.url and always redirect to the specified path
  return redirect(finalRedirectPath);
};

