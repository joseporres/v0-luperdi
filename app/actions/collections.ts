"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

export type Collection = Database["public"]["Tables"]["collections"]["Row"]
export type CollectionWithProducts = Collection & { products: Product[] }
export type Product = Database["public"]["Tables"]["products"]["Row"]

// Get all collections (only enabled ones)
export async function getCollections() {
  const supabase = await createServerActionClient<Database>({ cookies })

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

  return data
}

// Get collection by slug with products (only if enabled)
export async function getCollectionBySlug(slug: string) {
  try {
    const supabase = await createServerActionClient<Database>({ cookies })

    // Get collection
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .eq("enabled", true)
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

// Get permanent collection (only if enabled)
export async function getPermanentCollection() {
  const supabase = await createServerActionClient<Database>({ cookies })

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("is_permanent", true)
    .eq("enabled", true)
    .single()

  if (error) {
    console.error("Error fetching permanent collection:", error)
    return null
  }

  return data
}

// Get current collections (permanent + active limited collections, only enabled ones)
export async function getCurrentCollections() {
  const supabase = await createServerActionClient<Database>({ cookies })
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("enabled", true)
    .or(`is_permanent.eq.true,and(release_date.lte.${now},or(end_date.gte.${now},end_date.is.null))`)
    .order("is_permanent", { ascending: false })
    .order("release_date", { ascending: false })

  if (error) {
    console.error("Error fetching current collections:", error)
    return []
  }

  return data
}
