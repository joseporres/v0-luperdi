"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Helper function to get Supabase client with proper cookie handling
async function getActionSupabaseClient() {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

// Get all products
export async function getProducts(
  options: {
    limit?: number
    offset?: number
    search?: string
    collectionId?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {},
) {
  try {
    const supabase = await getActionSupabaseClient()

    // Start building the query
    let query = supabase.from("products").select("*, product_variants(*, sizes(*))").eq("is_available", true) // Changed from is_enabled to is_available

    // Apply collection filter if provided
    if (options.collectionId) {
      query = query.eq("collection_id", options.collectionId)
    }

    // Apply search filter if provided
    if (options.search) {
      query = query.ilike("name", `%${options.search}%`)
    }

    // Apply sorting if provided
    if (options.sortBy) {
      query = query.order(options.sortBy, { ascending: options.sortOrder === "asc" })
    } else {
      // Default sorting
      query = query.order("created_at", { ascending: false })
    }

    // Apply pagination if provided
    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching products:", error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error("Unexpected error fetching products:", error)
    return { data: [], error: "Failed to fetch products" }
  }
}

// Get product by ID
export async function getProductById(id: string) {
  try {
    const supabase = await getActionSupabaseClient()

    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*, sizes(*))")
      .eq("id", id)
      .eq("is_available", true) // Changed from is_enabled to is_available
      .single()

    if (error) {
      console.error("Error fetching product:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error fetching product:", error)
    return null
  }
}

// Get product variants
export async function getProductVariants(productId: string) {
  try {
    const supabase = await getActionSupabaseClient()

    const { data, error } = await supabase.from("product_variants").select("*, sizes(*)").eq("product_id", productId)

    if (error) {
      console.error("Error fetching product variants:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching product variants:", error)
    return []
  }
}

// Update product variant inventory
export async function updateProductVariantInventory(variantId: string, newCount: number, note: string) {
  try {
    const supabase = await getActionSupabaseClient()

    // Update the inventory count
    const { error } = await supabase.from("product_variants").update({ inventory_count: newCount }).eq("id", variantId)

    if (error) {
      console.error("Error updating inventory:", error)
      return { error: error.message }
    }

    // Log the inventory change
    await supabase.from("inventory_logs").insert({
      variant_id: variantId,
      previous_count: null, // We don't track the previous count in this simplified version
      new_count: newCount,
      change_reason: note,
    })

    return { success: true }
  } catch (error) {
    console.error("Unexpected error updating inventory:", error)
    return { error: "Failed to update inventory" }
  }
}
