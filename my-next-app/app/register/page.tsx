import { register } from "@/lib/actions"
import Link from "next/link"

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sParams = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-[2rem] border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2">เข้าร่วมกับเราเพื่อเริ่มต้นใช้งาน</p>
        </div>

        {sParams.error === "exists" && (
          <div className="mb-6 p-4 bg-amber-50 text-amber-600 rounded-2xl text-center font-bold border border-amber-100">
            ⚠️ ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว
          </div>
        )}

        <form action={register} className="space-y-5">
          <input name="username" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Username" />
          <input name="password" type="password" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Password" />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95">
            Sign Up Now
          </button>
        </form>

        <p className="text-center mt-8 text-slate-600">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="text-blue-600 font-bold hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}