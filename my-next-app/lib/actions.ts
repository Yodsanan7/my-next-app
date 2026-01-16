// lib/actions.ts
'use server'

import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'กรุณากรอกข้อมูลให้ครบ' }

  // 1. ตรวจสอบว่ามี User นี้หรือยัง
  const existingUser = await redis.get(`user:${email}`)
  if (existingUser) return { error: 'Email นี้ถูกใช้งานแล้ว' }

  // 2. เข้ารหัสรหัสผ่าน
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. บันทึกลง Redis
  await redis.set(`user:${email}`, {
    email,
    password: hashedPassword,
  })

  redirect('/login')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. ดึงข้อมูลจาก Redis
  const user: any = await redis.get(`user:${email}`)
  if (!user) return { error: 'ไม่พบผู้ใช้งานนี้' }

  // 2. ตรวจสอบรหัสผ่าน
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) return { error: 'รหัสผ่านไม่ถูกต้อง' }

  // 3. สร้าง Session Cookie
  const cookieStore = await cookies()
  cookieStore.set('session', email, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 // 1 วัน
  })

  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}