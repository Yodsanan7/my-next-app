// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ถ้าล็อกอินอยู่แล้ว แต่อยากเข้าหน้า login/register ให้ส่งไป dashboard
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}