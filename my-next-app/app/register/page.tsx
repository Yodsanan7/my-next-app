'use client'
import { register } from "@/lib/actions"
import { useState } from "react"
import Link from "next/link"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const res = await register(formData)
    if (res?.error) setError(res.error)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-indigo-950 p-4">
      <div className="w-full max-w-[440px] bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Get Started</h1>
          <p className="text-slate-400 mt-2">สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl text-center">{error}</div>}

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <input name="email" type="email" placeholder="name@company.com" required className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <input name="password" type="password" placeholder="••••••••" required className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
          </div>
          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] mt-4">Create Account</button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-sm">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 ml-1">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}