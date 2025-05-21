"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Helper function to get Supabase client with proper cookie handling
async function getActionSupabaseClient() {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

export type Collection = {
  id: string
  name: string
  slug: string
  description: string | null
  is_permanent: boolean
  release_date: string | null
  end_date: string | null
  enabled: boolean
  created_at: string
  updated_at: string
}

export async function getCollections() {
  try {
    const supabase = await getActionSupabaseClient()

    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("enabled", true)
      .order("is_permanent", { ascending: false })
      .order("release_date", { ascending: false })

    if (error) {
      console.error("Error fetching collections:", error)
      return []
    }

    return data as Collection[]
  } catch (error) {
    console.error("Unexpected error fetching collections:", error)
    return []
  }
}

export async function getCollectionBySlug(slug: string) {
  try {
    const supabase = await getActionSupabaseClient()

    const { data, error } = await supabase
      .from("collections")
      .select(
        `
        *,
        products(
          *,
          product_variants(
            id,
            inventory_count,
            sizes(id, name)
          )
        )
      `,
      )
      .eq("slug", slug)
      .eq("enabled", true)
      .single()

    if (error) {
      console.error(`Error fetching collection with slug ${slug}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Unexpected error fetching collection with slug ${slug}:`, error)
    return null
  }
}

export async function getPermanentCollection() {
  try {
    const supabase = await getActionSupabaseClient()

    const { data, error } = await supabase
      .from("collections")
      .select(
        `
        *,
        products(
          *,
          product_variants(
            id,
            inventory_count,
            sizes(id, name)
          )
        )
      `,
      )
      .eq("is_permanent", true)
      .eq("enabled", true)
      .single()

    if (error) {
      console.error("Error fetching permanent collection:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error fetching permanent collection:", error)
    return null
  }
}

export async function getCurrentCollections() {
  try {
    const supabase = await getActionSupabaseClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("collections")
      .select(
        `
        *,
        products(
          *,
          product_variants(
            id,
            inventory_count,
            sizes(id, name)
          )
        )
      `,
      )
      .eq("enabled", true)
      .or(`is_permanent.eq.true,and(release_date.lte.${now},or(end_date.gte.${now},end_date.is.null))`)
      .order("is_permanent", { ascending: false })
      .order("release_date", { ascending: false })

    if (error) {
      console.error("Error fetching current collections:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Unexpected error fetching current collections:", error)
    return []
  }
}
