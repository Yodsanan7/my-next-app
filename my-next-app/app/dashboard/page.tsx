import { db } from "@/lib/db"
import { logout, deleteUser } from "@/lib/actions"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  // 1. ดึงชื่อจาก Cookie
  const cookieStore = await cookies() 
  const currentUserSession = cookieStore.get("session")?.value
  
  // 2. ถ้าไม่ได้ล็อกอิน ให้เด้งไปหน้า Login
  if (!currentUserSession) redirect("/login")

  // 3. ดึงรายชื่อคนทั้งหมดจากฐานข้อมูล
  const users = await db.user.findMany()

  // 4. หาข้อมูลของ "คนที่กำลังใช้งานอยู่" เพื่อดูว่าเป็น ADMIN หรือ USER
  // --- ตัวแปรที่เป็นปัญหาอยู่ตรงนี้ครับ ---
  const currentUser = users.find(u => u.username === currentUserSession)

  // 5. นับจำนวนคนออนไลน์
  const onlineCount = users.filter(u => u.isOnline).length

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* ส่วนหัวแสดงชื่อผู้ใช้และปุ่ม Logout */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Admin Panel</h1>
            <p className="text-slate-500">
              ยินดีต้อนรับ: <span className="text-indigo-600 font-bold">{currentUserSession}</span> 
              <span className="ml-2 text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-400 font-black uppercase tracking-tighter">
                Role: {currentUser?.role}
              </span>
            </p>
          </div>
          <form action={logout}>
            <button className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 rounded-2xl font-bold transition-all border border-red-100 active:scale-95">
              Logout
            </button>
          </form>
        </div>

        {/* การ์ดสถิติ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Total Users</p>
            <p className="text-5xl font-black text-slate-800 mt-2">{users.length}</p>
          </div>
          <div className="p-8 bg-white rounded-[2rem] border-t-4 border-t-green-500 border border-slate-100 shadow-sm">
            <p className="text-green-500 font-bold text-xs uppercase tracking-widest">Online Now</p>
            <p className="text-5xl font-black text-green-600 mt-2">{onlineCount}</p>
          </div>
        </div>

        {/* ตารางสมาชิก */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-xs uppercase font-black tracking-widest">
                  <th className="p-6 border-b">Username</th>
                  <th className="p-6 border-b text-center">Role</th>
                  <th className="p-6 border-b">Status</th>
                  <th className="p-6 border-b text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-6">
                      <span className="font-bold text-slate-700">{user.username}</span>
                      {user.username === currentUserSession && (
                        <span className="ml-2 bg-indigo-100 text-indigo-600 text-[10px] px-2 py-1 rounded-lg font-black">YOU</span>
                      )}
                    </td>
                    <td className="p-6 text-center">
                        <span className={`text-[10px] font-black px-2 py-1 rounded ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                            {user.role}
                        </span>
                    </td>
                    <td className="p-6">
                      {user.isOnline ? (
                        <span className="inline-flex items-center text-green-500 font-bold text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-slate-300 font-bold text-sm">
                          <span className="w-2 h-2 bg-slate-200 rounded-full mr-2"></span> Offline
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {/* เงื่อนไข: ต้องเป็น ADMIN และ ไม่ใช่แถวของตัวเอง ถึงจะกดลบได้ */}
                      {currentUser?.role === "ADMIN" && user.username !== currentUserSession ? (
                        <form action={deleteUser.bind(null, user.id)}>
                          <button className="text-red-400 hover:text-red-600 font-black text-xs uppercase tracking-widest transition-colors">
                            Delete
                          </button>
                        </form>
                      ) : (
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">
                            {user.username === currentUserSession ? "System (You)" : "Protected"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 