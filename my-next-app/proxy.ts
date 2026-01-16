// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')
  const path = request.nextUrl.pathname

  // 1. ถ้าพยายามเข้าหน้า Dashboard แต่ไม่มี Session ให้เด้งไปหน้า Login
  if (path.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. ถ้าล็อกอินอยู่แล้ว "และพยายามจะเข้าหน้า Login/Register" ค่อยเด้งไป Dashboard
  // แต่ถ้าอยู่ที่หน้า Dashboard อยู่แล้ว ห้ามสั่ง Redirect ซ้ำ
  if (session && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // ตรวจสอบเฉพาะหน้าที่จำเป็นจริงๆ
  matcher: ['/dashboard/:path*', '/login', '/register'],
}