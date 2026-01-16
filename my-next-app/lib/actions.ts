// lib/actions.ts
'use server'

import { redis } from './redis'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// ฟังก์ชันสมัครสมาชิก (ให้คนแรกที่สมัครเป็น Admin)
export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const allKeys = await redis.keys('user:*')
  const role = allKeys.length === 0 ? 'admin' : 'user' // คนแรกเป็น admin

  const hashedPassword = await bcrypt.hash(password, 10)
  await redis.set(`user:${email}`, { email, password: hashedPassword, role })
  redirect('/login')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const user: any = await redis.get(`user:${email}`)
  if (!user || !(await bcrypt.compare(password, user.password))) return

  const cookieStore = await cookies()
  cookieStore.set('session', email, { httpOnly: true, maxAge: 60 * 60 * 24 })

  // บันทึกสถานะออนไลน์ (อยู่ได้ 5 นาที)
  await redis.set(`online:${email}`, 'active', { ex: 300 })

  redirect('/dashboard')
}

// แอดมินสั่งลบไอดีคนอื่น
export async function adminDeleteUser(targetEmail: string) {
  const cookieStore = await cookies()
  const myEmail = cookieStore.get('session')?.value
  const me: any = await redis.get(`user:${myEmail}`)

  if (me?.role === 'admin') {
    await redis.del(`user:${targetEmail}`)
    await redis.del(`online:${targetEmail}`)
  }
  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  const email = cookieStore.get('session')?.value
  await redis.del(`online:${email}`)
  cookieStore.delete('session')
  redirect('/login')
}