"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { addToCart } from "@/lib/cart"

interface AddToCartButtonProps {
  productId: string
  variantId?: string
  disabled?: boolean
}

export function AddToCartButton({ productId, variantId, disabled = false }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsLoading(true)

    try {
      const result = await addToCart(productId, 1, variantId)

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
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleAddToCart} disabled={disabled || isLoading}>
      <ShoppingBag className="mr-2 h-4 w-4" />
      {isLoading ? "Adding..." : disabled ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}
