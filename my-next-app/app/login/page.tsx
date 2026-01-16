import { login } from "@/lib/actions"
import Link from "next/link"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string, success?: string }> }) {
  const sParams = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-[2rem] border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2">ยินดีต้อนรับกลับมา กรุณาเข้าสู่ระบบ</p>
        </div>

        {sParams.error === "invalid" && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-center font-bold border border-red-100">
            ❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
          </div>
        )}

        {sParams.success === "registered" && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl text-center font-bold border border-green-100">
            ✅ สมัครสมาชิกสำเร็จ! เข้าสู่ระบบได้เลย
          </div>
        )}

        <form action={login} className="space-y-5">
          <input name="username" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Username" />
          <input name="password" type="password" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Password" />
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-slate-600">
          ยังไม่มีบัญชี? <Link href="/register" className="text-indigo-600 font-bold hover:underline">สร้างบัญชีใหม่</Link>
        </p>
      </div>
    </div>
  )
}