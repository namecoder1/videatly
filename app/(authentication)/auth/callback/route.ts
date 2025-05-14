import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { locales } from '@/middleware';

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();
  const urlLang = requestUrl.searchParams.get("lang") || "en";

  let userLang = urlLang;
  
  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    
    // If user logged in successfully, check their language preference
    if (data?.user) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('spoken_language')
        .eq('auth_user_id', data.user.id)
        .single();
      
      // Use the user's preferred language if it exists and is valid
      if (userProfile?.spoken_language && locales.includes(userProfile.spoken_language)) {
        userLang = userProfile.spoken_language;
      }
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // Redirect to dashboard with the user's preferred language
  return NextResponse.redirect(`${origin}/${userLang}/dashboard`);
}
