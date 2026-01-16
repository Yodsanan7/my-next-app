// app/dashboard/page.tsx
import { redis } from "@/lib/redis"
import { logout, adminDeleteUser } from "@/lib/actions"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const myEmail = cookieStore.get('session')?.value
  if (!myEmail) redirect('/login')

  // 1. ดึงข้อมูลตัวเอง
  const me: any = await redis.get(`user:${myEmail}`)
  
  // อัปเดตสถานะออนไลน์ของตัวเองทุกครั้งที่เข้าหน้านี้
  await redis.set(`online:${myEmail}`, 'active', { ex: 300 })

  // 2. ดึงรายชื่อผู้ใช้ทั้งหมด (Redis ใช้การ scan keys)
  const userKeys = await redis.keys('user:*')
  const users = await Promise.all(
    userKeys.map(async (key) => {
      const data: any = await redis.get(key)
      const isOnline = await redis.get(`online:${data.email}`)
      return { ...data, isOnline: !!isOnline }
    })
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold">ระบบจัดการสมาชิก</h1>
          <p className="text-sm text-gray-500">คุณคือ: {myEmail} ({me?.role})</p>
        </div>
        <form action={logout}><button className="text-red-500 font-medium">Log out</button></form>
      </div>

      <div className="grid gap-4">
        <h2 className="font-semibold text-gray-700">สมาชิกทั้งหมด ({users.length} คน)</h2>
        {users.map((user) => (
          <div key={user.email} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border-l-4 border-indigo-500">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.email}</span>
                {user.isOnline ? (
                  <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Online</span>
                ) : (
                  <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Offline</span>
                )}
                {user.role === 'admin' && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Admin</span>}
              </div>
            </div>

            {/* ถ้าเราเป็น Admin และคนนี้ไม่ใช่ตัวเราเอง ให้โชว์ปุ่มลบ */}
            {me?.role === 'admin' && user.email !== myEmail && (
              <form action={async () => { 'use server'; await adminDeleteUser(user.email); }}>
                <button className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-md hover:bg-red-500 hover:text-white transition">
                  ลบผู้ใช้
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}