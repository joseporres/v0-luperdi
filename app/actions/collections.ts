"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

export type Collection = Database["public"]["Tables"]["collections"]["Row"]
export type CollectionWithProducts = Collection & { products: Product[] }
export type Product = Database["public"]["Tables"]["products"]["Row"]

// Get all collections
export async function getCollections() {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("is_permanent", { ascending: false })
    .order("release_date", { ascending: false })

  if (error) {
    console.error("Error fetching collections:", error)
    return []
  }

  return data
}

// Get collection by slug with products
export async function getCollectionBySlug(slug: string) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    // Get collection
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .single()

    if (collectionError || !collection) {
      console.error("Error fetching collection:", JSON.stringify(collectionError))
      return null
    }

    // Get products in collection with their variants
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        *,
        product_variants(
          id,
          inventory_count,
          sizes(id, name, display_order)
        )
      `)
      .eq("collection_id", collection.id)
      .eq("is_available", true)
      .order("created_at", { ascending: false })

    if (productsError) {
      console.error("Error fetching products for collection:", JSON.stringify(productsError))
      return { ...collection, products: [] }
    }

    // Calculate total inventory and process product data
    const processedProducts =
      products?.map((product) => {
        const variants = product.product_variants || []
        const totalInventory = variants.reduce((sum, variant) => sum + (variant.inventory_count || 0), 0)

        return {
          ...product,
          inventory_count: totalInventory,
          has_stock: totalInventory > 0,
        }
      }) || []

    return { ...collection, products: processedProducts }
  } catch (error) {
    console.error("Exception in getCollectionBySlug:", error instanceof Error ? error.message : String(error))
    return null
  }
}

// Get permanent collection
export async function getPermanentCollection() {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase.from("collections").select("*").eq("is_permanent", true).single()

  if (error) {
    console.error("Error fetching permanent collection:", error)
    return null
  }

  return data
}

// Get current collections (permanent + active limited collections)
export async function getCurrentCollections() {
  const supabase = createServerActionClient<Database>({ cookies })
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .or(`is_permanent.eq.true,and(release_date.lte.${now},or(end_date.gte.${now},end_date.is.null))`)
    .order("is_permanent", { ascending: false })
    .order("release_date", { ascending: false })

  if (error) {
    console.error("Error fetching current collections:", error)
    return []
  }

  return data
}

// Create a new collection (admin only)
export async function createCollection(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { error: "Not authenticated" }
  }

  // Get form data
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const isPermanent = formData.get("is_permanent") === "true"
  const releaseDate = formData.get("release_date") as string
  const endDate = formData.get("end_date") as string

  // Validate required fields
  if (!name || !slug) {
    return { error: "Name and slug are required" }
  }

  // Insert collection
  const { data, error } = await supabase.from("collections").insert({
    name,
    slug,
    description,
    is_permanent: isPermanent,
    release_date: releaseDate || null,
    end_date: endDate || null,
  })

  if (error) {
    console.error("Error creating collection:", error)
    return { error: error.message }
  }

  return { success: true }
}

// Update a collection (admin only)
export async function updateCollection(id: string, formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { error: "Not authenticated" }
  }

  // Get form data
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const description = formData.get("description") as string
  const isPermanent = formData.get("is_permanent") === "true"
  const releaseDate = formData.get("release_date") as string
  const endDate = formData.get("end_date") as string

  // Validate required fields
  if (!name || !slug) {
    return { error: "Name and slug are required" }
  }

  // Update collection
  const { data, error } = await supabase
    .from("collections")
    .update({
      name,
      slug,
      description,
      is_permanent: isPermanent,
      release_date: releaseDate || null,
      end_date: endDate || null,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating collection:", error)
    return { error: error.message }
  }

  return { success: true }
}

// Delete a collection (admin only)
export async function deleteCollection(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { error: "Not authenticated" }
  }

  // Delete collection
  const { error } = await supabase.from("collections").delete().eq("id", id)

  if (error) {
    console.error("Error deleting collection:", error)
    return { error: error.message }
  }

  return { success: true }
}
