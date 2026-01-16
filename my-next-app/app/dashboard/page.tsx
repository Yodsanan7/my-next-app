// app/dashboard/page.tsx
import { redis } from "@/lib/redis"
import { logout, adminDeleteUser } from "@/lib/actions"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const myEmail = cookieStore.get('session')?.value
  
  if (!myEmail) redirect('/login')

  const me: any = await redis.get(`user:${myEmail}`)
  
  // ถ้ามีคุกกี้แต่ใน DB ไม่มี User (อาจโดนลบ) ให้เตะออก
  if (!me) {
    cookieStore.delete('session')
    redirect('/login')
  }

  await redis.set(`online:${myEmail}`, 'active', { ex: 300 })

  const userKeys = await redis.keys('user:*')
  const users = await Promise.all(
    userKeys.map(async (key) => {
      const data: any = await redis.get(key)
      if (!data) return null // ป้องกันข้อมูลเสีย
      const isOnline = await redis.get(`online:${data.email}`)
      return { ...data, isOnline: !!isOnline }
    })
  )

  // กรองเอาเฉพาะข้อมูลที่มีค่าจริงๆ
  const validUsers = users.filter(u => u !== null)

  return (
    // ... ส่วนของ UI Dashboard (ใช้โค้ดเดิมที่ผมให้ไปก่อนหน้าได้เลย) ...
    // แต่เปลี่ยนจาก users.map เป็น validUsers.map ครับ
  )
}