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

/**
 * Tests the Supabase connection and authentication
 * Returns detailed information about any issues encountered
 */
export async function testSupabaseConnection() {
  try {
    const supabase = getSupabaseClient()

    // Test basic connection
    console.log("Testing Supabase connection...")
    const { data: connectionData, error: connectionError } = await supabase.from("products").select("count").limit(1)

    if (connectionError) {
      console.error("Connection test failed:", connectionError)
      return {
        success: false,
        error: connectionError,
        message: `Connection error: ${connectionError.message}`,
        code: connectionError.code,
        hint: "This may be due to incorrect Supabase URL or anon key",
      }
    }

    // Test authentication
    console.log("Testing Supabase authentication...")
    const { data: authData, error: authError } = await supabase.auth.getSession()

    if (authError) {
      console.error("Authentication test failed:", authError)
      return {
        success: false,
        error: authError,
        message: `Authentication error: ${authError.message}`,
        hint: "This may be due to JWT issues or invalid session data",
      }
    }

    return {
      success: true,
      connectionData,
      authData,
      message: "Supabase connection and authentication successful",
    }
  } catch (error) {
    console.error("Error testing Supabase connection:", error)
    return {
      success: false,
      error,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      hint: "This may be due to network issues or invalid configuration",
    }
  }
}
