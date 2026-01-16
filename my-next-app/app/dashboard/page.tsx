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
  
  // อัปเดตสถานะออนไลน์ตัวเอง
  await redis.set(`online:${myEmail}`, 'active', { ex: 300 })

  // ดึงรายชื่อทั้งหมด
  const userKeys = await redis.keys('user:*')
  const users = await Promise.all(
    userKeys.map(async (key) => {
      const data: any = await redis.get(key)
      const isOnline = await redis.get(`online:${data.email}`)
      return { ...data, isOnline: !!isOnline }
    })
  )

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการสมาชิก</h1>
          <p className="text-sm text-gray-500">คุณล็อกอินเป็น: <span className="font-semibold">{myEmail}</span> ({me?.role})</p>
        </div>
        <form action={logout}>
          <button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-600 hover:text-white transition">
            ออกจากระบบ
          </button>
        </form>
      </div>

      <div className="grid gap-4">
        <h2 className="text-lg font-semibold text-gray-700">สมาชิกทั้งหมด ({users.length} คน)</h2>
        {users.map((user) => (
          <div key={user.email} className="bg-white p-5 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`}></div>
              <div>
                <p className="font-bold text-gray-800">{user.email}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>

            {/* ปุ่มลบสำหรับแอดมิน */}
            {me?.role === 'admin' && user.email !== myEmail && (
              <form action={async () => { 'use server'; await adminDeleteUser(user.email); }}>
                <button className="text-sm bg-gray-50 text-gray-400 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition border border-gray-100">
                  ลบสมาชิก
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}