// lib/actions.ts
'use server'

import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const email = (formData.get('email') as string).toLowerCase().trim(); // แปลงเป็นตัวเล็กและตัดช่องว่าง
  const password = formData.get('password') as string

  console.log(`--- กำลังตรวจสอบการสมัคร: ${email} ---`)

  // 1. ตรวจสอบว่าชื่อซ้ำไหม (ห้ามชื่อซ้ำ)
  const existingUser = await redis.get(`user:${email}`)
  if (existingUser) {
    console.log(`❌ สมัครไม่สำเร็จ: Email ${email} มีอยู่ในระบบแล้ว`)
    return { error: "Email นี้ถูกใช้งานไปแล้ว" }
  }

  // 2. ถ้าไม่ซ้ำ ให้สร้างไอดีใหม่
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // ตรวจสอบว่าเป็นคนแรกไหม ถ้าใช่ให้เป็น admin
  const allKeys = await redis.keys('user:*')
  const role = allKeys.length === 0 ? 'admin' : 'user'

  await redis.set(`user:${email}`, { 
    email, 
    password: hashedPassword, 
    role,
    createdAt: new Date().toISOString() 
  })

  console.log(`✅ สมัครสมาชิกสำเร็จ: ${email} (Role: ${role})`)
  redirect('/login')
}

export async function login(formData: FormData) {
  const email = (formData.get('email') as string).toLowerCase().trim();
  const password = formData.get('password') as string

  console.log(`--- กำลังตรวจสอบการเข้าสู่ระบบ: ${email} ---`)

  // 1. ตรวจสอบว่ามีไอดีนี้ไหม
  const user: any = await redis.get(`user:${email}`)
  
  if (!user) {
    console.log(`❌ เข้าสู่ระบบไม่สำเร็จ: ไม่พบ Email ${email} ในระบบ`)
    return { error: "ไม่พบชื่อผู้ใช้งานนี้ในระบบ" }
  }

  // 2. ตรวจสอบรหัสผ่าน
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    console.log(`❌ เข้าสู่ระบบไม่สำเร็จ: รหัสผ่านของ ${email} ไม่ถูกต้อง`)
    return { error: "รหัสผ่านไม่ถูกต้อง" }
  }

  // 3. ถ้าผ่านหมด ให้สร้าง Session
  const cookieStore = await cookies()
  cookieStore.set('session', email, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 
  })

  console.log(`✅ ${email} เข้าสู่ระบบสำเร็จ กำลังไปหน้า Dashboard...`)
  redirect('/dashboard')
}