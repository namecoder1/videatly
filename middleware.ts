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
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.user?.id) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('spoken_language')
      .eq('auth_user_id', session.user.id)
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

  // 🔐 Supabase session
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}