// lib/actions.ts
'use server'

import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim()
  const password = formData.get('password') as string
  let isSuccess = false

  if (!email || !password) return { error: "กรุณากรอกข้อมูลให้ครบ" }

  try {
    const user: any = await redis.get(`user:${email}`)
    
    // ตรวจสอบว่ามี User จริงไหม
    if (!user) return { error: "ไม่พบผู้ใช้งานนี้ในระบบ" }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return { error: "รหัสผ่านไม่ถูกต้อง" }

    // ถ้าผ่านหมด
    const cookieStore = await cookies()
    cookieStore.set('session', email, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 
    })

    await redis.set(`online:${email}`, 'active', { ex: 300 })
    isSuccess = true
  } catch (error) {
    console.error("Login Error:", error)
    return { error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" }
  }

  // เรียก redirect นอก try/catch เท่านั้น
  if (isSuccess) {
    redirect('/dashboard')
  }
}

export async function register(formData: FormData) {
  const email = (formData.get('email') as string)?.toLowerCase().trim()
  const password = formData.get('password') as string
  let isSuccess = false

  if (!email || !password) return { error: "กรุณากรอกข้อมูลให้ครบ" }

  try {
    const existingUser = await redis.get(`user:${email}`)
    if (existingUser) return { error: "Email นี้ถูกใช้งานแล้ว" }

    const hashedPassword = await bcrypt.hash(password, 10)
    const allKeys = await redis.keys('user:*')
    const role = allKeys.length === 0 ? 'admin' : 'user'

    await redis.set(`user:${email}`, { 
      email, 
      password: hashedPassword, 
      role,
      createdAt: new Date().toISOString() 
    })
    isSuccess = true
  } catch (error) {
    console.error("Register Error:", error)
    return { error: "ไม่สามารถสมัครสมาชิกได้" }
  }

  if (isSuccess) {
    redirect('/login')
  }
}

export async function logout() {
  const cookieStore = await cookies()
  const email = cookieStore.get('session')?.value
  if (email) await redis.del(`online:${email}`)
  cookieStore.delete('session')
  redirect('/login')
}

export async function adminDeleteUser(targetEmail: string) {
  const cookieStore = await cookies()
  const myEmail = cookieStore.get('session')?.value
  const me: any = await redis.get(`user:${myEmail}`)

  if (me?.role === 'admin') {
    await redis.del(`user:${targetEmail}`)
    await redis.del(`online:${targetEmail}`)
  }
}