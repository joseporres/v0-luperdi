"use server"
import type { Database } from "@/lib/supabase/database.types"
import { getActionSupabaseClient } from "@/lib/supabase/server"
import { isValidSupabaseConfig } from "@/lib/supabase/config"

export type Product = Database["public"]["Tables"]["products"]["Row"]
export type ProductWithVariants = Product & { variants: ProductVariant[] }
export type ProductVariant = Database["public"]["Tables"]["product_variants"]["Row"]
export type Size = Database["public"]["Tables"]["sizes"]["Row"]

// Get all products
export async function getProducts() {
  try {
    // Check if Supabase is properly configured
    if (!isValidSupabaseConfig()) {
      console.warn("Invalid Supabase configuration, returning mock data")
      return [] // Return empty array for invalid configuration
    }

    console.log("Fetching products...")
    const supabase = await getActionSupabaseClient()

    // Get all products with their variants and sizes
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_variants(
          id,
          inventory_count,
          sizes(id, name, display_order)
        )
      `)
      .eq("is_available", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error fetching products:", JSON.stringify(error))
      return []
    }

    // Calculate total inventory and process product data
    const processedProducts =
      data?.map((product) => {
        const variants = product.product_variants || []
        const totalInventory = variants.reduce((sum, variant) => sum + (variant.inventory_count || 0), 0)

        return {
          ...product,
          inventory_count: totalInventory,
          has_stock: totalInventory > 0,
        }
      }) || []

    console.log(`Successfully fetched ${processedProducts?.length || 0} products`)
    return processedProducts
  } catch (error) {
    console.error("Exception in getProducts:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace available")
    return [] // Return empty array in case of any error
  }
}

// Get product by ID with variants
export async function getProductById(id: string) {
  try {
    const supabase = await getActionSupabaseClient()

    // Get product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*, collections(*)")
      .eq("id", id)
      .single()

    if (productError || !product) {
      console.error("Error fetching product:", JSON.stringify(productError))
      return null
    }

    // Get product variants with sizes
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("*, sizes(*)")
      .eq("product_id", id)
      .order("sizes(display_order)", { ascending: true })

    if (variantsError) {
      console.error("Error fetching product variants:", JSON.stringify(variantsError))
      return product
    }

    return { ...product, variants: variants || [] }
  } catch (error) {
    console.error("Exception in getProductById:", error instanceof Error ? error.message : String(error))
    return null
  }
}

// Get products by collection ID
export async function getProductsByCollection(collectionId: string) {
  try {
    const supabase = await getActionSupabaseClient()

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("collection_id", collectionId)
      .eq("is_available", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products by collection:", JSON.stringify(error))
      return []
    }

    return data
  } catch (error) {
    console.error("Exception in getProductsByCollection:", error instanceof Error ? error.message : String(error))
    return []
  }
}

// Get all sizes
export async function getSizes() {
  try {
    const supabase = await getActionSupabaseClient()

    const { data, error } = await supabase.from("sizes").select("*").order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching sizes:", JSON.stringify(error))
      return []
    }

    return data
  } catch (error) {
    console.error("Exception in getSizes:", error instanceof Error ? error.message : String(error))
    return []
  }
}

// Update product variant inventory (system use only, during checkout)
export async function updateProductVariantInventory(
  variantId: string,
  newCount: number,
  changeReason = "System adjustment",
) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      console.error("Session error:", sessionError || "No session")
      return { error: "Authentication error" }
    }

    // Get current inventory count
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("inventory_count")
      .eq("id", variantId)
      .single()

    if (variantError) {
      console.error("Error fetching product variant:", JSON.stringify(variantError))
      return { error: variantError.message }
    }

    const previousCount = variant.inventory_count

    // Update product variant inventory
    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ inventory_count: newCount })
      .eq("id", variantId)

    if (updateError) {
      console.error("Error updating product variant inventory:", JSON.stringify(updateError))
      return { error: updateError.message }
    }

    // Log inventory change
    const { error: logError } = await supabase.from("inventory_logs").insert({
      product_variant_id: variantId,
      previous_count: previousCount,
      new_count: newCount,
      change_reason: changeReason,
      changed_by: session.user.id,
    })

    if (logError) {
      console.error("Error logging inventory change:", JSON.stringify(logError))
      // Continue anyway as the inventory was updated successfully
    }

    return { success: true }
  } catch (error) {
    console.error("Exception in updateProductVariantInventory:", error instanceof Error ? error.message : String(error))
    return { error: "An unexpected error occurred" }
  }
}
