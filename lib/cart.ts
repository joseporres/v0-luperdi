"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Define cart item type
export type CartItem = {
  id: string
  productId: string
  variantId?: string
  name: string
  price: number
  quantity: number
  imageUrl: string | null
  size?: string
}

// Get cart from cookies
export async function getCart(): Promise<CartItem[]> {
  try {
    const cookieStore = cookies()
    // Make sure to await the cookies().get() call
    const cart = await cookieStore.get("cart")

    if (!cart || !cart.value || cart.value.trim() === "") {
      return []
    }

    try {
      return JSON.parse(cart.value) as CartItem[]
    } catch (parseError) {
      console.error("Invalid cart data, resetting cart:", parseError)
      // Reset the cart cookie if it contains invalid JSON
      await cookieStore.set("cart", "[]", {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })
      return []
    }
  } catch (error) {
    console.error("Error accessing cart:", error)
    return []
  }
}

// Add item to cart
export async function addToCart(productId: string, quantity = 1, variantId?: string) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      console.error("Product not found:", productError)
      return { error: "Product not found" }
    }

    let size = undefined
    let price = product.price

    // If variant is specified, get variant details
    if (variantId) {
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("*, sizes(name)")
        .eq("id", variantId)
        .single()

      if (variantError) {
        console.error("Variant not found:", variantError)
        return { error: "Variant not found" }
      }

      // Check if variant is in stock
      if (variant.inventory_count <= 0) {
        return { error: "This variant is out of stock" }
      }

      // Use variant price if available, otherwise use product price
      if (variant.price) {
        price = variant.price
      }

      size = variant.sizes?.name
    }

    // Get current cart
    const cart = await getCart()

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(
      (item) => item.productId === productId && (variantId ? item.variantId === variantId : !item.variantId),
    )

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.push({
        id: crypto.randomUUID(),
        productId,
        variantId,
        name: product.name,
        price,
        quantity,
        imageUrl: product.image_url,
        size,
      })
    }

    // Save cart to cookies
    const cookieStore = cookies()
    await cookieStore.set("cart", JSON.stringify(cart), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, cart }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return { error: "Failed to add item to cart. Please try again." }
  }
}

// Update cart item quantity
export async function updateCartItem(itemId: string, quantity: number) {
  try {
    const cart = await getCart()

    const updatedCart = cart.map((item) => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(1, quantity) }
      }
      return item
    })

    const cookieStore = cookies()
    await cookieStore.set("cart", JSON.stringify(updatedCart), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, cart: updatedCart }
  } catch (error) {
    console.error("Error updating cart item:", error)
    return { error: "Failed to update cart item. Please try again." }
  }
}

// Remove item from cart
export async function removeFromCart(itemId: string) {
  try {
    const cart = await getCart()

    const updatedCart = cart.filter((item) => item.id !== itemId)

    const cookieStore = cookies()
    await cookieStore.set("cart", JSON.stringify(updatedCart), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, cart: updatedCart }
  } catch (error) {
    console.error("Error removing from cart:", error)
    return { error: "Failed to remove item from cart. Please try again." }
  }
}

// Clear cart
export async function clearCart() {
  try {
    const cookieStore = cookies()
    await cookieStore.set("cart", "[]", {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    return { success: true }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return { error: "Failed to clear cart. Please try again." }
  }
}

// Calculate cart totals
export async function getCartTotals() {
  try {
    const cart = await getCart()

    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
    const shipping = subtotal > 0 ? 10 : 0 // Example shipping cost
    const total = subtotal + shipping

    return {
      subtotal,
      shipping,
      total,
      itemCount: cart.reduce((count, item) => count + item.quantity, 0),
    }
  } catch (error) {
    console.error("Error calculating cart totals:", error)
    return {
      subtotal: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
    }
  }
}
