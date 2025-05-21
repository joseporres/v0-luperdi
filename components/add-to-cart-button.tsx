"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { addToClientCart } from "@/lib/client-cart"

interface AddToCartButtonProps {
  productId: string
  variantId: string
  disabled?: boolean
  quantity?: number
}

export function AddToCartButton({ productId, variantId, disabled = false, quantity = 1 }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAddToCart = async () => {
    if (disabled) return

    setIsLoading(true)

    try {
      // Use client-side cart function
      const result = addToClientCart(productId, variantId, quantity)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Added to cart",
          description: "Item has been added to your cart",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={disabled || isLoading} className="w-full" size="lg">
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  )
}
