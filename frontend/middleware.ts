import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/app/lib/definitions'
import { cookies } from 'next/headers'
 
// 1. Specify protected and public routes
const protectedRoutes = ['/', '/queue', '/spot', '/accepted', '/inside']
const adminRoutes = ['/admin']
const publicRoutes = ['/login']
 
export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isAdminRoute = adminRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.sessionId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
 // 4. Redirect to /login if the user is not authenticated
  if (isAdminRoute && !session?.isAdmin) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith('/')
  ) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}