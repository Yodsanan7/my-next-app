// app/login/page.tsx
'use client'
import { login } from "@/lib/actions"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-auto max-w-[400px]">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back</h1>
        <p className="text-center text-slate-500 mb-8">ยินดีต้อนรับกลับมา กรุณาเข้าสู่ระบบ</p>
        
        <form action={login} className="space-y-4">
          <div>
            <input 
              name="email"  // *** ต้องเป็น email เท่านั้น ***
              type="text" 
              placeholder="Email or Username" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required 
            />
          </div>
          <div>
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required 
            />
          </div>
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
            Sign In
          </button>
        </form>
        
        <p className="text-center mt-8 text-slate-600">
          ยังไม่มีบัญชี? <a href="/register" className="text-indigo-600 font-semibold hover:underline">สร้างบัญชีใหม่</a>
        </p>
      </div>
    </div>
  )
}