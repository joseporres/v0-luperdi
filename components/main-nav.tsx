import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Suspense } from "react"
import { getCartTotals } from "@/lib/cart"

// Create a CartIcon component to handle the async data fetching
async function CartIcon() {
  try {
    const { itemCount } = await getCartTotals()

    return (
      <Link href="/cart" className="relative">
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-black dark:bg-white text-white dark:text-black text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
        <span className="sr-only">Cart ({itemCount} items)</span>
      </Link>
    )
  } catch (error) {
    console.error("Error rendering cart icon:", error)
    // Fallback UI in case of error
    return (
      <Link href="/cart" className="relative">
        <ShoppingBag className="h-5 w-5" />
        <span className="sr-only">Cart</span>
      </Link>
    )
  }
}

export async function MainNav() {
  return (
    <nav className="hidden md:flex gap-6">
      <Link href="/shop" className="text-sm font-medium hover:underline underline-offset-4">
        Shop
      </Link>
      <Link href="/collections" className="text-sm font-medium hover:underline underline-offset-4">
        Collections
      </Link>
      <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
        About
      </Link>
      <Suspense
        fallback={
          <Link href="/cart" className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Link>
        }
      >
        <CartIcon />
      </Suspense>
    </nav>
  )
}
