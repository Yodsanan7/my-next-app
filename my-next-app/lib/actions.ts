// lib/actions.ts
'use server'

import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. ตรวจสอบว่ามี User นี้ใน Redis หรือยัง
  const existingUser = await redis.get(`user:${email}`)
  if (existingUser) {
    throw new Error('User นี้มีอยู่ในระบบแล้ว')
  }

  // 2. เข้ารหัสรหัสผ่านก่อนเก็บ (Security)
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. บันทึกลง Redis (เก็บเป็น Object)
  // Key คือ user:email เช่น user:test@gmail.com
  await redis.set(`user:${email}`, {
    email,
    password: hashedPassword,
  })

  redirect('/login')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. ดึงข้อมูล User จาก Redis
  const user: any = await redis.get(`user:${email}`)
  if (!user) {
    throw new Error('ไม่พบ User หรือรหัสผ่านไม่ถูกต้อง')
  }

  // 2. ตรวจสอบรหัสผ่านที่ส่งมา กับที่เก็บใน Redis
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw new Error('รหัสผ่านไม่ถูกต้อง')
  }

  // 3. สร้าง Session ง่ายๆ ด้วย Cookie
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