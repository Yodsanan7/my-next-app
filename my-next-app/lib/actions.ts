// lib/actions.ts
'use server'

import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const email = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string

  const existingUser = await redis.get(`user:${email}`)
  if (existingUser) return { error: "Email นี้ถูกใช้งานไปแล้ว" }

  const hashedPassword = await bcrypt.hash(password, 10)
  
  // คนแรกที่สมัครจะเป็น admin
  const allKeys = await redis.keys('user:*')
  const role = allKeys.length === 0 ? 'admin' : 'user'

  await redis.set(`user:${email}`, { 
    email, 
    password: hashedPassword, 
    role,
    createdAt: new Date().toISOString() 
  })

  redirect('/login')
}

export async function login(formData: FormData) {
  const email = (formData.get('email') as string).toLowerCase().trim()
  const password = formData.get('password') as string

  const user: any = await redis.get(`user:${email}`)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
  }

  const cookieStore = await cookies()
  cookieStore.set('session', email, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 
  })

  // บันทึกสถานะออนไลน์ (อยู่ได้ 5 นาที)
  await redis.set(`online:${email}`, 'active', { ex: 300 })

  redirect('/dashboard')
}

// ฟังก์ชันออกจากระบบ (Export ตัวที่ 1 ที่หายไป)
export async function logout() {
  const cookieStore = await cookies()
  const email = cookieStore.get('session')?.value
  if (email) {
    await redis.del(`online:${email}`)
  }
  cookieStore.delete('session')
  redirect('/login')
}

// ฟังก์ชันแอดมินลบผู้ใช้ (Export ตัวที่ 2 ที่หายไป)
export async function adminDeleteUser(targetEmail: string) {
  const cookieStore = await cookies()
  const myEmail = cookieStore.get('session')?.value
  const me: any = await redis.get(`user:${myEmail}`)

  if (me?.role === 'admin') {
    await redis.del(`user:${targetEmail}`)
    await redis.del(`online:${targetEmail}`)
  }
  // ไม่ต้องใช้ redirect เพื่อให้หน้าจอรีเฟรชที่เดิม
}