"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"
import { supabaseConfig, isValidSupabaseConfig } from "./config"

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    try {
      // Check if config is valid
      if (!isValidSupabaseConfig()) {
        throw new Error("Invalid Supabase configuration")
      }

      // Create client with explicit options
      supabaseClient = createClientComponentClient<Database>({
        supabaseUrl: supabaseConfig.url,
        supabaseKey: supabaseConfig.anonKey,
      })

      // Verify that the client has the expected methods
      if (!supabaseClient.auth.onAuthStateChange) {
        console.warn("Supabase client is missing onAuthStateChange method")

        // Add a mock implementation if it's missing
        supabaseClient.auth.onAuthStateChange = (callback) => {
          console.warn("Using mock onAuthStateChange implementation")
          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  console.log("Mock unsubscribe called")
                },
              },
            },
          }
        }
      }
    } catch (error) {
      console.error("Error creating Supabase client:", error)

      // Create a mock client with all required methods
      supabaseClient = {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signOut: () => Promise.resolve({ error: null }),
          signInWithPassword: () =>
            Promise.resolve({ data: null, error: { message: "Supabase client not available" } }),
          signUp: () => Promise.resolve({ data: null, error: { message: "Supabase client not available" } }),
          onAuthStateChange: (callback) => ({
            data: {
              subscription: {
                unsubscribe: () => {},
              },
            },
          }),
        },
        from: () => ({
          select: () => ({ data: null, error: null }),
        }),
      } as any
    }
  }
  return supabaseClient
}

// For backward compatibility with any code using createClient
export const createClient = getSupabaseClient
