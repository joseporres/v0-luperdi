"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Helper function to get Supabase client with proper cookie handling
async function getActionSupabaseClient() {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const supabase = await getActionSupabaseClient()

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error details:", error.message)

      if (error.message.includes("Invalid login credentials")) {
        // Provide a more user-friendly message
        return { error: "The email or password you entered is incorrect" }
      }

      return { error: error.message }
    }

    // If we get here, authentication was successful
    if (data?.user) {
      // Use upsert to create or update the profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (profileError) {
        console.error("Error creating/updating profile:", profileError)
        // Continue anyway as the auth was successful
      }
    }

    // Return success without redirect
    return { success: true }
  } catch (e) {
    console.error("Unexpected error during sign in:", e)
    return { error: "An unexpected error occurred" }
  }
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("first-name") as string
  const lastName = formData.get("last-name") as string

  try {
    const supabase = await getActionSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle()

    if (existingUser) {
      return { error: "An account with this email already exists" }
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Signup error:", error.message)
      return { error: error.message }
    }

    if (data?.user) {
      // Create a profile for the new user
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (profileError) {
        console.error("Error creating profile:", profileError)
        // Continue anyway as the auth was successful
      }
    }

    return { success: "Check your email to confirm your account", message: "Check your email to confirm your account" }
  } catch (e) {
    console.error("Unexpected error during sign up:", e)
    return { error: "An unexpected error occurred" }
  }
}

export async function signOut() {
  try {
    const supabase = await getActionSupabaseClient()
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    console.error("Error signing out:", error)
    return { error: "Failed to sign out" }
  }
}

export async function getSession() {
  try {
    const supabase = await getActionSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getUserDetails() {
  try {
    const supabase = await getActionSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)

      // If profile doesn't exist, create one
      if (profileError.code === "PGRST116") {
        const { error: insertError } = await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )

        if (insertError) {
          console.error("Error creating profile:", insertError)
        }
      }
    }

    return {
      ...user,
      profile,
    }
  } catch (error) {
    console.error("Error getting user details:", error)
    return null
  }
}

// Check if the current user is an admin
export async function isAdmin() {
  try {
    const supabase = await getActionSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return false
    }

    // In a real app, you would check a role or a specific field in the user's profile
    // For this demo, we'll just return true if the user is authenticated
    return true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
