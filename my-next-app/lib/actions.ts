'use server'

import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'กรุณากรอกข้อมูลให้ครบ' }

  const existingUser = await redis.get(`user:${email}`)
  if (existingUser) return { error: 'Email นี้ถูกใช้งานแล้ว' }

  const hashedPassword = await bcrypt.hash(password, 10)

  await redis.set(`user:${email}`, {
    email,
    password: hashedPassword,
  })

  redirect('/login')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user: any = await redis.get(`user:${email}`)
  if (!user) return { error: 'ไม่พบผู้ใช้งานนี้' }

  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) return { error: 'รหัสผ่านไม่ถูกต้อง' }

  const cookieStore = await cookies()
  cookieStore.set('session', email, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 
  })

  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/login')
}

export async function deleteUser() {
  const cookieStore = await cookies()
  const email = (await cookieStore).get('session')?.value

  if (email) {
    await redis.del(`user:${email}`)
    ;(await cookieStore).delete('session')
  }
  
  redirect('/login')
}