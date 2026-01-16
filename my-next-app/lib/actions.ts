"use server"
import { db } from "./db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// --- 1. สมัครสมาชิก ---
export async function register(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  const existingUser = await db.user.findUnique({ where: { username } })
  if (existingUser) {
    redirect("/register?error=exists")
  }

  // คนสมัครใหม่จะเป็น USER เสมอ
  await db.user.create({
    data: { username, password, role: "USER" }
  })

  redirect("/login?success=registered")
}

// --- 2. เข้าสู่ระบบ ---
export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  const user = await db.user.findUnique({ where: { username } })

  if (!user || user.password !== password) {
    redirect("/login?error=invalid")
  }

  // อัปเดตสถานะออนไลน์
  await db.user.update({ where: { id: user.id }, data: { isOnline: true } })

  const cookieStore = await cookies()
  cookieStore.set("session", user.username, { httpOnly: true })
  
  redirect("/dashboard")
}

// --- 3. ออกจากระบบ ---
export async function logout() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  
  if (session) {
    await db.user.update({ where: { username: session }, data: { isOnline: false } })
  }

  cookieStore.delete("session")
  redirect("/login")
}

// --- 4. ลบผู้ใช้งาน (เช็คสิทธิ์ ADMIN เท่านั้น) ---
export async function deleteUser(userId: number) {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) redirect("/login");

  // เช็คสิทธิ์ในฐานข้อมูลว่าคนสั่งลบเป็น ADMIN หรือไม่
  const requester = await db.user.findUnique({ where: { username: session } })

  if (requester?.role === "ADMIN") {
    await db.user.delete({ where: { id: userId } })
    revalidatePath("/dashboard")
  } else {
    // ถ้าไม่ใช่ Admin จะลบไม่ได้
    console.log("Unauthorized: Only ADMIN can delete users");
  }
}