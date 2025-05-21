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

// Payment status enum
export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

// Mock payment processor function
// In a real application, this would integrate with a payment gateway like Stripe, PayPal, etc.
async function processPayment(paymentDetails: {
  amount: number
  paymentMethod: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  email: string
}) {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simulate payment failures for testing
  // In a real app, this would be replaced with actual payment gateway integration
  if (paymentDetails.cardNumber === "4111111111111111") {
    return {
      success: true,
      transactionId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      message: "Payment processed successfully",
    }
  } else if (paymentDetails.cardNumber === "4242424242424242") {
    return {
      success: false,
      error: "insufficient_funds",
      message: "Your card has insufficient funds. Please use a different payment method.",
    }
  } else if (paymentDetails.cardNumber === "4000000000000002") {
    return {
      success: false,
      error: "card_declined",
      message: "Your card was declined. Please use a different card or payment method.",
    }
  } else if (!paymentDetails.cardNumber || paymentDetails.cardNumber.length < 15) {
    return {
      success: false,
      error: "invalid_card",
      message: "The card information you provided is invalid. Please check your card details and try again.",
    }
  }

  // Default success case for demo purposes
  // In a real app, this would be the result from the payment gateway
  return {
    success: true,
    transactionId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    message: "Payment processed successfully",
  }
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

    // Get payment details
    const cardNumber = formData.get("card_number") as string
    const expiryDate = formData.get("expiry_date") as string
    const cvv = formData.get("cvv") as string

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

    // Calculate total amount
    const totalAmount = price * quantity

    // Process payment
    const paymentResult = await processPayment({
      amount: totalAmount,
      paymentMethod: payment_method,
      cardNumber,
      expiryDate,
      cvv,
      email,
    })

    // If payment failed, return error
    if (!paymentResult.success) {
      return {
        error: paymentResult.message,
        paymentError: true,
        errorCode: paymentResult.error,
      }
    }

    // Create transaction with initial status of "processing"
    const { data: transactionId, error } = await supabase.rpc("create_transaction", {
      p_product_id: product_id,
      p_variant_id: variant_id,
      p_price: price,
      p_quantity: quantity,
      p_buyer_id: session.user.id,
      p_department: department,
      p_province: province,
      p_address: address,
      p_payment_method: payment_method,
      p_payment_status: PaymentStatus.COMPLETED,
      p_payment_id: paymentResult.transactionId,
    })

    if (error) {
      console.error("Error creating transaction:", error)
      return { error: error.message }
    }

    // Update inventory
    await updateProductVariantInventory(
      variant_id,
      variant.inventory_count - quantity,
      `Purchase - Transaction ID: ${transactionId}`,
    )

    // Clear cart after successful purchase
    await clearCart()

    // Return the transaction ID for redirection
    return {
      success: true,
      transactionId,
      paymentId: paymentResult.transactionId,
      message: paymentResult.message,
    }
  } catch (error: any) {
    console.error("Unexpected error creating transaction:", error)
    return { error: "An unexpected error occurred during checkout. Please try again." }
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

// This function is needed for compatibility with existing code
// but has been modified to only work with user's own transactions
export async function getAllTransactions(filters = {}) {
  console.warn("getAllTransactions is deprecated and will be removed in a future version")
  try {
    const transactions = await getUserTransactions()
    return { data: transactions, count: transactions.length, error: null }
  } catch (error) {
    console.error("Error in getAllTransactions:", error)
    return { data: [], count: 0, error: "Failed to fetch transactions" }
  }
}

// Add the missing updateTransactionStatus function
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

    // Get the transaction to check if it belongs to the user
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("buyer_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching transaction:", fetchError)
      return { error: "Transaction not found" }
    }

    // Only allow users to update their own transactions
    if (transaction.buyer_id !== session.user.id) {
      return { error: "You do not have permission to update this transaction" }
    }

    // Update transaction status
    const { error } = await supabase.from("transactions").update({ status }).eq("id", id)

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
