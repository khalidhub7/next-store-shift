import { AuthForm } from "@/components/auth/auth-form"

// ✅ always render fresh (no caching)
export const dynamic = "force-dynamic"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm type="register" />
    </div>
  )
}