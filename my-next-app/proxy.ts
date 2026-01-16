// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')

  // ถ้าจะเข้าหน้า Dashboard แต่ไม่มีการ Login ให้เด้งไปหน้า Login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// กำหนด Path ที่ต้องการให้ตรวจสอบ
export const config = {
  matcher: ['/dashboard/:path*'],
}