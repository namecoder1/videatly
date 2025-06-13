import { updateSession } from './utils/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const locales = ['en', 'it', 'es', 'fr']

// Create a Supabase client for middleware usage
function createMiddlewareClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        },
      },
    }
  )
}

async function getLocale(request: NextRequest) {
  // Check if user is logged in and has a language preference
  const supabase = createMiddlewareClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.id) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('spoken_language')
      .eq('auth_user_id', user.id)
      .single()

    if (userProfile?.spoken_language && locales.includes(userProfile.spoken_language)) {
      return userProfile.spoken_language
    }
  }

  // Fallback to browser preferred language
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0]
      .toLowerCase()
    if (locales.includes(preferredLocale)) {
      return preferredLocale
    }
  }
  return 'en'
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 🔁 Reindirizza / alla lingua corretta
  if (pathname === '/') {
    const locale = await getLocale(request)
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  const isPublicPath =
    pathname.startsWith('/auth') || pathname.startsWith('/login')

  const pathnameIsMissingLocale =
    locales.every(
      (locale) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    ) && !isPublicPath

  // 🌍 i18n redirect
  if (pathnameIsMissingLocale) {
    const locale = await getLocale(request)
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }

  // �� Supabase session
  const response = await updateSession(request)
  
  // Check if user is authenticated and has yt_username set
  const supabase = createMiddlewareClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.id) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('yt_username')
      .eq('auth_user_id', user.id)
      .single()

    // Get the current locale from the pathname
    const currentLocale = locales.find(locale => pathname.startsWith(`/${locale}/`)) || 'en'
    
    // Check if the current path is not one of the allowed paths and yt_username is not set
    const isAllowedPath = pathname.includes('/profile') || 
                         pathname.includes('/billing') || 
                         pathname.includes('/documentation') || 
                         pathname.includes('/settings')
    
    if (!isAllowedPath && !userProfile?.yt_username) {
      return NextResponse.redirect(new URL(`/${currentLocale}/profile`, request.url))
    }
  }

  return response
}

export const config = {
  // Exclude Stripe webhook from middleware to preserve raw body for signature verification
  matcher: ['/((?!_next|api/stripe/webhook|api|favicon.ico).*)'],
}