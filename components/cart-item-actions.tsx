"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { removeFromClientCart, updateClientCartItemQuantity } from "@/lib/client-cart"

interface CartItemActionsProps {
  productId: string
  variantId: string
  quantity: number
  onUpdate?: () => void
}

export function CartItemActions({ productId, variantId, quantity, onUpdate }: CartItemActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRemove = async () => {
    setIsLoading(true)

    try {
      // Use client-side cart function
      const result = removeFromClientCart(productId, variantId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart",
        })
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return

    setIsLoading(true)

    try {
      // Use client-side cart function
      const result = updateClientCartItemQuantity(productId, variantId, newQuantity)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update item quantity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center border rounded-md">
        <Button
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1 || isLoading}
        >
          -
        </Button>
        <span className="w-8 text-center">{quantity}</span>
        <Button
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={isLoading}
        >
          +
        </Button>
      </div>
      <Button variant="outline" size="sm" onClick={handleRemove} disabled={isLoading}>
        <Trash className="h-4 w-4" />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
  )
}
