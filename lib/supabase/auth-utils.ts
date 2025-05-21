"use server"

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

/**
 * Clears all Supabase-related cookies and local storage items
 * This can help resolve JWT signature issues by forcing a fresh authentication state
 * Note: This function must be called from the client side
 */
export async function clearSupabaseAuth() {
  try {
    // This is a client-side function, so we'll add a warning
    console.warn("clearSupabaseAuth must be called from the client side")

    return {
      success: false,
      error: "This function must be called from the client side",
    }
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
    const supabase = await getActionSupabaseClient()

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
