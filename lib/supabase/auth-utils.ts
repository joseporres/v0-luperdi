import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Helper function to get Supabase client with proper cookie handling
export async function getActionSupabaseClient() {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

// Check if user is authenticated
export async function isAuthenticated() {
  try {
    const supabase = await getActionSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

// Check if user is admin
export async function isAdmin() {
  try {
    // Get admin emails from environment variable
    const adminEmails = process.env.AUTHORIZED_ADMIN_EMAILS?.split(",") || []

    if (adminEmails.length === 0) {
      return false
    }

    const supabase = await getActionSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.email) {
      return false
    }

    return adminEmails.includes(session.user.email)
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
