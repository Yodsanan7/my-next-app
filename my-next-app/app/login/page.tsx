'use client'
import { login } from "@/lib/actions"
import { useState } from "react"
import Link from "next/link"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const res = await login(formData)
    if (res?.error) setError(res.error)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-indigo-950 p-4">
      <div className="w-full max-w-[440px] bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 mt-2">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl text-center">{error}</div>}

        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <input name="email" type="email" placeholder="name@company.com" required className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <input name="password" type="password" placeholder="••••••••" required className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] mt-4">Sign In</button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-sm">
          ยังไม่มีบัญชี? <Link href="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 ml-1">สร้างบัญชีใหม่</Link>
        </p>
      </div>
    </div>
  )
}