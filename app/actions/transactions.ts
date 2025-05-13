"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"
import { clearCart, getCart } from "@/lib/cart"
import { updateProductVariantInventory } from "@/app/actions/products"

// Helper function to get Supabase client with proper cookie handling
async function getActionSupabaseClient() {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

export async function createTransaction(formData: FormData) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "You must be logged in to create a transaction" }
    }

    // Get form data
    const product_id = formData.get("product_id") as string
    const variant_id = formData.get("variant_id") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const quantity = Number.parseInt(formData.get("quantity") as string, 10)
    const first_name = formData.get("first_name") as string
    const last_name = formData.get("last_name") as string
    const email = formData.get("email") as string
    const department = formData.get("department") as string
    const province = formData.get("province") as string
    const address = formData.get("address") as string
    const payment_method = formData.get("payment_method") as string

    // Validate required fields
    const requiredFields = [
      "product_id",
      "variant_id",
      "price",
      "quantity",
      "first_name",
      "last_name",
      "email",
      "department",
      "province",
      "address",
      "payment_method",
    ]

    const missingFields = requiredFields.filter((field) => !formData.get(field))
    if (missingFields.length > 0) {
      return { error: `Missing required fields: [ '${missingFields.join("', '")}' ]` }
    }

    // Update user profile with shipping information
    await supabase
      .from("profiles")
      .update({
        first_name,
        last_name,
        department,
        province,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    // IMPORTANT: Validate current stock levels before proceeding
    // This prevents issues if someone else purchased items while this user was checking out
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("inventory_count")
      .eq("id", variant_id)
      .single()

    if (variantError) {
      console.error("Error fetching variant:", variantError)
      return { error: "Could not verify product availability" }
    }

    if (!variant || variant.inventory_count < quantity) {
      // Stock has been reduced since the user added to cart
      return {
        error:
          "This product is no longer available in the requested quantity. " +
          `Only ${variant?.inventory_count || 0} items remain in stock.`,
      }
    }

    // Create transaction
    const { data, error } = await supabase.rpc("create_transaction", {
      p_product_id: product_id,
      p_variant_id: variant_id,
      p_price: price,
      p_quantity: quantity,
      p_buyer_id: session.user.id,
      p_department: department,
      p_province: province,
      p_address: address,
      p_payment_method: payment_method,
    })

    if (error) {
      console.error("Error creating transaction:", error)
      return { error: error.message }
    }

    // Update inventory
    await updateProductVariantInventory(
      variant_id,
      variant.inventory_count - quantity,
      `Purchase - Transaction ID: ${data}`,
    )

    // Clear cart after successful purchase
    await clearCart()

    // Return the transaction ID for redirection
    return { success: true, transactionId: data }
  } catch (error: any) {
    console.error("Unexpected error creating transaction:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Validate all cart items have sufficient stock
export async function validateCartStock() {
  try {
    const supabase = await getActionSupabaseClient()
    const cart = await getCart()

    // No items in cart
    if (cart.length === 0) {
      return { valid: true, items: [] }
    }

    // Check each item in the cart
    const invalidItems = []

    for (const item of cart) {
      if (!item.variantId) continue

      // Get current stock level
      const { data: variant, error } = await supabase
        .from("product_variants")
        .select("inventory_count, product_id, products(name)")
        .eq("id", item.variantId)
        .single()

      if (error || !variant) {
        invalidItems.push({
          ...item,
          currentStock: 0,
          reason: "Product variant not found",
        })
        continue
      }

      // Check if requested quantity exceeds current stock
      if (variant.inventory_count < item.quantity) {
        invalidItems.push({
          ...item,
          currentStock: variant.inventory_count,
          reason: `Only ${variant.inventory_count} items available`,
        })
      }
    }

    return {
      valid: invalidItems.length === 0,
      items: invalidItems,
    }
  } catch (error) {
    console.error("Error validating cart stock:", error)
    return {
      valid: false,
      error: "Could not validate product availability",
    }
  }
}

export async function getUserTransactions() {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return []
    }

    // Get user transactions with product details
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        products(*),
        product_variants(*, sizes(*))
      `,
      )
      .eq("buyer_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching transactions:", error)
    return []
  }
}

export async function updateTransactionStatus(id: string, status: string) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: "You must be logged in to update a transaction" }
    }

    // Check if user is admin (in a real app, you would check a role)
    // For this demo, we'll just allow it

    // Update transaction status
    const { error } = await supabase.rpc("update_transaction_status", {
      transaction_id: id,
      new_status: status,
    })

    if (error) {
      console.error("Error updating transaction status:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error updating transaction status:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Add the missing getAllTransactions function
export async function getAllTransactions(
  options: {
    startDate?: string
    endDate?: string
    status?: string
    limit?: number
    offset?: number
  } = {},
) {
  try {
    const supabase = await getActionSupabaseClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { data: [], count: 0, error: "You must be logged in to view all transactions" }
    }

    // In a real application, you would check if the user has admin privileges here
    // For this demo, we'll just allow it

    // Build the query
    let query = supabase.from("transactions").select(
      `
        *,
        products(*),
        product_variants(*, sizes(*)),
        profiles(first_name, last_name, email)
      `,
      { count: "exact" },
    )

    // Apply filters if provided
    if (options.status) {
      query = query.eq("status", options.status)
    }

    if (options.startDate) {
      query = query.gte("created_at", options.startDate)
    }

    if (options.endDate) {
      query = query.lte("created_at", options.endDate)
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    // Order by created_at descending (newest first)
    query = query.order("created_at", { ascending: false })

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching all transactions:", error)
      return { data: [], count: 0, error: error.message }
    }

    return { data: data || [], count: count || 0, error: null }
  } catch (error: any) {
    console.error("Unexpected error fetching all transactions:", error)
    return { data: [], count: 0, error: "An unexpected error occurred" }
  }
}
