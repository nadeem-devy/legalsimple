import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'

export async function updateSession(request: NextRequest) {
  // In mock mode, allow all routes without auth checks
  if (MOCK_MODE) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user role from profiles table if user exists
  let userRole: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role || null
  }

  const path = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/register/lawyer']
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith('/api/webhooks'))

  // Protected route patterns
  const lawyerRoutes = path.startsWith('/lawyer/')
  const adminRoutes = path.startsWith('/admin')

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Role-based access control
  if (user && userRole) {
    // Redirect authenticated users away from auth pages
    if (path === '/login' || path === '/register' || path === '/register/lawyer') {
      const url = request.nextUrl.clone()
      if (userRole === 'admin') {
        url.pathname = '/admin/dashboard'
      } else if (userRole === 'lawyer') {
        url.pathname = '/lawyer/dashboard'
      } else {
        url.pathname = '/dashboard'
      }
      return NextResponse.redirect(url)
    }

    // Protect lawyer routes
    if (lawyerRoutes && userRole !== 'lawyer' && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Protect admin routes
    if (adminRoutes && userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = userRole === 'lawyer' ? '/lawyer/dashboard' : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
