"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Cart item type
export type CartItem = {
  productId: string
  variantId: string
  quantity: number
  name?: string
  price?: number
  image?: string
  size?: string
}

// Get cart from cookies
export async function getCart(): Promise<CartItem[]> {
  try {
    const cookieStore = cookies()
    const cartCookie = cookieStore.get("cart")

    if (!cartCookie?.value) {
      return []
    }

    // Parse cart items from cookie
    const cartItems = JSON.parse(decodeURIComponent(cartCookie.value)) as CartItem[]

    // Fetch product details for each cart item
    const cartItemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const supabase = createServerActionClient<Database>({ cookies })

          // Get product details
          const { data: product, error } = await supabase
            .from("products")
            .select("name, price, image_url")
            .eq("id", item.productId)
            .single()

          if (error || !product) {
            return item
          }

          // Get variant details if available
          let size = undefined
          if (item.variantId) {
            const { data: variant } = await supabase
              .from("product_variants")
              .select("sizes(name)")
              .eq("id", item.variantId)
              .single()

            if (variant && variant.sizes) {
              size = variant.sizes.name
            }
          }

          return {
            ...item,
            name: product.name,
            price: product.price,
            image: product.image_url,
            size,
          }
        } catch (error) {
          console.error(`Error fetching details for product ${item.productId}:`, error)
          return item
        }
      }),
    )

    return cartItemsWithDetails
  } catch (error) {
    console.error("Error getting cart:", error)
    return []
  }
}

// Get cart totals (count and price)
export async function getCartTotals() {
  const cart = await getCart()

  const count = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0)

  return { count, subtotal }
}

// Add item to cart
export async function addToCart(productId: string, variantId: string, quantity: number) {
  try {
    const cookieStore = cookies()
    const cartCookie = cookieStore.get("cart")

    // Get current cart or initialize empty array
    const currentCart = cartCookie?.value ? JSON.parse(decodeURIComponent(cartCookie.value)) : []

    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(
      (item: CartItem) => item.productId === productId && item.variantId === variantId,
    )

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      currentCart[existingItemIndex].quantity += quantity
    } else {
      // Add new item if it doesn't exist
      currentCart.push({
        productId,
        variantId,
        quantity,
      })
    }

    // Save updated cart to cookie
    cookieStore.set("cart", encodeURIComponent(JSON.stringify(currentCart)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    })

    return { success: true }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return { error: "Failed to add item to cart" }
  }
}

// Remove item from cart
export async function removeFromCart(productId: string, variantId: string) {
  try {
    const cookieStore = cookies()
    const cartCookie = cookieStore.get("cart")

    if (!cartCookie?.value) {
      return { success: true }
    }

    // Get current cart
    const currentCart = JSON.parse(decodeURIComponent(cartCookie.value))

    // Filter out the item to remove
    const updatedCart = currentCart.filter(
      (item: CartItem) => !(item.productId === productId && item.variantId === variantId),
    )

    // Save updated cart to cookie
    cookieStore.set("cart", encodeURIComponent(JSON.stringify(updatedCart)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    })

    return { success: true }
  } catch (error) {
    console.error("Error removing from cart:", error)
    return { error: "Failed to remove item from cart" }
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(productId: string, variantId: string, quantity: number) {
  try {
    const cookieStore = cookies()
    const cartCookie = cookieStore.get("cart")

    if (!cartCookie?.value) {
      return { success: false, error: "Cart is empty" }
    }

    // Get current cart
    const currentCart = JSON.parse(decodeURIComponent(cartCookie.value))

    // Find the item to update
    const itemIndex = currentCart.findIndex(
      (item: CartItem) => item.productId === productId && item.variantId === variantId,
    )

    if (itemIndex === -1) {
      return { success: false, error: "Item not found in cart" }
    }

    // Update quantity
    currentCart[itemIndex].quantity = quantity

    // Save updated cart to cookie
    cookieStore.set("cart", encodeURIComponent(JSON.stringify(currentCart)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating cart item quantity:", error)
    return { error: "Failed to update item quantity" }
  }
}

// Update cart item (compatibility function for older code)
export async function updateCartItem(itemId: string, quantity: number) {
  try {
    const cookieStore = cookies()
    const cartCookie = cookieStore.get("cart")

    if (!cartCookie?.value) {
      return { success: false, error: "Cart is empty" }
    }

    // Get current cart
    const currentCart = JSON.parse(decodeURIComponent(cartCookie.value))

    // Find the item to update by ID
    // Note: This is a compatibility function for older code that used IDs
    // In the new implementation, we use productId and variantId
    const itemIndex = currentCart.findIndex((item: any) => item.id === itemId)

    if (itemIndex === -1) {
      return { success: false, error: "Item not found in cart" }
    }

    // Update quantity
    currentCart[itemIndex].quantity = Math.max(1, quantity)

    // Save updated cart to cookie
    cookieStore.set("cart", encodeURIComponent(JSON.stringify(currentCart)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    })

    return { success: true, cart: currentCart }
  } catch (error) {
    console.error("Error updating cart item:", error)
    return { error: "Failed to update cart item. Please try again." }
  }
}

// Clear cart
export async function clearCart() {
  try {
    const cookieStore = cookies()

    // Remove cart cookie
    cookieStore.set("cart", "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    })

    return { success: true }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return { error: "Failed to clear cart" }
  }
}
