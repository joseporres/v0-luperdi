"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  // Client-side cart count fetching
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        // Fetch cart count from server
        const response = await fetch("/api/cart/count")
        if (response.ok) {
          const data = await response.json()
          setCartCount(data.count)
        }
      } catch (error) {
        console.error("Error fetching cart count:", error)
      }
    }

    fetchCartCount()

    // Set up an interval to refresh the cart count
    const interval = setInterval(fetchCartCount, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Home
      </Link>
      <Link
        href="/shop"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/shop" || pathname.startsWith("/products") ? "text-primary" : "text-muted-foreground",
        )}
      >
        Shop
      </Link>
      <Link
        href="/collections"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/collections" || pathname.startsWith("/collection") ? "text-primary" : "text-muted-foreground",
        )}
      >
        Collections
      </Link>
      <Link
        href="/about"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/about" ? "text-primary" : "text-muted-foreground",
        )}
      >
        About
      </Link>
      <Link
        href="/cart"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary relative",
          pathname === "/cart" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {cartCount}
          </Badge>
        )}
        <span className="sr-only">Cart</span>
      </Link>
    </nav>
  )
}
