import { redis } from "@/lib/redis"
import { logout, deleteUser } from "@/lib/actions"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const email = cookieStore.get('session')?.value

  if (!email) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mb-6">ยินดีต้อนรับคุณ: <br/><strong>{email}</strong></p>
        
        <div className="flex flex-col gap-3">
          <form action={logout}>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition">
              Log out (ออกจากระบบ)
            </button>
          </form>

          <form action={deleteUser}>
            <button className="w-full bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-md transition text-sm">
              Delete Account (ลบบัญชีผู้ใช้)
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}