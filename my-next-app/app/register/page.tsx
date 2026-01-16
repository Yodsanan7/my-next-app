// app/register/page.tsx
'use client' // ต้องเป็น Client Component เพื่อใช้ state
import { register } from "@/lib/actions"
import { useState } from "react"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const result = await register(formData)
    if (result?.error) {
      setError(result.error) // ถ้าชื่อซ้ำ หรือมี error จะโชว์ตรงนี้
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">สมัครสมาชิก</h1>
      
      {/* ถ้ามี Error (เช่น ชื่อซ้ำ) จะขึ้นแถบสีแดง */}
      {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

      <form action={handleSubmit} className="flex flex-col gap-4">
        <input 
          name="email" // *** ต้องเป็น email เท่านั้น ***
          type="email" 
          placeholder="อีเมล" 
          required 
          className="border p-2 rounded"
        />
        <input 
          name="password" 
          type="password" 
          placeholder="รหัสผ่าน" 
          required 
          className="border p-2 rounded"
        />
        <button className="bg-blue-500 text-white p-2 rounded">สมัครสมาชิก</button>
      </form>
    </div>
  )
}