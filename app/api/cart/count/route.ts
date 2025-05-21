import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const cartCookie = cookieStore.get("cart")

    if (!cartCookie?.value) {
      return NextResponse.json({ count: 0 })
    }

    // Parse cart items from cookie
    const cartItems = JSON.parse(decodeURIComponent(cartCookie.value))

    // Calculate total items in cart
    const count = cartItems.reduce((total: number, item: any) => total + (item.quantity || 1), 0)

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error getting cart count:", error)
    return NextResponse.json({ count: 0 })
  }
}
