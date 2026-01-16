// app/dashboard/page.tsx
import { redis } from "@/lib/redis"
import { logout, adminDeleteUser } from "@/lib/actions"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  let myEmail = "";
  let me: any = null;
  let validUsers: any[] = [];

  try {
    const cookieStore = await cookies()
    myEmail = cookieStore.get('session')?.value || ""
    
    if (!myEmail) {
      redirect('/login')
    }

    // 1. ดึงข้อมูลตัวเอง
    me = await redis.get(`user:${myEmail}`)
    
    if (!me) {
      // ถ้ามีคุกกี้แต่ไม่มีข้อมูลใน DB ให้ล้างคุกกี้แล้วเด้งออก
      (await cookies()).delete('session')
      redirect('/login')
    }

    // อัปเดตสถานะออนไลน์
    await redis.set(`online:${myEmail}`, 'active', { ex: 300 })

    // 2. ดึงรายชื่อผู้ใช้ทั้งหมด
    const userKeys = await redis.keys('user:*')
    if (userKeys && userKeys.length > 0) {
      const allData = await Promise.all(
        userKeys.map(async (key) => {
          try {
            const data: any = await redis.get(key)
            if (!data || !data.email) return null
            const isOnline = await redis.get(`online:${data.email}`)
            return { ...data, isOnline: !!isOnline }
          } catch (e) {
            return null
          }
        })
      )
      validUsers = allData.filter(u => u !== null)
    }
  } catch (error) {
    console.error("Dashboard Error:", error)
    // ถ้าพังจริงๆ ให้ส่งกลับไป Login
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* Header Bar */}
      <nav className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">A</div>
            <div>
              <h2 className="font-bold text-lg text-white leading-none">Admin Panel</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">{me?.role || 'user'}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-400 hidden sm:block">Welcome, <span className="text-indigo-400 font-medium">{myEmail}</span></span>
            <form action={logout}>
              <button className="bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border border-slate-700">Log out</button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 sm:p-10">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Users Management</h1>
            <p className="text-slate-400 mt-2">จัดการสมาชิกและตรวจสอบสถานะออนไลน์</p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl text-indigo-400 text-sm font-medium">
            Total Users: {validUsers.length}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validUsers.map((user) => (
            <div key={user.email} className="bg-slate-800/40 border border-white/5 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                {user.isOnline ? (
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">
                    <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Offline</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white uppercase shadow-lg">
                  {user.email ? user.email[0] : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-white truncate max-w-[150px]">{user.email}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-amber-400' : 'text-slate-500'}`}>{user.role || 'user'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-500">Member Status Verified</span>
                {me?.role === 'admin' && user.email !== myEmail && (
                  <form action={async () => { 'use server'; await adminDeleteUser(user.email); }}>
                    <button className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-red-500/20">Delete</button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}