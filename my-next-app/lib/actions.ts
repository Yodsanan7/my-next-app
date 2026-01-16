// lib/actions.ts
'use server'
import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim()
  const password = formData.get('password') as string

  // ดักจับกรณีค่าว่าง
  if (!email || !password) return 

  try {
    const user: any = await redis.get(`user:${email}`)
    
    // ถ้าไม่เจอ User ห้ามรันต่อ (มิฉะนั้นจะเกิด Application Error)
    if (!user) {
       console.error("User not found");
       return redirect('/login?error=usernotfound');
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
       return redirect('/login?error=invalidpassword');
    }

    const cookieStore = await cookies()
    cookieStore.set('session', email, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 
    })

    // บันทึกสถานะออนไลน์
    await redis.set(`online:${email}`, 'active', { ex: 300 })

  } catch (error) {
    console.error("Login Error:", error)
    return redirect('/login?error=servererror')
  }

  redirect('/dashboard')
}

// ... ส่วนของ register และ logout ให้ใช้ตามที่เคยให้ไปล่าสุด ...