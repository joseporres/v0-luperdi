"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, clearCart } from "@/lib/cart"

// Helper function to get Supabase client with proper cookie handling
async function getActionSupabaseClient() {
  const cookieStore = cookies()
  return createServerActionClient<Database>({ cookies: () => cookieStore })
}

// Server action to get cart
export async function getServerCart() {
  return await getCart()
}

// Server action to add item to cart
export async function addItemToCart(productId: string, variantId: string, quantity: number) {
  return await addToCart(productId, variantId, quantity)
}

// Server action to remove item from cart
export async function removeItemFromCart(productId: string, variantId: string) {
  return await removeFromCart(productId, variantId)
}

// Server action to update item quantity
export async function updateItemQuantity(productId: string, variantId: string, quantity: number) {
  return await updateCartItemQuantity(productId, variantId, quantity)
}

// Server action to clear cart
export async function clearServerCart() {
  return await clearCart()
}
