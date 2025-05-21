"use client"

import { getSupabaseClient } from "./client"

/**
 * Clears all Supabase-related cookies and local storage items
 * This can help resolve JWT signature issues by forcing a fresh authentication state
 */
export async function clearSupabaseAuth() {
  try {
    const supabase = getSupabaseClient()

    // Sign out to clear server-side session
    await supabase.auth.signOut()

    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.trim().split("=")
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })

    // Clear local storage items related to Supabase
    Object.keys(localStorage).forEach((key) => {
      if (key.includes("supabase") || key.includes("sb-")) {
        localStorage.removeItem(key)
      }
    })

    console.log("Supabase auth data cleared successfully")
    return { success: true }
  } catch (error) {
    console.error("Error clearing Supabase auth data:", error)
    return { success: false, error }
  }
}
