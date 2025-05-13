import { createServerComponentClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"
import { supabaseConfig, isValidSupabaseConfig } from "./config"

export const getServerSupabaseClient = () => {
  try {
    // Check if config is valid
    if (!isValidSupabaseConfig()) {
      throw new Error("Invalid Supabase configuration")
    }

    const cookieStore = cookies()
    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
      supabaseUrl: supabaseConfig.url,
      supabaseKey: supabaseConfig.anonKey,
    })
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    // Return a minimal mock client to prevent crashes
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
    } as any
  }
}

export const getActionSupabaseClient = () => {
  try {
    // Check if config is valid
    if (!isValidSupabaseConfig()) {
      throw new Error("Invalid Supabase configuration")
    }

    const cookieStore = cookies()
    return createServerActionClient<Database>({
      cookies: () => cookieStore,
      supabaseUrl: supabaseConfig.url,
      supabaseKey: supabaseConfig.anonKey,
    })
  } catch (error) {
    console.error("Error creating action Supabase client:", error)
    // Return a minimal mock client to prevent crashes
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
    } as any
  }
}
