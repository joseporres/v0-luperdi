"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addToCart } from "@/lib/cart"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface AddToCartButtonProps {
  productId: string
  variantId?: string | null
  disabled?: boolean
  stockCount?: number
}

export function AddToCartButton({
  productId,
  variantId = null,
  disabled = false,
  stockCount = 0,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1)
  }, [variantId])

  const handleAddToCart = async () => {
    if (disabled || !variantId) return

    setIsAdding(true)
    try {
      const result = await addToCart(productId, quantity, variantId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Added to cart",
          description: `${quantity} item${quantity > 1 ? "s" : ""} added to your cart`,
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const incrementQuantity = () => {
    if (stockCount && quantity < stockCount) {
      setQuantity(quantity + 1)
    }
  }

  const isOutOfStock = disabled || stockCount <= 0

  return (
    <div className="flex flex-col space-y-4">
      {!isOutOfStock && (
        <div className="flex items-center space-x-2">
          <div className="flex items-center border rounded-md">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || isAdding}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <div className="w-12 text-center text-sm">{quantity}</div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={incrementQuantity}
              disabled={stockCount ? quantity >= stockCount : false || isAdding}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
          {stockCount > 0 && (
            <span className="text-sm text-neutral-500">
              {stockCount <= 5 ? (
                <span className="text-amber-600 dark:text-amber-400">Only {stockCount} left</span>
              ) : (
                `${stockCount} available`
              )}
            </span>
          )}
        </div>
      )}
      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAdding || quantity <= 0 || (stockCount && quantity > stockCount)}
        className="w-full"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isAdding ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  )
}
