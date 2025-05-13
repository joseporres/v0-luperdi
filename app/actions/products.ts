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

// Create a new product (admin only)
export async function createProduct(formData: FormData) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is admin
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", JSON.stringify(sessionError))
      return { error: "Authentication error" }
    }

    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    // Get form data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const category = formData.get("category") as string
    const collectionId = formData.get("collection_id") as string
    const sku = formData.get("sku") as string
    const imageUrl = formData.get("image_url") as string
    const isAvailable = formData.get("is_available") === "true"

    // Validate required fields
    if (!name || !price || !category) {
      return { error: "Name, price, and category are required" }
    }

    // Insert product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price,
        category,
        collection_id: collectionId || null,
        sku,
        image_url: imageUrl || null,
        is_available: isAvailable,
      })
      .select()
      .single()

    if (productError) {
      console.error("Error creating product:", JSON.stringify(productError))
      return { error: productError.message }
    }

    // Get sizes to create variants
    const { data: sizes, error: sizesError } = await supabase.from("sizes").select("*")

    if (sizesError) {
      console.error("Error fetching sizes:", JSON.stringify(sizesError))
      return { error: sizesError.message }
    }

    // Create product variants for each size
    const variants = sizes.map((size) => ({
      product_id: product.id,
      size_id: size.id,
      inventory_count: 0,
      sku: sku ? `${sku}-${size.name}` : null,
      price: null, // Use product price by default
    }))

    const { error: variantsError } = await supabase.from("product_variants").insert(variants)

    if (variantsError) {
      console.error("Error creating product variants:", JSON.stringify(variantsError))
      return { error: variantsError.message }
    }

    return { success: true, product }
  } catch (error) {
    console.error("Exception in createProduct:", error instanceof Error ? error.message : String(error))
    return { error: "An unexpected error occurred" }
  }
}

// Update a product (admin only)
export async function updateProduct(id: string, formData: FormData) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is admin
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", JSON.stringify(sessionError))
      return { error: "Authentication error" }
    }

    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    // Get form data
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const category = formData.get("category") as string
    const collectionId = formData.get("collection_id") as string
    const sku = formData.get("sku") as string
    const imageUrl = formData.get("image_url") as string
    const isAvailable = formData.get("is_available") === "true"

    // Validate required fields
    if (!name || !price || !category) {
      return { error: "Name, price, and category are required" }
    }

    // Update product
    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price,
        category,
        collection_id: collectionId || null,
        sku,
        image_url: imageUrl || null,
        is_available: isAvailable,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating product:", JSON.stringify(error))
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Exception in updateProduct:", error instanceof Error ? error.message : String(error))
    return { error: "An unexpected error occurred" }
  }
}

// Update product variant inventory (admin only)
export async function updateProductVariantInventory(
  variantId: string,
  newCount: number,
  changeReason = "Manual adjustment",
) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is admin
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", JSON.stringify(sessionError))
      return { error: "Authentication error" }
    }

    if (!session?.user) {
      return { error: "Not authenticated" }
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
      return { error: logError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Exception in updateProductVariantInventory:", error instanceof Error ? error.message : String(error))
    return { error: "An unexpected error occurred" }
  }
}
