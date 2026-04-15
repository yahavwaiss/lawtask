import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

const PUBLIC_ROUTES = ['/login', '/register']
const API_NO_AUTH = ['/api/telegram', '/api/cron']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createClient(request, response)

  // Refresh session tokens
  await supabase.auth.getSession()

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Allow unauthenticated API routes (webhook + cron)
  if (API_NO_AUTH.some((p) => pathname.startsWith(p))) {
    return response
  }

  // Root redirect
  if (pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Protect all other routes
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
}
