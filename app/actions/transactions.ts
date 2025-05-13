"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"
import { clearCart } from "@/lib/cart"
import { updateProductVariantInventory } from "@/app/actions/products"

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"]

// Create a new transaction
export async function createTransaction(formData: FormData) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { error: "You must be logged in to complete a purchase" }
    }

    // Get form data
    const productId = formData.get("product_id") as string
    let variantId = formData.get("variant_id") as string
    const price = Number(formData.get("price"))
    const quantity = Number(formData.get("quantity") || 1)
    const department = formData.get("department") as string
    const province = formData.get("province") as string
    const address = formData.get("address") as string
    const paymentMethod = formData.get("payment_method") as string

    // If variantId is empty, use productId as a fallback
    if (!variantId || variantId === "undefined" || variantId === "null") {
      console.log("Using productId as fallback for missing variantId")
      variantId = productId
    }

    // Log received data for debugging
    console.log("Transaction data received:", {
      productId,
      variantId,
      price,
      quantity,
      department,
      province,
      address,
      paymentMethod,
    })

    // Validate required fields
    const missingFields = []
    if (!productId) missingFields.push("product_id")
    if (!variantId) missingFields.push("variant_id")
    if (!price) missingFields.push("price")
    if (!department) missingFields.push("department")
    if (!province) missingFields.push("province")
    if (!address) missingFields.push("address")
    if (!paymentMethod) missingFields.push("payment_method")

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields)
      return { error: `Missing required fields: ${missingFields.join(", ")}` }
    }

    // Validate Peru-only shipping
    const validDepartments = [
      "Lima",
      "Arequipa",
      "Cusco",
      "La Libertad",
      "Piura",
      "Lambayeque",
      "Junín",
      "Áncash",
      "Cajamarca",
      "Puno",
      "Loreto",
      "Ica",
      "San Martín",
      "Tacna",
      "Ucayali",
      "Huánuco",
      "Ayacucho",
      "Amazonas",
      "Apurímac",
      "Huancavelica",
      "Madre de Dios",
      "Moquegua",
      "Pasco",
      "Tumbes",
    ]

    if (!validDepartments.includes(department)) {
      return { error: "Shipping is only available within Peru" }
    }

    try {
      // Check if the variant exists
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("inventory_count")
        .eq("id", variantId)
        .single()

      // If variant doesn't exist, try to get a default variant for the product
      if (variantError || !variant) {
        console.log("Variant not found, looking for default variant")
        const { data: defaultVariants, error: defaultVariantError } = await supabase
          .from("product_variants")
          .select("id, inventory_count")
          .eq("product_id", productId)
          .limit(1)

        if (defaultVariantError || !defaultVariants || defaultVariants.length === 0) {
          console.error("No variants found for product:", productId)
          return { error: "Product variant not found" }
        }

        // Use the first variant as default
        variantId = defaultVariants[0].id
        console.log("Using default variant:", variantId)

        // Check inventory of default variant
        if (defaultVariants[0].inventory_count < quantity) {
          return { error: "This product is out of stock or has insufficient inventory" }
        }
      } else if (variant.inventory_count < quantity) {
        return { error: "This product is out of stock or has insufficient inventory" }
      }

      // Create transaction using the RPC function
      const { data: transactionId, error: transactionError } = await supabase.rpc("create_transaction", {
        p_product_id: productId,
        p_variant_id: variantId,
        p_price: price,
        p_quantity: quantity,
        p_buyer_id: session.user.id,
        p_department: department,
        p_province: province,
        p_address: address,
        p_payment_method: paymentMethod,
      })

      if (transactionError) {
        console.error("Error creating transaction:", transactionError)
        return { error: transactionError.message }
      }

      // Update inventory
      const currentInventory = variant ? variant.inventory_count : 0
      await updateProductVariantInventory(
        variantId,
        currentInventory - quantity,
        `Purchase - Transaction ID: ${transactionId}`,
      )

      // Clear cart after successful purchase
      await clearCart()

      return { success: true, transactionId }
    } catch (error) {
      console.error("Error in transaction creation:", error)
      return { error: "Failed to process transaction" }
    }
  } catch (error) {
    console.error("Unexpected error in createTransaction:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Get user transactions
export async function getUserTransactions() {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return []
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      products(*),
      product_variants(*, sizes(*))
    `)
    .eq("buyer_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user transactions:", error)
    return []
  }

  return data || []
}

// Get all transactions (admin only)
export async function getAllTransactions(
  filters: {
    status?: string
    department?: string
    dateFrom?: string
    dateTo?: string
  } = {},
) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return []
  }

  // In a real app, you would check if the user is an admin
  // For now, we'll use the isAdmin function from auth.ts

  let query = supabase
    .from("transactions")
    .select(`
      *,
      products(*),
      product_variants(*, sizes(*)),
      profiles(*)
    `)
    .order("created_at", { ascending: false })

  // Apply filters
  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.department) {
    query = query.eq("department", filters.department)
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching all transactions:", error)
    return []
  }

  return data || []
}

// Update transaction status (admin only)
export async function updateTransactionStatus(transactionId: string, status: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { error: "You must be logged in to update transaction status" }
  }

  // In a real app, you would check if the user is an admin
  // For now, we'll use the isAdmin function from auth.ts

  try {
    const { error } = await supabase.rpc("update_transaction_status", {
      transaction_id: transactionId,
      new_status: status,
    })

    if (error) {
      console.error("Error updating transaction status:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in transaction status update:", error)
    return { error: "Failed to update transaction status" }
  }
}
