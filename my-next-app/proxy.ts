// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// เปลี่ยนชื่อจาก middleware เป็น proxy
export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')

  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}