import { SignupForm } from "@/components/auth/signup-form"
import { getServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SignupPage() {
  const supabase = getServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is already logged in, redirect to profile
  if (session) {
    redirect("/profile")
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="bg-card p-6 rounded-lg shadow">
        <SignupForm />
      </div>
    </div>
  )
}
