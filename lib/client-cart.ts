"use client"

// Client-side cart functions that don't use next/headers

// Get cart from cookies (client-side)
export function getClientCart() {
  try {
    const cartCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cart="))
      ?.split("=")[1]

    if (!cartCookie) {
      return []
    }

    return JSON.parse(decodeURIComponent(cartCookie))
  } catch (error) {
    console.error("Error getting client cart:", error)
    return []
  }
}

// Add item to cart (client-side)
export function addToClientCart(productId: string, variantId: string, quantity: number) {
  try {
    const currentCart = getClientCart()

    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(
      (item: any) => item.productId === productId && item.variantId === variantId,
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
    document.cookie = `cart=${encodeURIComponent(JSON.stringify(currentCart))}; path=/; max-age=${
      60 * 60 * 24 * 30
    }; samesite=lax`

    return { success: true }
  } catch (error) {
    console.error("Error adding to client cart:", error)
    return { error: "Failed to add item to cart" }
  }
}

// Remove item from cart (client-side)
export function removeFromClientCart(productId: string, variantId: string) {
  try {
    const currentCart = getClientCart()

    // Filter out the item to remove
    const updatedCart = currentCart.filter(
      (item: any) => !(item.productId === productId && item.variantId === variantId),
    )

    // Save updated cart to cookie
    document.cookie = `cart=${encodeURIComponent(JSON.stringify(updatedCart))}; path=/; max-age=${
      60 * 60 * 24 * 30
    }; samesite=lax`

    return { success: true }
  } catch (error) {
    console.error("Error removing from client cart:", error)
    return { error: "Failed to remove item from cart" }
  }
}

// Update cart item quantity (client-side)
export function updateClientCartItemQuantity(productId: string, variantId: string, quantity: number) {
  try {
    const currentCart = getClientCart()

    // Find the item to update
    const itemIndex = currentCart.findIndex((item: any) => item.productId === productId && item.variantId === variantId)

    if (itemIndex === -1) {
      return { success: false, error: "Item not found in cart" }
    }

    // Update quantity
    currentCart[itemIndex].quantity = quantity

    // Save updated cart to cookie
    document.cookie = `cart=${encodeURIComponent(JSON.stringify(currentCart))}; path=/; max-age=${
      60 * 60 * 24 * 30
    }; samesite=lax`

    return { success: true }
  } catch (error) {
    console.error("Error updating client cart item quantity:", error)
    return { error: "Failed to update item quantity" }
  }
}

// Clear cart (client-side)
export function clearClientCart() {
  try {
    // Remove cart cookie
    document.cookie = "cart=; path=/; max-age=0; samesite=lax"

    return { success: true }
  } catch (error) {
    console.error("Error clearing client cart:", error)
    return { error: "Failed to clear cart" }
  }
}
