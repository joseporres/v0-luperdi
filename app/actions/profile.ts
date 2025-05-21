"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Helper function to get Supabase client with proper cookie handling
async function getActionSupabaseClient() {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

// Update user profile
export async function updateProfile(formData: FormData) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "You must be logged in to update your profile" }
    }

    // Get form data
    const firstName = formData.get("first_name") as string
    const lastName = formData.get("last_name") as string
    const phone = formData.get("phone") as string

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (error) {
      console.error("Error updating profile:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error updating profile:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update user address
export async function updateAddress(formData: FormData) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "You must be logged in to update your address" }
    }

    // Get form data
    const department = formData.get("department") as string
    const province = formData.get("province") as string
    const address = formData.get("address") as string

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        department,
        province,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (error) {
      console.error("Error updating address:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error updating address:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update user password
export async function updatePassword(formData: FormData) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "You must be logged in to update your password" }
    }

    // Get form data
    const currentPassword = formData.get("current_password") as string
    const newPassword = formData.get("new_password") as string
    const confirmPassword = formData.get("confirm_password") as string

    // Validate passwords
    if (newPassword !== confirmPassword) {
      return { error: "New passwords do not match" }
    }

    if (newPassword.length < 6) {
      return { error: "New password must be at least 6 characters" }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Error updating password:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error updating password:", error)
    return { error: "An unexpected error occurred" }
  }
}
